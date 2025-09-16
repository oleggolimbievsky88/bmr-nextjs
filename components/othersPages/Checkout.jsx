"use client";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Checkout() {
  const {
    cartProducts,
    setCartProducts,
    totalPrice,
    appliedCoupon,
    couponDiscount,
    freeShipping,
    applyCoupon,
    removeCoupon,
  } = useContextElement();

  const [activeStep, setActiveStep] = useState("billing");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(true);

  // Form data states
  const [billingData, setBillingData] = useState({
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

  const [shippingData, setShippingData] = useState({
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

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
  });

  const handleCouponApply = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    const result = await applyCoupon(couponCode);
    if (result.success) {
      setCouponError("");
    } else {
      setCouponError(result.message);
    }
  };

  const handleContinue = () => {
    if (activeStep === "billing") {
      setActiveStep("shipping");
    } else if (activeStep === "shipping") {
      setActiveStep("payment");
    }
  };

  const handleBack = () => {
    if (activeStep === "shipping") {
      setActiveStep("billing");
    } else if (activeStep === "payment") {
      setActiveStep("shipping");
    }
  };

  const calculateSubtotal = () => {
    return cartProducts.reduce((total, item) => {
      const basePrice = parseFloat(item.Price || 0);
      const quantity = parseInt(item.quantity || 1);

      let addOnPrice = 0;
      if (item.selectedGrease?.GreasePrice) {
        addOnPrice += parseFloat(item.selectedGrease.GreasePrice);
      }
      if (item.selectedAnglefinder?.AnglePrice) {
        addOnPrice += parseFloat(item.selectedAnglefinder.AnglePrice);
      }
      if (item.selectedHardware?.HardwarePrice) {
        addOnPrice += parseFloat(item.selectedHardware.HardwarePrice);
      }

      return total + (basePrice + addOnPrice) * quantity;
    }, 0);
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = freeShipping ? 0 : 0; // Free shipping for BMR products
    const tax = 0; // No tax for now
    return subtotal + shipping + tax - couponDiscount;
  };

  return (
    <section className="flat-spacing-11">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h2
              className="text-center mb-5 mt-0"
              style={{
                fontFamily: "Impact",
                fontWeight: "600",
                color: "#000000",
                letterSpacing: "1.5px",
              }}
            >
              CHECKOUT
            </h2>
          </div>
        </div>

        <div className="row">
          {/* Left Column - Checkout Steps */}
          <div className="col-lg-8">
            <div className="checkout-steps">
              {/* Billing Section */}
              <div
                className={`checkout-step ${
                  activeStep === "billing" ? "active" : ""
                }`}
              >
                <div className="step-header">
                  <h3>Billing</h3>
                  <div className="step-line"></div>
                </div>

                {activeStep === "billing" && (
                  <div className="step-content">
                    <form className="checkout-form">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="billing-first-name">
                              First Name
                            </label>
                            <input
                              type="text"
                              id="billing-first-name"
                              value={billingData.firstName}
                              onChange={(e) =>
                                setBillingData({
                                  ...billingData,
                                  firstName: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="billing-last-name">Last Name</label>
                            <input
                              type="text"
                              id="billing-last-name"
                              value={billingData.lastName}
                              onChange={(e) =>
                                setBillingData({
                                  ...billingData,
                                  lastName: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="billing-address1">Address Line 1</label>
                        <input
                          type="text"
                          id="billing-address1"
                          value={billingData.address1}
                          onChange={(e) =>
                            setBillingData({
                              ...billingData,
                              address1: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="billing-address2">Address Line 2</label>
                        <input
                          type="text"
                          id="billing-address2"
                          value={billingData.address2}
                          onChange={(e) =>
                            setBillingData({
                              ...billingData,
                              address2: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="billing-city">City</label>
                        <input
                          type="text"
                          id="billing-city"
                          value={billingData.city}
                          onChange={(e) =>
                            setBillingData({
                              ...billingData,
                              city: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="billing-country">Country</label>
                        <select
                          id="billing-country"
                          value={billingData.country}
                          onChange={(e) =>
                            setBillingData({
                              ...billingData,
                              country: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                        </select>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="billing-zip">Zip Code</label>
                            <input
                              type="text"
                              id="billing-zip"
                              value={billingData.zip}
                              onChange={(e) =>
                                setBillingData({
                                  ...billingData,
                                  zip: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="billing-state">State</label>
                            <select
                              id="billing-state"
                              value={billingData.state}
                              onChange={(e) =>
                                setBillingData({
                                  ...billingData,
                                  state: e.target.value,
                                })
                              }
                              required
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
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="billing-phone">Phone Number</label>
                            <input
                              type="tel"
                              id="billing-phone"
                              value={billingData.phone}
                              onChange={(e) =>
                                setBillingData({
                                  ...billingData,
                                  phone: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="billing-email">Email Address</label>
                            <input
                              type="email"
                              id="billing-email"
                              value={billingData.email}
                              onChange={(e) =>
                                setBillingData({
                                  ...billingData,
                                  email: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-center mt-4">
                        <button
                          type="button"
                          className="btn btn-danger btn-lg"
                          onClick={handleContinue}
                        >
                          Continue
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Shipping Section */}
              <div
                className={`checkout-step ${
                  activeStep === "shipping" ? "active" : ""
                }`}
              >
                <div className="step-header">
                  <h3>Shipping</h3>
                  <div className="step-line"></div>
                </div>

                {activeStep === "shipping" && (
                  <div className="step-content">
                    <form className="checkout-form">
                      <div className="form-group mb-3">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={sameAsBilling}
                            onChange={(e) => setSameAsBilling(e.target.checked)}
                          />
                          Same as billing address?
                        </label>
                      </div>

                      {!sameAsBilling && (
                        <>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="shipping-first-name">
                                  First Name
                                </label>
                                <input
                                  type="text"
                                  id="shipping-first-name"
                                  value={shippingData.firstName}
                                  onChange={(e) =>
                                    setShippingData({
                                      ...shippingData,
                                      firstName: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="shipping-last-name">
                                  Last Name
                                </label>
                                <input
                                  type="text"
                                  id="shipping-last-name"
                                  value={shippingData.lastName}
                                  onChange={(e) =>
                                    setShippingData({
                                      ...shippingData,
                                      lastName: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="shipping-address1">
                              Address Line 1
                            </label>
                            <input
                              type="text"
                              id="shipping-address1"
                              value={shippingData.address1}
                              onChange={(e) =>
                                setShippingData({
                                  ...shippingData,
                                  address1: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="shipping-address2">
                              Address Line 2
                            </label>
                            <input
                              type="text"
                              id="shipping-address2"
                              value={shippingData.address2}
                              onChange={(e) =>
                                setShippingData({
                                  ...shippingData,
                                  address2: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="shipping-city">City</label>
                            <input
                              type="text"
                              id="shipping-city"
                              value={shippingData.city}
                              onChange={(e) =>
                                setShippingData({
                                  ...shippingData,
                                  city: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="shipping-country">Country</label>
                            <select
                              id="shipping-country"
                              value={shippingData.country}
                              onChange={(e) =>
                                setShippingData({
                                  ...shippingData,
                                  country: e.target.value,
                                })
                              }
                              required
                            >
                              <option value="United States">
                                United States
                              </option>
                              <option value="Canada">Canada</option>
                            </select>
                          </div>

                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="shipping-zip">Zip Code</label>
                                <input
                                  type="text"
                                  id="shipping-zip"
                                  value={shippingData.zip}
                                  onChange={(e) =>
                                    setShippingData({
                                      ...shippingData,
                                      zip: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="shipping-state">State</label>
                                <select
                                  id="shipping-state"
                                  value={shippingData.state}
                                  onChange={(e) =>
                                    setShippingData({
                                      ...shippingData,
                                      state: e.target.value,
                                    })
                                  }
                                  required
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
                              </div>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="shipping-phone">
                                  Phone Number
                                </label>
                                <input
                                  type="tel"
                                  id="shipping-phone"
                                  value={shippingData.phone}
                                  onChange={(e) =>
                                    setShippingData({
                                      ...shippingData,
                                      phone: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="shipping-email">
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  id="shipping-email"
                                  value={shippingData.email}
                                  onChange={(e) =>
                                    setShippingData({
                                      ...shippingData,
                                      email: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="form-group">
                        <label htmlFor="shipping-options">
                          Shipping Options
                        </label>
                        <select id="shipping-options" className="form-control">
                          <option value="free">
                            FREE SHIPPING - UPS Ground
                          </option>
                        </select>
                      </div>

                      <div className="d-flex justify-content-between mt-4">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleBack}
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-lg"
                          onClick={handleContinue}
                        >
                          Continue
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Payment Section */}
              <div
                className={`checkout-step ${
                  activeStep === "payment" ? "active" : ""
                }`}
              >
                <div className="step-header">
                  <h3>Payment</h3>
                  <div className="step-line"></div>
                </div>

                {activeStep === "payment" && (
                  <div className="step-content">
                    <form className="checkout-form">
                      <div className="form-group">
                        <label htmlFor="card-number">Card Number</label>
                        <input
                          type="text"
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          value={paymentData.cardNumber}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              cardNumber: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="expiry-date">Expiry Date</label>
                            <input
                              type="text"
                              id="expiry-date"
                              placeholder="MM/YY"
                              value={paymentData.expiryDate}
                              onChange={(e) =>
                                setPaymentData({
                                  ...paymentData,
                                  expiryDate: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="cvv">CVV</label>
                            <input
                              type="text"
                              id="cvv"
                              placeholder="123"
                              value={paymentData.cvv}
                              onChange={(e) =>
                                setPaymentData({
                                  ...paymentData,
                                  cvv: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="name-on-card">Name on Card</label>
                        <input
                          type="text"
                          id="name-on-card"
                          value={paymentData.nameOnCard}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              nameOnCard: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="d-flex justify-content-between mt-4">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleBack}
                        >
                          Back
                        </button>
                        <button type="button" className="btn btn-danger btn-lg">
                          Place Order
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="col-lg-4">
            <div className="order-summary">
              <div className="summary-header">
                <h5>ORDER SUMMARY</h5>
                <Link href="/view-cart" className="edit-cart-link">
                  EDIT CART
                </Link>
              </div>

              <div className="summary-items">
                {cartProducts.map((item, index) => (
                  <div key={index} className="summary-item">
                    <div className="item-image">
                      <Image
                        alt={item.ProductName || "Product"}
                        src={(() => {
                          if (
                            item.selectedColor &&
                            item.images &&
                            item.images.length > 0
                          ) {
                            let imageIndex = 0;
                            if (item.selectedColor.ColorID === 1) {
                              imageIndex = Math.min(1, item.images.length - 1);
                            } else if (item.selectedColor.ColorID === 2) {
                              imageIndex = 0;
                            }
                            const colorImageSrc =
                              item.images[imageIndex]?.imgSrc ||
                              item.images[0]?.imgSrc;
                            if (colorImageSrc && colorImageSrc.trim() !== "") {
                              return colorImageSrc;
                            }
                          }
                          if (
                            item.images?.[0]?.imgSrc &&
                            item.images[0].imgSrc.trim() !== ""
                          ) {
                            return item.images[0].imgSrc;
                          }
                          if (
                            item.ImageLarge &&
                            item.ImageLarge.trim() !== "" &&
                            item.ImageLarge !== "0"
                          ) {
                            return `https://bmrsuspension.com/siteart/products/${item.ImageLarge}`;
                          }
                          return "/images/logo/bmr_logo_square_small.webp";
                        })()}
                        width={80}
                        height={80}
                      />
                    </div>
                    <div className="item-details">
                      <h6>{item.ProductName}</h6>
                      <p className="item-part">Part #: {item.PartNumber}</p>
                      <p className="item-platform">{item.PlatformName}</p>
                      <p className="item-color">
                        {item.selectedColor
                          ? item.selectedColor.ColorName
                          : "Default"}
                      </p>
                      <div className="quantity-controls">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity > 1) {
                              const updatedCart = cartProducts.map(
                                (cartItem, i) =>
                                  i === index
                                    ? {
                                        ...cartItem,
                                        quantity: cartItem.quantity - 1,
                                      }
                                    : cartItem
                              );
                              setCartProducts(updatedCart);
                            }
                          }}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedCart = cartProducts.map(
                              (cartItem, i) =>
                                i === index
                                  ? {
                                      ...cartItem,
                                      quantity: cartItem.quantity + 1,
                                    }
                                  : cartItem
                            );
                            setCartProducts(updatedCart);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="item-price">
                      $
                      {((parseFloat(item.Price) || 0) * item.quantity).toFixed(
                        2
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {cartProducts.length === 0 && (
                <div className="empty-cart">
                  <p>Your shop cart is empty</p>
                  <Link href="/shop-default" className="btn btn-primary">
                    Explore Products!
                  </Link>
                </div>
              )}

              <div className="coupon-section">
                <p>Have a coupon code? Enter it here!</p>
                <div className="coupon-input">
                  <input
                    type="text"
                    placeholder="Type here..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleCouponApply}
                    className="btn btn-sm btn-primary"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-danger">{couponError}</p>}
              </div>

              <div className="order-totals">
                <div className="total-line">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="total-line">
                  <span>Shipping:</span>
                  <span>$0.00</span>
                </div>
                {appliedCoupon && (
                  <div className="total-line coupon-discount">
                    <span>Coupon ({appliedCoupon.CouponCode}):</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="total-line">
                  <span>Gift Certificate:</span>
                  <span>$0.00</span>
                </div>
                <div className="total-line">
                  <span>Tax:</span>
                  <span>$0.00</span>
                </div>
                <div className="total-line grand-total">
                  <span>Grand Total:</span>
                  <span>${calculateGrandTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="terms-checkbox">
                <label>
                  <input type="checkbox" required />I agree to BMR Suspension's{" "}
                  <Link href="/terms-conditions">Terms & Conditions</Link>
                </label>
              </div>

              <button
                className="btn btn-primary btn-lg w-100 place-order-btn"
                disabled={activeStep !== "payment"}
              >
                PLACE ORDER
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
