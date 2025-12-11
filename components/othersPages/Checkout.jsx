"use client";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AddressAutocomplete from "@/components/common/AddressAutocomplete";
import CartSkeleton from "@/components/common/CartSkeleton";
import CreditCardIcons from "@/components/common/CreditCardIcons";
import { useAddressValidation } from "@/hooks/useAddressValidation";
import { useShippingRates } from "@/hooks/useShippingRates";
import { useCreditCard } from "@/hooks/useCreditCard";
import CouponSuccessModal from "@/components/modals/CouponSuccessModal";
import ShippingEstimate from "@/components/common/ShippingEstimate";

export default function Checkout() {
  const router = useRouter();
  const {
    cartProducts,
    setCartProducts,
    cartLoading,
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
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [billingAddressValid, setBillingAddressValid] = useState(false);
  const [shippingAddressValid, setShippingAddressValid] = useState(false);

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

  // Payment validation states
  const [expiryValid, setExpiryValid] = useState(false);
  const [expiryMessage, setExpiryMessage] = useState("");
  const [cvvValid, setCvvValid] = useState(false);
  const [cvvMessage, setCvvMessage] = useState("");

  // Order submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [emailConsent, setEmailConsent] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Ref to prevent infinite loops when calculating shipping rates
  const isCalculatingShippingRef = useRef(false);
  const lastShippingAddressRef = useRef("");

  // Shipping rates hook
  const {
    calculateShippingRates,
    isLoading: shippingLoading,
    shippingOptions,
    selectedOption,
    selectShippingOption,
    error: shippingError,
  } = useShippingRates();

  // Credit card hook
  const {
    detectedType,
    isValid: cardValid,
    validationMessage,
    handleCardNumberChange,
    formatExpiryDate,
    validateExpiryDate,
    validateCVV,
  } = useCreditCard();

  // Redirect to products page if cart is empty (but not when redirecting to confirmation)
  useEffect(() => {
    if (!cartLoading && cartProducts.length === 0 && !isRedirecting) {
      router.push("/products");
    }
  }, [cartLoading, cartProducts.length, router, isRedirecting]);

  const calculateShippingRatesForCurrentAddress = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isCalculatingShippingRef.current) {
      return;
    }

    const fromAddress = {
      address1: "1033 Pine Chase Ave",
      city: "Lakeland",
      state: "FL",
      zip: "33815",
      country: "US",
    };

    const toAddress = sameAsBilling ? billingData : shippingData;

    // Create a unique key for this address to prevent duplicate calculations
    const addressKey = `${toAddress.address1}-${toAddress.city}-${toAddress.state}-${toAddress.zip}`;
    if (lastShippingAddressRef.current === addressKey) {
      return; // Already calculated for this address
    }

    isCalculatingShippingRef.current = true;
    lastShippingAddressRef.current = addressKey;

    try {
      // Create packages based on cart items
      const packages = cartProducts.map((item) => ({
        weight: 1, // Default weight, could be calculated from product data
        length: 10,
        width: 10,
        height: 10,
      }));

      await calculateShippingRates(fromAddress, toAddress, packages);
    } finally {
      isCalculatingShippingRef.current = false;
    }
  }, [
    sameAsBilling,
    billingData,
    shippingData,
    cartProducts,
    calculateShippingRates,
  ]);

  // When sameAsBilling is checked, use billing address validation
  useEffect(() => {
    if (sameAsBilling) {
      setShippingAddressValid(billingAddressValid);
      // Recalculate shipping rates with billing address
      if (billingAddressValid && activeStep === "shipping") {
        calculateShippingRatesForCurrentAddress();
      }
    }
  }, [
    sameAsBilling,
    billingAddressValid,
    activeStep,
    calculateShippingRatesForCurrentAddress,
  ]);

  // Reset shipping address ref when sameAsBilling changes
  useEffect(() => {
    if (sameAsBilling) {
      lastShippingAddressRef.current = "";
    }
  }, [sameAsBilling]);

  const handleCouponApply = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    const result = await applyCoupon(couponCode);
    if (result.success) {
      setCouponError("");
      setCouponCode("");
      setShowCouponModal(true);
    } else {
      setCouponError(result.message);
    }
  };

  const handleContinue = () => {
    if (activeStep === "billing") {
      if (billingAddressValid) {
        setActiveStep("shipping");
        // Calculate shipping rates when moving to shipping step
        calculateShippingRatesForCurrentAddress();
      } else {
        alert("Please ensure your billing address is valid before continuing.");
      }
    } else if (activeStep === "shipping") {
      if (shippingAddressValid || sameAsBilling) {
        setActiveStep("payment");
      } else {
        alert(
          "Please ensure your shipping address is valid before continuing."
        );
      }
    }
  };

  const handleBack = () => {
    if (activeStep === "shipping") {
      setActiveStep("billing");
    } else if (activeStep === "payment") {
      setActiveStep("shipping");
    }
  };

  const handleOrderSubmission = async () => {
    // Validate all required fields
    if (
      !billingData.firstName ||
      !billingData.lastName ||
      !billingData.address1 ||
      !billingData.city ||
      !billingData.state ||
      !billingData.zip ||
      !billingData.email
    ) {
      setSubmitError("Please fill in all required billing fields");
      return;
    }

    if (
      !sameAsBilling &&
      (!shippingData.firstName ||
        !shippingData.lastName ||
        !shippingData.address1 ||
        !shippingData.city ||
        !shippingData.state ||
        !shippingData.zip)
    ) {
      setSubmitError("Please fill in all required shipping fields");
      return;
    }

    if (
      !paymentData.cardNumber ||
      !paymentData.expiryDate ||
      !paymentData.cvv ||
      !paymentData.nameOnCard
    ) {
      setSubmitError("Please fill in all required payment fields");
      return;
    }

    if (!cardValid || !expiryValid || !cvvValid) {
      setSubmitError("Please fix payment validation errors");
      return;
    }

    if (!termsAgreed) {
      setSubmitError("Please agree to the Terms & Conditions");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Get last 4 digits of card number
      const lastFourDigits = paymentData.cardNumber
        .replace(/\s/g, "")
        .slice(-4);

      // Get order notes from localStorage (stored from cart page)
      // Also try to get from cart page textarea if available
      let orderNotes = localStorage.getItem("orderNotes") || "";
      try {
        const cartNoteElement = document.getElementById("cart-note");
        if (cartNoteElement && cartNoteElement.value) {
          orderNotes = cartNoteElement.value;
          localStorage.setItem("orderNotes", orderNotes);
        }
      } catch (e) {
        // Element might not be available, use localStorage value
      }

      // Set redirecting flag to prevent unwanted redirects
      setIsRedirecting(true);

      // Store cart products before clearing (needed for confirmation)
      const cartProductsForConfirmation = [...cartProducts];

      // Prepare order items for API
      const orderItems = cartProductsForConfirmation.map((product) => {
        // Get the correct color-specific image
        let productImage = null;
        if (
          product.selectedColor &&
          product.images &&
          product.images.length > 0
        ) {
          let imageIndex = 0;
          if (product.selectedColor.ColorID === 1) {
            imageIndex = Math.min(1, product.images.length - 1);
          } else if (product.selectedColor.ColorID === 2) {
            imageIndex = 0;
          }
          const colorImageSrc =
            product.images[imageIndex]?.imgSrc || product.images[0]?.imgSrc;
          if (colorImageSrc && colorImageSrc.trim() !== "") {
            productImage = colorImageSrc;
          }
        }
        if (
          !productImage &&
          product.images?.[0]?.imgSrc &&
          product.images[0].imgSrc.trim() !== ""
        ) {
          productImage = product.images[0].imgSrc;
        }
        if (
          !productImage &&
          product.ImageLarge &&
          product.ImageLarge.trim() !== ""
        ) {
          productImage = product.ImageLarge;
        }

        return {
          productId: product.ProductID,
          name: product.ProductName,
          partNumber: product.PartNumber,
          quantity: product.quantity,
          price: product.Price,
          color: product.selectedColor
            ? product.selectedColor.ColorName
            : "Default",
          platform: product.PlatformName,
          yearRange: product.YearRange,
          image: productImage,
        };
      });

      // Create order in database first
      let orderId = `BMR-660000`; // Fallback
      try {
        const orderResponse = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            billing: billingData,
            shipping: sameAsBilling ? billingData : shippingData,
            items: orderItems,
            shippingMethod: selectedOption?.name || "Standard Shipping",
            shippingCost: selectedOption?.cost || 0,
            tax: 0,
            discount: couponDiscount || 0,
            couponCode: appliedCoupon?.code || "",
            notes: orderNotes,
          }),
        });

        if (orderResponse.ok) {
          const orderResult = await orderResponse.json();
          orderId = orderResult.orderNumber || orderId;
        } else {
          console.error("Failed to create order:", await orderResponse.json());
          // Continue with fallback order ID
        }
      } catch (orderError) {
        console.error("Failed to create order:", orderError);
        // Continue with fallback order ID
      }

      // Clear cart (but keep notes until after order is confirmed)
      setCartProducts([]);
      removeCoupon();

      // Prepare confirmation data with order items for display
      const confirmationData = {
        orderId: orderId,
        cardLastFour: lastFourDigits,
        total: calculateGrandTotal(),
        notes: orderNotes,
        items: orderItems.map((item) => ({
          name: item.name,
          partNumber: item.partNumber,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          platform: item.platform,
          yearRange: item.yearRange,
          image: item.image,
        })),
        billing: billingData,
        shipping: sameAsBilling ? billingData : shippingData,
        shippingMethod: selectedOption?.name || "Standard Shipping",
        shippingCost: selectedOption?.cost || 0,
        couponCode: appliedCoupon?.code || "",
        discount: couponDiscount || 0,
      };

      // Store order data in sessionStorage for the confirmation page
      sessionStorage.setItem(
        "orderConfirmation",
        JSON.stringify(confirmationData)
      );

      // Automatically send receipt email
      try {
        const emailResponse = await fetch("/api/send-receipt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: billingData.email,
            orderId: orderId,
            orderData: confirmationData,
          }),
        });

        const emailResult = await emailResponse.json();
        if (emailResponse.ok) {
          console.log("Receipt email sent successfully:", emailResult);
        } else {
          console.error("Failed to send receipt email:", emailResult);
          // Don't block the order process if email fails
        }
      } catch (emailError) {
        console.error("Failed to send receipt email:", emailError);
        // Don't block the order process if email fails
      }

      // Redirect to confirmation page
      window.location.href = `/confirmation?orderId=${orderId}`;
    } catch (error) {
      console.error("Error submitting order:", error);
      setSubmitError("Failed to process order. Please try again.");
      setIsRedirecting(false);
    } finally {
      setIsSubmitting(false);
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
    const shipping = selectedOption ? selectedOption.cost : 0;
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
                              First Name*
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
                            <label htmlFor="billing-last-name">
                              Last Name*
                            </label>
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

                      <AddressAutocomplete
                        address={billingData}
                        onAddressChange={setBillingData}
                        onValidationComplete={(result) => {
                          setBillingAddressValid(result.isValid);
                        }}
                        label="Address"
                        placeholder="Enter your billing address"
                        required={true}
                      />

                      <div className="form-group">
                        <label htmlFor="billing-city">City*</label>
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
                        <label htmlFor="billing-country">Country*</label>
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
                            <label htmlFor="billing-zip">Zip Code*</label>
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
                            <label htmlFor="billing-state">State*</label>
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
                            <label htmlFor="billing-phone">Phone Number*</label>
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
                            <label htmlFor="billing-email">
                              Email Address*
                            </label>
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
                            onChange={(e) => {
                              setSameAsBilling(e.target.checked);
                              // Reset shipping validation when unchecking
                              if (!e.target.checked) {
                                setShippingAddressValid(false);
                              }
                            }}
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
                                  First Name*
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
                                  Last Name*
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

                          <AddressAutocomplete
                            address={shippingData}
                            onAddressChange={setShippingData}
                            onValidationComplete={(result) => {
                              setShippingAddressValid(result.isValid);
                              // Recalculate shipping rates when address is validated
                              if (result.isValid) {
                                calculateShippingRatesForCurrentAddress();
                              }
                            }}
                            label="Shipping Address"
                            placeholder="Enter your shipping address"
                            required={true}
                          />

                          <div className="form-group">
                            <label htmlFor="shipping-city">City*</label>
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
                            <label htmlFor="shipping-country">Country*</label>
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
                                <label htmlFor="shipping-zip">Zip Code*</label>
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
                                <label htmlFor="shipping-state">State*</label>
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
                                  Phone Number*
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
                                  Email Address*
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
                        {shippingLoading ? (
                          <div className="text-center py-3">
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="sr-only">
                                Loading shipping rates...
                              </span>
                            </div>
                            <p className="mt-2">
                              Calculating shipping rates...
                            </p>
                          </div>
                        ) : shippingOptions.length > 0 ? (
                          <div className="shipping-options">
                            {shippingOptions.map((option, index) => (
                              <div key={index} className="shipping-option">
                                <label className="shipping-option-label">
                                  <input
                                    type="radio"
                                    name="shipping-option"
                                    value={option.code}
                                    checked={
                                      selectedOption?.code === option.code
                                    }
                                    onChange={() =>
                                      selectShippingOption(option)
                                    }
                                    className="me-2"
                                  />
                                  <div className="shipping-option-details">
                                    <div className="shipping-service">
                                      {option.service}
                                      {option.cost === 0 && (
                                        <span className="text-success ms-2">
                                          FREE
                                        </span>
                                      )}
                                    </div>
                                    <div className="shipping-details">
                                      {option.description} •{" "}
                                      {option.deliveryDays}
                                    </div>
                                    {option.cost > 0 && (
                                      <div className="shipping-cost">
                                        ${option.cost.toFixed(2)}
                                      </div>
                                    )}
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-3">
                            <p className="text-muted">
                              Free shipping on all BMR products
                            </p>
                          </div>
                        )}
                        {shippingError && (
                          <div className="alert alert-warning mt-2">
                            {shippingError}
                          </div>
                        )}
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
                        <label htmlFor="card-number">Card Number*</label>
                        <div className="card-input-wrapper">
                          <input
                            type="text"
                            id="card-number"
                            placeholder="1234 5678 9012 3456"
                            value={paymentData.cardNumber}
                            onChange={(e) => {
                              const formatted = handleCardNumberChange(
                                e.target.value
                              );
                              setPaymentData({
                                ...paymentData,
                                cardNumber: formatted,
                              });
                            }}
                            className={`form-control ${
                              paymentData.cardNumber &&
                              (cardValid ? "is-valid" : "is-invalid")
                            }`}
                            required
                          />
                          <div className="card-icons">
                            <CreditCardIcons detectedType={detectedType} />
                          </div>
                          {paymentData.cardNumber && (
                            <div
                              className={`validation-message ${
                                cardValid ? "valid" : "invalid"
                              }`}
                            >
                              {validationMessage}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="expiry-date">Expiry Date*</label>
                            <input
                              type="text"
                              id="expiry-date"
                              placeholder="MM/YY"
                              value={paymentData.expiryDate}
                              onChange={(e) => {
                                const formatted = formatExpiryDate(
                                  e.target.value
                                );
                                const validation =
                                  validateExpiryDate(formatted);
                                setPaymentData({
                                  ...paymentData,
                                  expiryDate: formatted,
                                });
                                setExpiryValid(validation.isValid);
                                setExpiryMessage(validation.message);
                              }}
                              className={`form-control ${
                                paymentData.expiryDate &&
                                (expiryValid ? "is-valid" : "is-invalid")
                              }`}
                              required
                            />
                            {paymentData.expiryDate && (
                              <div
                                className={`validation-message ${
                                  expiryValid ? "valid" : "invalid"
                                }`}
                              >
                                {expiryMessage}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="cvv">CVV*</label>
                            <input
                              type="text"
                              id="cvv"
                              placeholder={
                                detectedType?.name === "American Express"
                                  ? "1234"
                                  : "123"
                              }
                              value={paymentData.cvv}
                              onChange={(e) => {
                                const cleaned = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                const validation = validateCVV(
                                  cleaned,
                                  detectedType
                                );
                                setPaymentData({
                                  ...paymentData,
                                  cvv: cleaned,
                                });
                                setCvvValid(validation.isValid);
                                setCvvMessage(validation.message);
                              }}
                              className={`form-control ${
                                paymentData.cvv &&
                                (cvvValid ? "is-valid" : "is-invalid")
                              }`}
                              maxLength={
                                detectedType?.name === "American Express"
                                  ? 4
                                  : 3
                              }
                              required
                            />
                            {paymentData.cvv && (
                              <div
                                className={`validation-message ${
                                  cvvValid ? "valid" : "invalid"
                                }`}
                              >
                                {cvvMessage}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="name-on-card">Name on Card*</label>
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
                          className={`form-control ${
                            paymentData.nameOnCard &&
                            (paymentData.nameOnCard.trim().length > 0
                              ? "is-valid"
                              : "is-invalid")
                          }`}
                          required
                        />
                        {paymentData.nameOnCard && (
                          <div
                            className={`validation-message ${
                              paymentData.nameOnCard.trim().length > 0
                                ? "valid"
                                : "invalid"
                            }`}
                          >
                            {paymentData.nameOnCard.trim().length > 0
                              ? "Valid name"
                              : "Please enter a valid name"}
                          </div>
                        )}
                      </div>

                      {submitError && (
                        <div className="alert alert-danger mt-3">
                          {submitError}
                        </div>
                      )}

                      <div className="d-flex justify-content-start mt-4">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleBack}
                          disabled={isSubmitting}
                        >
                          Back
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
                {cartLoading ? (
                  <CartSkeleton />
                ) : (
                  cartProducts.map((item, index) => (
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
                                imageIndex = Math.min(
                                  1,
                                  item.images.length - 1
                                );
                              } else if (item.selectedColor.ColorID === 2) {
                                imageIndex = 0;
                              }
                              const colorImageSrc =
                                item.images[imageIndex]?.imgSrc ||
                                item.images[0]?.imgSrc;
                              if (
                                colorImageSrc &&
                                colorImageSrc.trim() !== ""
                              ) {
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
                        {(
                          (parseFloat(item.Price) || 0) * item.quantity
                        ).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cartLoading && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading cart...</span>
                  </div>
                  <p className="mt-2">Loading your cart...</p>
                </div>
              )}

              <div className="shipping-estimate-section mb-4">
                <ShippingEstimate inline={true} />
              </div>

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
                    style={{
                      borderRadius: "8px",
                    }}
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-danger">{couponError}</p>}
                {appliedCoupon && (
                  <div className="mt-2">
                    <p
                      className="mb-1"
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#333",
                      }}
                    >
                      <strong>Coupon:</strong> {appliedCoupon.code}
                    </p>
                    {appliedCoupon.name && (
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "0",
                        }}
                      >
                        {appliedCoupon.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="order-totals">
                <div className="total-line">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="total-line">
                  <span>Shipping:</span>
                  <span>
                    ${selectedOption ? selectedOption.cost.toFixed(2) : "0.00"}
                  </span>
                </div>
                {appliedCoupon && (
                  <div
                    className="d-flex justify-content-between mb-2 text-danger total-line"
                    style={{ fontSize: "14px" }}
                  >
                    <span>Coupon ({appliedCoupon.code}):</span>
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
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    required
                  />
                  I agree to BMR Suspension's{" "}
                  <Link href="/terms-conditions">Terms & Conditions</Link>
                </label>
              </div>

              <div className="email-consent-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={emailConsent}
                    onChange={(e) => setEmailConsent(e.target.checked)}
                  />
                  I agree to receive texts and emails from BMR
                </label>
              </div>

              <button
                className="btn btn-lg w-100 place-order-btn"
                onClick={handleOrderSubmission}
                disabled={
                  activeStep !== "payment" || isSubmitting || !termsAgreed
                }
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Processing Order...
                  </>
                ) : (
                  "PLACE ORDER"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CouponSuccessModal
        coupon={appliedCoupon}
        show={showCouponModal}
        onClose={() => setShowCouponModal(false)}
      />
    </section>
  );
}
