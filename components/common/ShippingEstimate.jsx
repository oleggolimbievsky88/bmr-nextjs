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
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    phone: "",
    email: "",
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
        "Please enter at least address, city, and postal code before calculating shipping estimate."
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
      firstName: estimateAddress.firstName || "Customer",
      lastName: estimateAddress.lastName || "",
      address1: estimateAddress.address1,
      city: estimateAddress.city,
      state: estimateAddress.state || "",
      zip: estimateAddress.zip,
      country: getCountryCode(estimateAddress.country),
    };

    // Create packages based on cart items
    // If cart is empty, use a default package for estimate purposes
    const packages =
      cartProducts.length > 0
        ? cartProducts.map((item) => ({
            weight: 1, // Default weight, could be calculated from product data
            length: 10,
            width: 10,
            height: 10,
          }))
        : [
            {
              weight: 1, // Default 1 lb package for estimate
              length: 10,
              width: 10,
              height: 10,
            },
          ];

    const result = await calculateShippingRates(
      fromAddress,
      toAddress,
      packages
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
      firstName: "",
      lastName: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      country: "United States",
      phone: "",
      email: "",
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
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="estimate-first-name">
                      First Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="estimate-first-name"
                      value={estimateAddress.firstName}
                      onChange={(e) =>
                        setEstimateAddress({
                          ...estimateAddress,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="estimate-last-name">
                      Last Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="estimate-last-name"
                      value={estimateAddress.lastName}
                      onChange={(e) =>
                        setEstimateAddress({
                          ...estimateAddress,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

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
                  value={estimateAddress.city}
                  onChange={(e) =>
                    setEstimateAddress({
                      ...estimateAddress,
                      city: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="estimate-country">Country*</label>
                <select
                  id="estimate-country"
                  value={estimateAddress.country}
                  onChange={(e) =>
                    setEstimateAddress({
                      ...estimateAddress,
                      country: e.target.value,
                    })
                  }
                  required
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
                    <label htmlFor="estimate-zip">Postal Code*</label>
                    <input
                      type="text"
                      id="estimate-zip"
                      value={estimateAddress.zip}
                      onChange={(e) =>
                        setEstimateAddress({
                          ...estimateAddress,
                          zip: e.target.value,
                        })
                      }
                      required
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
                    <input
                      type="text"
                      id="estimate-state"
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
                    />
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
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="estimate-first-name-inline">
                    First Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="estimate-first-name-inline"
                    className="form-control"
                    value={estimateAddress.firstName}
                    onChange={(e) =>
                      setEstimateAddress({
                        ...estimateAddress,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="estimate-last-name-inline">
                    Last Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="estimate-last-name-inline"
                    className="form-control"
                    value={estimateAddress.lastName}
                    onChange={(e) =>
                      setEstimateAddress({
                        ...estimateAddress,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

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
                  <label htmlFor="estimate-zip-inline">Postal Code*</label>
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
                  />
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
