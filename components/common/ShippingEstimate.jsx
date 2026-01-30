"use client";
import { useState, useCallback } from "react";
import { useShippingRates } from "@/hooks/useShippingRates";
import { useContextElement } from "@/context/Context";
import { countries, getCountryCode } from "@/lib/countryCodes";
import AddressAutocomplete from "./AddressAutocomplete";

export default function ShippingEstimate({
  inline = true,
  onEstimateComplete,
}) {
  const { cartProducts = [] } = useContextElement();
  const [showForm, setShowForm] = useState(false); // Collapsed by default
  const [estimateAddress, setEstimateAddress] = useState({
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
  });
  const [addressValid, setAddressValid] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const {
    calculateShippingRates,
    isLoading: shippingLoading,
    shippingOptions,
    error: shippingError,
    clearShippingRates,
  } = useShippingRates();

  const handleCalculateEstimate = useCallback(async () => {
    // Validate required fields manually (don't require Google API validation)
    if (
      !estimateAddress.address1 ||
      !estimateAddress.city ||
      !estimateAddress.zip
    ) {
      alert(
        "Please enter at least address, city, and postal code before calculating shipping estimate.",
      );
      return;
    }

    // For US/Canada, state is required
    if (
      (estimateAddress.country === "United States" ||
        estimateAddress.country === "Canada") &&
      !estimateAddress.state
    ) {
      alert("Please enter state/province for US/Canada addresses.");
      return;
    }

    const fromAddress = {
      address1: "1033 Pine Chase Ave",
      city: "Lakeland",
      state: "FL",
      zip: "33815",
      country: "US",
    };

    const toAddress = {
      firstName: "Customer",
      lastName: "",
      address1: estimateAddress.address1,
      address2: estimateAddress.address2 || "",
      city: estimateAddress.city,
      state: estimateAddress.state || "",
      zip: estimateAddress.zip,
      country: getCountryCode(estimateAddress.country),
    };

    // One package per physical box: each cart line ships quantity boxes (preboxed)
    let packages = [];
    if (cartProducts.length > 0) {
      cartProducts.forEach((item) => {
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        const weight = Math.max(1, parseInt(item.Bweight, 10) || 1);
        const length = Math.max(1, parseInt(item.Blength, 10) || 10);
        const width = Math.max(1, parseInt(item.Bwidth, 10) || 10);
        const height = Math.max(1, parseInt(item.Bheight, 10) || 10);
        for (let i = 0; i < qty; i++) {
          packages.push({ weight, length, width, height });
        }
      });
    } else {
      packages = [
        {
          weight: 1,
          length: 10,
          width: 10,
          height: 10,
        },
      ];
    }
    const productIds = cartProducts
      .map((item) => item.ProductID)
      .filter(Boolean);

    const result = await calculateShippingRates(
      fromAddress,
      toAddress,
      packages,
      productIds,
    );

    if (onEstimateComplete && result?.shippingOptions) {
      onEstimateComplete(result.shippingOptions);
    }
  }, [
    estimateAddress,
    cartProducts,
    calculateShippingRates,
    onEstimateComplete,
  ]);

  const handleReset = () => {
    setEstimateAddress({
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      country: "United States",
    });
    setAddressValid(false);
    setValidationError(null);
    clearShippingRates();
  };

  // Handle address validation completion (optional - don't block on errors)
  const handleValidationComplete = (result) => {
    if (result && !result.error) {
      setAddressValid(result.isValid);
      setValidationError(null);
    } else {
      // If validation fails, don't block - just note it
      setValidationError(result?.error || "Address validation unavailable");
      setAddressValid(false); // Allow manual entry even if validation fails
    }
  };

  if (!inline) {
    // Modal version
    return (
      <div className="shipping-estimate-modal">
        <div className="shipping-estimate-header">
          <h4>Get Shipping Estimate</h4>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowForm(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="shipping-estimate-content">
          {showForm ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCalculateEstimate();
              }}
            >
              <AddressAutocomplete
                address={estimateAddress}
                onAddressChange={setEstimateAddress}
                onValidationComplete={handleValidationComplete}
                label="Shipping Address"
                placeholder="Enter your shipping address"
                required={true}
              />
              {validationError && (
                <div className="alert alert-info mt-2 small">
                  Note: Address validation unavailable. You can still proceed
                  with manual entry.
                </div>
              )}

              <div className="form-group">
                <label htmlFor="estimate-city">City*</label>
                <input
                  type="text"
                  id="estimate-city"
                  className="form-control"
                  value={estimateAddress.city}
                  onChange={(e) =>
                    setEstimateAddress({
                      ...estimateAddress,
                      city: e.target.value,
                    })
                  }
                  required
                  suppressHydrationWarning
                />
              </div>

              <div className="form-group">
                <label htmlFor="estimate-country">Country*</label>
                <select
                  id="estimate-country"
                  className="form-control"
                  value={estimateAddress.country}
                  onChange={(e) =>
                    setEstimateAddress({
                      ...estimateAddress,
                      country: e.target.value,
                    })
                  }
                  required
                  suppressHydrationWarning
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="estimate-zip">Zip Code*</label>
                    <input
                      type="text"
                      id="estimate-zip"
                      className="form-control"
                      value={estimateAddress.zip}
                      onChange={(e) =>
                        setEstimateAddress({
                          ...estimateAddress,
                          zip: e.target.value,
                        })
                      }
                      required
                      suppressHydrationWarning
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="estimate-state">
                      {estimateAddress.country === "United States" ||
                      estimateAddress.country === "Canada"
                        ? "State/Province*"
                        : "State/Province (Optional)"}
                    </label>
                    {estimateAddress.country === "United States" ? (
                      <select
                        id="estimate-state"
                        className="form-control"
                        value={estimateAddress.state}
                        onChange={(e) =>
                          setEstimateAddress({
                            ...estimateAddress,
                            state: e.target.value,
                          })
                        }
                        required
                        suppressHydrationWarning
                      >
                        <option value="">Select State</option>
                        <option value="AL">Alabama</option>
                        <option value="AK">Alaska</option>
                        <option value="AZ">Arizona</option>
                        <option value="AR">Arkansas</option>
                        <option value="CA">California</option>
                        <option value="CO">Colorado</option>
                        <option value="CT">Connecticut</option>
                        <option value="DE">Delaware</option>
                        <option value="FL">Florida</option>
                        <option value="GA">Georgia</option>
                        <option value="HI">Hawaii</option>
                        <option value="ID">Idaho</option>
                        <option value="IL">Illinois</option>
                        <option value="IN">Indiana</option>
                        <option value="IA">Iowa</option>
                        <option value="KS">Kansas</option>
                        <option value="KY">Kentucky</option>
                        <option value="LA">Louisiana</option>
                        <option value="ME">Maine</option>
                        <option value="MD">Maryland</option>
                        <option value="MA">Massachusetts</option>
                        <option value="MI">Michigan</option>
                        <option value="MN">Minnesota</option>
                        <option value="MS">Mississippi</option>
                        <option value="MO">Missouri</option>
                        <option value="MT">Montana</option>
                        <option value="NE">Nebraska</option>
                        <option value="NV">Nevada</option>
                        <option value="NH">New Hampshire</option>
                        <option value="NJ">New Jersey</option>
                        <option value="NM">New Mexico</option>
                        <option value="NY">New York</option>
                        <option value="NC">North Carolina</option>
                        <option value="ND">North Dakota</option>
                        <option value="OH">Ohio</option>
                        <option value="OK">Oklahoma</option>
                        <option value="OR">Oregon</option>
                        <option value="PA">Pennsylvania</option>
                        <option value="RI">Rhode Island</option>
                        <option value="SC">South Carolina</option>
                        <option value="SD">South Dakota</option>
                        <option value="TN">Tennessee</option>
                        <option value="TX">Texas</option>
                        <option value="UT">Utah</option>
                        <option value="VT">Vermont</option>
                        <option value="VA">Virginia</option>
                        <option value="WA">Washington</option>
                        <option value="WV">West Virginia</option>
                        <option value="WI">Wisconsin</option>
                        <option value="WY">Wyoming</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        id="estimate-state"
                        className="form-control"
                        value={estimateAddress.state}
                        onChange={(e) =>
                          setEstimateAddress({
                            ...estimateAddress,
                            state: e.target.value,
                          })
                        }
                        required={
                          estimateAddress.country === "United States" ||
                          estimateAddress.country === "Canada"
                        }
                        suppressHydrationWarning
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={shippingLoading}
                >
                  {shippingLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Calculating...
                    </>
                  ) : (
                    "Estimate"
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </form>
          ) : null}

          {shippingOptions.length > 0 && (
            <div className="shipping-estimate-results mt-4">
              <h5>Shipping Options:</h5>
              {shippingOptions.map((option, index) => (
                <div key={index} className="shipping-option-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{option.service}</strong>
                      {option.cost === 0 && (
                        <span className="badge bg-success ms-2">FREE</span>
                      )}
                      <p className="mb-0 text-muted small">
                        {option.description} • {option.deliveryDays}
                      </p>
                    </div>
                    <div className="shipping-cost">
                      {option.cost > 0 ? (
                        <strong>
                          {option.currency || "USD"} ${option.cost.toFixed(2)}
                        </strong>
                      ) : (
                        <strong className="text-success">FREE</strong>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {shippingError && (
            <div className="alert alert-warning mt-3">{shippingError}</div>
          )}
        </div>
      </div>
    );
  }

  // Inline version
  return (
    <div className="shipping-estimate-inline border rounded p-3 mb-3">
      <div className="shipping-estimate-header-inline d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Shipping Estimate</h5>
        <button
          type="button"
          className="btn btn-sm btn-link p-0"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Hide" : "Show"}
        </button>
      </div>
      {cartProducts.length === 0 && (
        <p className="text-muted small mb-2">
          Note: Estimate will be calculated based on a standard package size.
        </p>
      )}

      {showForm && (
        <div className="shipping-estimate-form mt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCalculateEstimate();
            }}
          >
            <AddressAutocomplete
              address={estimateAddress}
              onAddressChange={setEstimateAddress}
              onValidationComplete={handleValidationComplete}
              label="Shipping Address"
              placeholder="Enter your shipping address"
              required={true}
            />
            {validationError && (
              <div className="alert alert-info mt-2 small">
                Note: Address validation unavailable. You can still proceed with
                manual entry.
              </div>
            )}

            <div className="form-group">
              <label htmlFor="estimate-city-inline">City*</label>
              <input
                type="text"
                id="estimate-city-inline"
                className="form-control"
                value={estimateAddress.city}
                onChange={(e) =>
                  setEstimateAddress({
                    ...estimateAddress,
                    city: e.target.value,
                  })
                }
                required
                suppressHydrationWarning
              />
            </div>

            <div className="form-group">
              <label htmlFor="estimate-country-inline">Country*</label>
              <select
                id="estimate-country-inline"
                className="form-control"
                value={estimateAddress.country}
                onChange={(e) =>
                  setEstimateAddress({
                    ...estimateAddress,
                    country: e.target.value,
                  })
                }
                required
                suppressHydrationWarning
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="estimate-zip-inline">Zip Code*</label>
                  <input
                    type="text"
                    id="estimate-zip-inline"
                    className="form-control"
                    value={estimateAddress.zip}
                    onChange={(e) =>
                      setEstimateAddress({
                        ...estimateAddress,
                        zip: e.target.value,
                      })
                    }
                    required
                    suppressHydrationWarning
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="estimate-state-inline">
                    {estimateAddress.country === "United States" ||
                    estimateAddress.country === "Canada"
                      ? "State/Province*"
                      : "State/Province (Optional)"}
                  </label>
                  {estimateAddress.country === "United States" ? (
                    <select
                      id="estimate-state-inline"
                      className="form-control"
                      value={estimateAddress.state}
                      onChange={(e) =>
                        setEstimateAddress({
                          ...estimateAddress,
                          state: e.target.value,
                        })
                      }
                      required
                      suppressHydrationWarning
                    >
                      <option value="">Select State</option>
                      <option value="AL">Alabama</option>
                      <option value="AK">Alaska</option>
                      <option value="AZ">Arizona</option>
                      <option value="AR">Arkansas</option>
                      <option value="CA">California</option>
                      <option value="CO">Colorado</option>
                      <option value="CT">Connecticut</option>
                      <option value="DE">Delaware</option>
                      <option value="FL">Florida</option>
                      <option value="GA">Georgia</option>
                      <option value="HI">Hawaii</option>
                      <option value="ID">Idaho</option>
                      <option value="IL">Illinois</option>
                      <option value="IN">Indiana</option>
                      <option value="IA">Iowa</option>
                      <option value="KS">Kansas</option>
                      <option value="KY">Kentucky</option>
                      <option value="LA">Louisiana</option>
                      <option value="ME">Maine</option>
                      <option value="MD">Maryland</option>
                      <option value="MA">Massachusetts</option>
                      <option value="MI">Michigan</option>
                      <option value="MN">Minnesota</option>
                      <option value="MS">Mississippi</option>
                      <option value="MO">Missouri</option>
                      <option value="MT">Montana</option>
                      <option value="NE">Nebraska</option>
                      <option value="NV">Nevada</option>
                      <option value="NH">New Hampshire</option>
                      <option value="NJ">New Jersey</option>
                      <option value="NM">New Mexico</option>
                      <option value="NY">New York</option>
                      <option value="NC">North Carolina</option>
                      <option value="ND">North Dakota</option>
                      <option value="OH">Ohio</option>
                      <option value="OK">Oklahoma</option>
                      <option value="OR">Oregon</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="RI">Rhode Island</option>
                      <option value="SC">South Carolina</option>
                      <option value="SD">South Dakota</option>
                      <option value="TN">Tennessee</option>
                      <option value="TX">Texas</option>
                      <option value="UT">Utah</option>
                      <option value="VT">Vermont</option>
                      <option value="VA">Virginia</option>
                      <option value="WA">Washington</option>
                      <option value="WV">West Virginia</option>
                      <option value="WI">Wisconsin</option>
                      <option value="WY">Wyoming</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      id="estimate-state-inline"
                      className="form-control"
                      value={estimateAddress.state}
                      onChange={(e) =>
                        setEstimateAddress({
                          ...estimateAddress,
                          state: e.target.value,
                        })
                      }
                      required={
                        estimateAddress.country === "United States" ||
                        estimateAddress.country === "Canada"
                      }
                      suppressHydrationWarning
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button
                type="submit"
                className="btn btn-danger"
                disabled={shippingLoading}
              >
                {shippingLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Calculating...
                  </>
                ) : (
                  "Get Estimate"
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </form>

          {shippingOptions.length > 0 && (
            <div className="shipping-estimate-results mt-4">
              <h6>Shipping Options:</h6>
              {shippingOptions.map((option, index) => (
                <div
                  key={index}
                  className="shipping-option-card mb-2 p-3 border rounded"
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{option.service}</strong>
                      {option.cost === 0 && (
                        <span className="badge bg-success ms-2">FREE</span>
                      )}
                      <p className="mb-0 text-muted small">
                        {option.description} • {option.deliveryDays}
                      </p>
                    </div>
                    <div className="shipping-cost">
                      {option.cost > 0 ? (
                        <strong>
                          {option.currency || "USD"} ${option.cost.toFixed(2)}
                        </strong>
                      ) : (
                        <strong className="text-success">FREE</strong>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {shippingError && (
            <div className="alert alert-warning mt-3">{shippingError}</div>
          )}
        </div>
      )}
    </div>
  );
}
