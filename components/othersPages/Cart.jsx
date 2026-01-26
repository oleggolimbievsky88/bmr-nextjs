"use client";
import { useContextElement } from "@/context/Context";
import { showToast } from "@/utlis/showToast";
import CartSkeleton from "@/components/common/CartSkeleton";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import CouponSuccessModal from "@/components/modals/CouponSuccessModal";
import ShippingEstimate from "@/components/common/ShippingEstimate";
export default function Cart() {
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
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [consent, setConsent] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");

  // Load order notes from localStorage only on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNotes = localStorage.getItem("orderNotes") || "";
      setOrderNotes(savedNotes);
    }
  }, []);

  // Remove coupon when cart becomes empty
  useEffect(() => {
    if (cartProducts.length === 0 && appliedCoupon) {
      removeCoupon();
    }
  }, [cartProducts, appliedCoupon, removeCoupon]);
  const setQuantity = (id, quantity) => {
    if (quantity >= 1) {
      const item = cartProducts.filter((elm) => elm.ProductID == id)[0];
      const items = [...cartProducts];
      const itemIndex = items.indexOf(item);
      item.quantity = quantity;
      items[itemIndex] = item;
      setCartProducts(items);
    }
  };
  const removeItem = (id) => {
    const item = cartProducts.find((elm) => elm.ProductID == id);
    const productName = item?.ProductName || 'Item';
    setCartProducts((pre) => [...pre.filter((elm) => elm.ProductID != id)]);
    showToast(`${productName} removed from cart`, 'info');
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      const result = await applyCoupon(couponCode.trim());
      if (result.success) {
        setCouponCode("");
        setCouponError("");
        setShowCouponModal(true);
      } else {
        setCouponError(result.message);
      }
    } catch (error) {
      setCouponError("Error applying coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode("");
    setCouponError("");
  };

  // Calculate totals
  const subtotal = totalPrice;
  const shipping = freeShipping ? 0 : 0; // You can add shipping calculation logic here
  const tax = 0; // You can add tax calculation logic here
  const grandTotal = subtotal - couponDiscount + shipping + tax;
  return (
    <section className="flat-spacing-11">
      <div className="container">
        {/* <div className="tf-page-cart text-center mt_140 mb_200">
              <h5 className="mb_24">Your cart is empty</h5>
              <p className="mb_24">You may check out all the available products and buy some in the shop</p>
              <Link href={`/shop-default`} className="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn">Return to shop<i className="icon icon-arrow1-top-left"></i></Link>
          </div> */}
        {/* <div className="tf-cart-countdown">
          <div className="title-left">
            <svg
              className="d-inline-block"
              xmlns="http://www.w3.org/2000/svg"
              width={16}
              height={24}
              viewBox="0 0 16 24"
              fill="rgb(219 18 21)"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.0899 24C11.3119 22.1928 11.4245 20.2409 10.4277 18.1443C10.1505 19.2691 9.64344 19.9518 8.90645 20.1924C9.59084 18.2379 9.01896 16.1263 7.19079 13.8576C7.15133 16.2007 6.58824 17.9076 5.50148 18.9782C4.00436 20.4517 4.02197 22.1146 5.55428 23.9669C-0.806588 20.5819 -1.70399 16.0418 2.86196 10.347C3.14516 11.7228 3.83141 12.5674 4.92082 12.8809C3.73335 7.84186 4.98274 3.54821 8.66895 0C8.6916 7.87426 11.1062 8.57414 14.1592 12.089C17.4554 16.3071 15.5184 21.1748 10.0899 24Z"
              />
            </svg>
            <p>These products are limited, checkout within</p>
          </div>
          <div
            className="js-countdown timer-count"
            data-timer={600}
            data-labels="d:,h:,m:,s"
          />
        </div> */}
        <div className="tf-page-cart-wrap">
          <div className="tf-page-cart-item">
            <form onSubmit={(e) => e.preventDefault()}>
              <table className="tf-table-page-cart">
                <thead>
                  <tr>
                    <th className="Coupon-Code-Header">PRODUCT</th>
                    {/* <th className="Coupon-Code-Header">PRICE</th> */}
                    <th className="Coupon-Code-Header">QUANTITY</th>
                    <th className="Coupon-Code-Header">PRICE</th>
                  </tr>
                </thead>
                <tbody>
                  {cartLoading ? (
                    <tr>
                      <td colSpan="6" className="text-center p-4">
                        <CartSkeleton />
                      </td>
                    </tr>
                  ) : (
                    cartProducts.map((elm, i) => (
                      <tr key={i} className="tf-cart-item file-delete">
                        <td className="tf-cart-item_product">
                          <Link
                            href={`/product/${elm.ProductID}`}
                            className="img-box"
                          >
                            <Image
                              alt={elm.ProductName || "Product"}
                              src={(() => {
                                // Use color-specific product image from the product's image array
                                if (
                                  elm.selectedColor &&
                                  elm.images &&
                                  elm.images.length > 0
                                ) {
                                  // Determine which image to show based on color
                                  let imageIndex = 0; // Default to first image

                                  if (elm.selectedColor.ColorID === 1) {
                                    // Black Hammertone - show second image if available
                                    imageIndex = Math.min(
                                      1,
                                      elm.images.length - 1
                                    );
                                  } else if (elm.selectedColor.ColorID === 2) {
                                    // Red - show first image
                                    imageIndex = 0;
                                  }
                                  // Add more color mappings as needed

                                  const colorImageSrc =
                                    elm.images[imageIndex]?.imgSrc ||
                                    elm.images[0]?.imgSrc;
                                  if (
                                    colorImageSrc &&
                                    colorImageSrc.trim() !== ""
                                  ) {
                                    return colorImageSrc;
                                  }
                                }

                                // Fallback to main product image
                                if (
                                  elm.images?.[0]?.imgSrc &&
                                  elm.images[0].imgSrc.trim() !== ""
                                ) {
                                  return elm.images[0].imgSrc;
                                }

                                // Fallback to external BMR image
                                if (
                                  elm.ImageLarge &&
                                  elm.ImageLarge.trim() !== "" &&
                                  elm.ImageLarge !== "0"
                                ) {
                                  return `https://bmrsuspension.com/siteart/products/${elm.ImageLarge}`;
                                }

                                // Final fallback to BMR logo
                                return "/images/logo/bmr_logo_square_small.webp";
                              })()}
                              width={668}
                              height={932}
                            />
                          </Link>
                          <div className="cart-info">
                            <div
                              style={{
                                fontSize: "12px",
                                marginBottom: "2px",
                                color: "#666666",
                                fontWeight: "400",
                              }}
                            >
                              Mfg: {elm.ManufacturerName || elm.ManID || "N/A"}
                            </div>
                            <Link
                              href={`/product/${elm.ProductID}`}
                              className="cart-title link"
                            >
                              {elm.ProductName || "Product"}
                            </Link>
                            <div className="cart-meta-variant">
                              {/* Part Number with color suffix */}
                              <div
                                style={{
                                  fontSize: "12px",
                                  marginBottom: "2px",
                                  color: "#666666",
                                  fontWeight: "400",
                                }}
                              >
                                Part #: {elm.PartNumber || "N/A"}
                                {elm.selectedColor && (
                                  <>
                                    {elm.selectedColor.ColorName &&
                                    elm.selectedColor.ColorName.toLowerCase().includes(
                                      "red"
                                    )
                                      ? "R"
                                      : elm.selectedColor.ColorName &&
                                        elm.selectedColor.ColorName.toLowerCase().includes(
                                          "black"
                                        )
                                      ? "H"
                                      : ""}
                                  </>
                                )}
                              </div>
                              {/* Platform */}
                              {elm.PlatformName && (
                                <div
                                  style={{
                                    fontSize: "12px",
                                    marginBottom: "2px",
                                    color: "#666666",
                                    fontWeight: "400",
                                  }}
                                >
                                  Platform: {elm.PlatformName}
                                </div>
                              )}
                              {/* Color */}
                              <div
                                style={{
                                  fontSize: "12px",
                                  marginBottom: "2px",
                                  color: "#666666",
                                  fontWeight: "400",
                                }}
                              >
                                Color:{" "}
                                {elm.selectedColor
                                  ? elm.selectedColor.ColorName
                                  : "Default"}
                              </div>
                              {/* Add-ons (Grease, Hardware, etc.) */}
                              {elm.selectedGrease &&
                                elm.selectedGrease.GreaseName && (
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      marginBottom: "2px",
                                      color: "#666666",
                                      fontWeight: "400",
                                    }}
                                  >
                                    Add Grease: {elm.selectedGrease.GreaseName}{" "}
                                    (+${elm.selectedGrease.GreasePrice})
                                  </div>
                                )}
                              {elm.selectedHardware &&
                                elm.selectedHardware.HardwareName && (
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      marginBottom: "2px",
                                      color: "#666666",
                                      fontWeight: "400",
                                    }}
                                  >
                                    Add Hardware:{" "}
                                    {elm.selectedHardware.HardwareName} (+$
                                    {elm.selectedHardware.HardwarePrice})
                                  </div>
                                )}
                              {elm.selectedAngleFinder &&
                                elm.selectedAngleFinder.AngleName && (
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      marginBottom: "2px",
                                      color: "#666666",
                                      fontWeight: "400",
                                    }}
                                  >
                                    Add Angle Finder:{" "}
                                    {elm.selectedAngleFinder.AngleName} (+$
                                    {elm.selectedAngleFinder.AnglePrice})
                                  </div>
                                )}
                            </div>
                            <span
                              className="remove-cart link remove"
                              onClick={() => removeItem(elm.ProductID)}
                            >
                              Remove
                            </span>
                          </div>
                        </td>
                        {/* <td
                        className="tf-cart-item_price"
                        cart-data-title="Price"
                      >
                        <div className="cart-price">
                          ${(parseFloat(elm.Price) || 0).toFixed(2)}
                        </div>
                      </td> */}
                        <td
                          className="tf-cart-item_quantity"
                          cart-data-title="Quantity"
                        >
                          <div className="cart-quantity">
                            <div className="wg-quantity">
                              <span
                                className="btn-quantity minus-btn"
                                onClick={() => {
                                  if (elm.quantity === 1) {
                                    removeItem(elm.ProductID);
                                  } else {
                                    setQuantity(
                                      elm.ProductID,
                                      elm.quantity - 1
                                    );
                                  }
                                }}
                              >
                                <svg
                                  className="d-inline-block"
                                  width={9}
                                  height={1}
                                  viewBox="0 0 9 1"
                                  fill="currentColor"
                                >
                                  <path d="M9 1H5.14286H3.85714H0V1.50201e-05H3.85714L5.14286 0L9 1.50201e-05V1Z" />
                                </svg>
                              </span>
                              <input
                                type="text"
                                name="number"
                                value={elm.quantity}
                                min={1}
                                onChange={(e) =>
                                  setQuantity(elm.ProductID, e.target.value / 1)
                                }
                              />
                              <span
                                className="btn-quantity plus-btn"
                                onClick={() =>
                                  setQuantity(elm.ProductID, elm.quantity + 1)
                                }
                              >
                                <svg
                                  className="d-inline-block"
                                  width={9}
                                  height={9}
                                  viewBox="0 0 9 9"
                                  fill="currentColor"
                                >
                                  <path d="M9 5.14286H5.14286V9H3.85714V5.14286H0V3.85714H3.85714V0H5.14286V3.85714H9V5.14286Z" />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </td>
                        <td
                          className="tf-cart-item_total"
                          cart-data-title="Total"
                        >
                          <div
                            className="cart-total"
                            style={{ minWidth: "60px" }}
                          >
                            $
                            {(() => {
                              const basePrice = parseFloat(elm.Price) || 0;
                              let addOnPrice = 0;

                              // Add grease price if selected
                              if (
                                elm.selectedGrease &&
                                elm.selectedGrease.GreasePrice
                              ) {
                                addOnPrice += parseFloat(
                                  elm.selectedGrease.GreasePrice || 0
                                );
                              }

                              // Add angle finder price if selected
                              if (
                                elm.selectedAnglefinder &&
                                elm.selectedAnglefinder.AnglePrice
                              ) {
                                addOnPrice += parseFloat(
                                  elm.selectedAnglefinder.AnglePrice || 0
                                );
                              }

                              // Add hardware price if selected
                              if (
                                elm.selectedHardware &&
                                elm.selectedHardware.HardwarePrice
                              ) {
                                addOnPrice += parseFloat(
                                  elm.selectedHardware.HardwarePrice || 0
                                );
                              }

                              const totalItemPrice =
                                (basePrice + addOnPrice) * elm.quantity;
                              return totalItemPrice.toFixed(2);
                            })()}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {!cartLoading && !cartProducts.length && (
                <>
                  <div className="row align-items-center mb-5">
                    <div className="col-6 fs-18">Your shop cart is empty</div>
                    <div className="col-6">
                      <Link
                        href={`/products`}
                        className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                        style={{ width: "fit-content" }}
                      >
                        Explore Products!
                      </Link>
                    </div>
                  </div>
                </>
              )}
              <div className="tf-page-cart-note">
                <label htmlFor="cart-note">Add Order Note</label>
                <textarea
                  name="note"
                  id="cart-note"
                  placeholder="Order notes (optional)"
                  value={orderNotes}
                  onChange={(e) => {
                    const value = e.target.value;
                    setOrderNotes(value);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("orderNotes", value);
                    }
                  }}
                  suppressHydrationWarning
                />
              </div>
            </form>
          </div>
          <div className="tf-page-cart-footer">
            <div className="tf-cart-footer-inner">
              {/* <div className="tf-free-shipping-bar">
                <div className="tf-progress-bar">
                  <span style={{ width: "50%" }}>
                    <div className="progress-car">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={21}
                        height={14}
                        viewBox="0 0 21 14"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M0 0.875C0 0.391751 0.391751 0 0.875 0H13.5625C14.0457 0 14.4375 0.391751 14.4375 0.875V3.0625H17.3125C17.5867 3.0625 17.845 3.19101 18.0104 3.40969L20.8229 7.12844C20.9378 7.2804 21 7.46572 21 7.65625V11.375C21 11.8582 20.6082 12.25 20.125 12.25H17.7881C17.4278 13.2695 16.4554 14 15.3125 14C14.1696 14 13.1972 13.2695 12.8369 12.25H7.72563C7.36527 13.2695 6.39293 14 5.25 14C4.10706 14 3.13473 13.2695 2.77437 12.25H0.875C0.391751 12.25 0 11.8582 0 11.375V0.875ZM2.77437 10.5C3.13473 9.48047 4.10706 8.75 5.25 8.75C6.39293 8.75 7.36527 9.48046 7.72563 10.5H12.6875V1.75H1.75V10.5H2.77437ZM14.4375 8.89937V4.8125H16.8772L19.25 7.94987V10.5H17.7881C17.4278 9.48046 16.4554 8.75 15.3125 8.75C15.0057 8.75 14.7112 8.80264 14.4375 8.89937ZM5.25 10.5C4.76676 10.5 4.375 10.8918 4.375 11.375C4.375 11.8582 4.76676 12.25 5.25 12.25C5.73323 12.25 6.125 11.8582 6.125 11.375C6.125 10.8918 5.73323 10.5 5.25 10.5ZM15.3125 10.5C14.8293 10.5 14.4375 10.8918 14.4375 11.375C14.4375 11.8582 14.8293 12.25 15.3125 12.25C15.7957 12.25 16.1875 11.8582 16.1875 11.375C16.1875 10.8918 15.7957 10.5 15.3125 10.5Z"
                        />
                      </svg>
                    </div>
                  </span>
                </div>
                <div className="tf-progress-msg">
                  Buy <span className="price fw-6">$75.00</span> more to enjoy{" "}
                  <span className="fw-6">Free Shipping</span>
                </div>
              </div> */}
              <div className="tf-page-cart-checkout">
                <div className="shipping-estimate-section mb-4">
                  <ShippingEstimate inline={true} />
                </div>
                {/* Coupon Code Section */}
                <div className="tf-cart-coupon-section mb-4">
                  <h3 className="mb-3">Have a coupon code? Enter it here!</h3>

                  {!appliedCoupon ? (
                    // Before coupon applied state
                    <div className="coupon-input-group">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Type here..."
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleApplyCoupon()
                          }
                          suppressHydrationWarning
                        />
                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading}
                        >
                          {couponLoading ? "Applying..." : "Apply"}
                        </button>
                      </div>
                      {couponError && (
                        <div className="text-danger mt-2 small">
                          {couponError}
                        </div>
                      )}
                    </div>
                  ) : (
                    // After coupon applied state
                    <div className="coupon-applied">
                      <div className="alert alert-success d-flex justify-content-between align-items-center">
                        <div style={{ flex: 1 }}>
                          <div
                            style={{ fontWeight: "600", marginBottom: "4px" }}
                          >
                            Code: {appliedCoupon.code}
                          </div>
                          {appliedCoupon.name && (
                            <div style={{ fontSize: "14px", marginTop: "4px" }}>
                              <strong>{appliedCoupon.name}</strong>
                            </div>
                          )}
                          <div style={{ fontSize: "13px", marginTop: "4px" }}>
                            {appliedCoupon.discountType === "percentage"
                              ? `${appliedCoupon.discountValue}%`
                              : `$${appliedCoupon.discountValue}`}{" "}
                            off
                            {appliedCoupon.freeShipping && " and FREE shipping"}
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={handleRemoveCoupon}
                          style={{ marginLeft: "10px" }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="tf-cart-order-summary">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping:</span>
                    <span>
                      {freeShipping ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="d-flex justify-content-between mb-2 text-danger">
                      <span>Coupon ({appliedCoupon.code}):</span>
                      <span>-${couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between mb-2">
                    <span>Gift Certificate:</span>
                    <span>$0.00</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-3">
                    <strong>Grand Total:</strong>
                    <strong>${grandTotal.toFixed(2)}</strong>
                  </div>
                </div>
                <div className="cart-checkbox">
                  <input
                    type="checkbox"
                    className="tf-check"
                    id="check-agree"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    required
                    suppressHydrationWarning
                  />
                  <label htmlFor="check-agree" className="fw-4">
                    I agree with the{" "}
                    <Link
                      href={`/terms-conditions`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      terms and conditions
                    </Link>
                    <span className="text-danger">*</span>
                  </label>
                </div>

                <div className="cart-checkbox">
                  <input
                    className="tf-check"
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    suppressHydrationWarning
                  />
                  <label className="fw-4" htmlFor="consent">
                    I consent to emails and text messages from BMR Suspension
                  </label>
                </div>
                <div className="cart-checkout-btn">
                  {termsAgreed ? (
                    <Link
                      href={`/checkout`}
                      className="tf-btn w-100 btn-fill animate-hover-btn radius-3 justify-content-center"
                    >
                      <span>Check out</span>
                    </Link>
                  ) : (
                    <button
                      className="tf-btn w-100 btn-fill animate-hover-btn radius-3 justify-content-center"
                      disabled
                      style={{ opacity: 0.5, cursor: "not-allowed" }}
                      title="Please agree to terms and conditions"
                    >
                      <span>Check out</span>
                    </button>
                  )}
                </div>
                <div className="tf-page-cart_imgtrust">
                  <p className="text-center fw-6">Guarantee Safe Checkout</p>
                  <div className="cart-list-social">
                    <div className="payment-item">
                      <svg
                        viewBox="0 0 38 24"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        width={38}
                        height={24}
                        aria-labelledby="pi-visa"
                      >
                        <title id="pi-visa">Visa</title>
                        <path
                          opacity=".07"
                          d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                        />
                        <path
                          fill="#fff"
                          d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                        />
                        <path
                          d="M28.3 10.1H28c-.4 1-.7 1.5-1 3h1.9c-.3-1.5-.3-2.2-.6-3zm2.9 5.9h-1.7c-.1 0-.1 0-.2-.1l-.2-.9-.1-.2h-2.4c-.1 0-.2 0-.2.2l-.3.9c0 .1-.1.1-.1.1h-2.1l.2-.5L27 8.7c0-.5.3-.7.8-.7h1.5c.1 0 .2 0 .2.2l1.4 6.5c.1.4.2.7.2 1.1.1.1.1.1.1.2zm-13.4-.3l.4-1.8c.1 0 .2.1.2.1.7.3 1.4.5 2.1.4.2 0 .5-.1.7-.2.5-.2.5-.7.1-1.1-.2-.2-.5-.3-.8-.5-.4-.2-.8-.4-1.1-.7-1.2-1-.8-2.4-.1-3.1.6-.4.9-.8 1.7-.8 1.2 0 2.5 0 3.1.2h.1c-.1.6-.2 1.1-.4 1.7-.5-.2-1-.4-1.5-.4-.3 0-.6 0-.9.1-.2 0-.3.1-.4.2-.2.2-.2.5 0 .7l.5.4c.4.2.8.4 1.1.6.5.3 1 .8 1.1 1.4.2.9-.1 1.7-.9 2.3-.5.4-.7.6-1.4.6-1.4 0-2.5.1-3.4-.2-.1.2-.1.2-.2.1zm-3.5.3c.1-.7.1-.7.2-1 .5-2.2 1-4.5 1.4-6.7.1-.2.1-.3.3-.3H18c-.2 1.2-.4 2.1-.7 3.2-.3 1.5-.6 3-1 4.5 0 .2-.1.2-.3.2M5 8.2c0-.1.2-.2.3-.2h3.4c.5 0 .9.3 1 .8l.9 4.4c0 .1 0 .1.1.2 0-.1.1-.1.1-.1l2.1-5.1c-.1-.1 0-.2.1-.2h2.1c0 .1 0 .1-.1.2l-3.1 7.3c-.1.2-.1.3-.2.4-.1.1-.3 0-.5 0H9.7c-.1 0-.2 0-.2-.2L7.9 9.5c-.2-.2-.5-.5-.9-.6-.6-.3-1.7-.5-1.9-.5L5 8.2z"
                          fill="#142688"
                        />
                      </svg>
                    </div>
                    <div className="payment-item">
                      <svg
                        viewBox="0 0 38 24"
                        xmlns="http://www.w3.org/2000/svg"
                        width={38}
                        height={24}
                        role="img"
                        aria-labelledby="pi-paypal"
                      >
                        <title id="pi-paypal">PayPal</title>
                        <path
                          opacity=".07"
                          d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                        />
                        <path
                          fill="#fff"
                          d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                        />
                        <path
                          fill="#003087"
                          d="M23.9 8.3c.2-1 0-1.7-.6-2.3-.6-.7-1.7-1-3.1-1h-4.1c-.3 0-.5.2-.6.5L14 15.6c0 .2.1.4.3.4H17l.4-3.4 1.8-2.2 4.7-2.1z"
                        />
                        <path
                          fill="#3086C8"
                          d="M23.9 8.3l-.2.2c-.5 2.8-2.2 3.8-4.6 3.8H18c-.3 0-.5.2-.6.5l-.6 3.9-.2 1c0 .2.1.4.3.4H19c.3 0 .5-.2.5-.4v-.1l.4-2.4v-.1c0-.2.3-.4.5-.4h.3c2.1 0 3.7-.8 4.1-3.2.2-1 .1-1.8-.4-2.4-.1-.5-.3-.7-.5-.8z"
                        />
                        <path
                          fill="#012169"
                          d="M23.3 8.1c-.1-.1-.2-.1-.3-.1-.1 0-.2 0-.3-.1-.3-.1-.7-.1-1.1-.1h-3c-.1 0-.2 0-.2.1-.2.1-.3.2-.3.4l-.7 4.4v.1c0-.3.3-.5.6-.5h1.3c2.5 0 4.1-1 4.6-3.8v-.2c-.1-.1-.3-.2-.5-.2h-.1z"
                        />
                      </svg>
                    </div>
                    <div className="payment-item">
                      <svg
                        viewBox="0 0 38 24"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        width={38}
                        height={24}
                        aria-labelledby="pi-master"
                      >
                        <title id="pi-master">Mastercard</title>
                        <path
                          opacity=".07"
                          d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                        />
                        <path
                          fill="#fff"
                          d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                        />
                        <circle fill="#EB001B" cx={15} cy={12} r={7} />
                        <circle fill="#F79E1B" cx={23} cy={12} r={7} />
                        <path
                          fill="#FF5F00"
                          d="M22 12c0-2.4-1.2-4.5-3-5.7-1.8 1.3-3 3.4-3 5.7s1.2 4.5 3 5.7c1.8-1.2 3-3.3 3-5.7z"
                        />
                      </svg>
                    </div>
                    <div className="payment-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        aria-labelledby="pi-american_express"
                        viewBox="0 0 38 24"
                        width={38}
                        height={24}
                      >
                        <title id="pi-american_express">American Express</title>
                        <path
                          fill="#000"
                          d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3Z"
                          opacity=".07"
                        />
                        <path
                          fill="#006FCF"
                          d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32Z"
                        />
                        <path
                          fill="#FFF"
                          d="M22.012 19.936v-8.421L37 11.528v2.326l-1.732 1.852L37 17.573v2.375h-2.766l-1.47-1.622-1.46 1.628-9.292-.02Z"
                        />
                        <path
                          fill="#006FCF"
                          d="M23.013 19.012v-6.57h5.572v1.513h-3.768v1.028h3.678v1.488h-3.678v1.01h3.768v1.531h-5.572Z"
                        />
                        <path
                          fill="#006FCF"
                          d="m28.557 19.012 3.083-3.289-3.083-3.282h2.386l1.884 2.083 1.89-2.082H37v.051l-3.017 3.23L37 18.92v.093h-2.307l-1.917-2.103-1.898 2.104h-2.321Z"
                        />
                        <path
                          fill="#FFF"
                          d="M22.71 4.04h3.614l1.269 2.881V4.04h4.46l.77 2.159.771-2.159H37v8.421H19l3.71-8.421Z"
                        />
                        <path
                          fill="#006FCF"
                          d="m23.395 4.955-2.916 6.566h2l.55-1.315h2.98l.55 1.315h2.05l-2.904-6.566h-2.31Zm.25 3.777.875-2.09.873 2.09h-1.748Z"
                        />
                        <path
                          fill="#006FCF"
                          d="M28.581 11.52V4.953l2.811.01L32.84 9l1.456-4.046H37v6.565l-1.74.016v-4.51l-1.644 4.494h-1.59L30.35 7.01v4.51h-1.768Z"
                        />
                      </svg>
                    </div>
                    <div className="payment-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        viewBox="0 0 38 24"
                        width={38}
                        height={24}
                        aria-labelledby="pi-amazon"
                      >
                        <title id="pi-amazon">Amazon</title>
                        <path
                          d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                          fill="#000"
                          fillRule="nonzero"
                          opacity=".07"
                        />
                        <path
                          d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                          fill="#FFF"
                          fillRule="nonzero"
                        />
                        <path
                          d="M25.26 16.23c-1.697 1.48-4.157 2.27-6.275 2.27-2.97 0-5.644-1.3-7.666-3.463-.16-.17-.018-.402.173-.27 2.183 1.504 4.882 2.408 7.67 2.408 1.88 0 3.95-.46 5.85-1.416.288-.145.53.222.248.47v.001zm.706-.957c-.216-.328-1.434-.155-1.98-.078-.167.024-.193-.148-.043-.27.97-.81 2.562-.576 2.748-.305.187.272-.047 2.16-.96 3.063-.14.138-.272.064-.21-.12.205-.604.664-1.96.446-2.29h-.001z"
                          fill="#F90"
                          fillRule="nonzero"
                        />
                        <path
                          d="M21.814 15.291c-.574-.498-.676-.73-.993-1.205-.947 1.012-1.618 1.315-2.85 1.315-1.453 0-2.587-.938-2.587-2.818 0-1.467.762-2.467 1.844-2.955.94-.433 2.25-.51 3.25-.628v-.235c0-.43.033-.94-.208-1.31-.212-.333-.616-.47-.97-.47-.66 0-1.25.353-1.392 1.085-.03.163-.144.323-.3.33l-1.677-.187c-.14-.033-.296-.153-.257-.38.386-2.125 2.223-2.766 3.867-2.766.84 0 1.94.234 2.604.9.842.82.762 1.918.762 3.11v2.818c0 .847.335 1.22.65 1.676.113.164.138.36-.003.482-.353.308-.98.88-1.326 1.2a.367.367 0 0 1-.414.038zm-1.659-2.533c.34-.626.323-1.214.323-1.918v-.392c-1.25 0-2.57.28-2.57 1.82 0 .782.386 1.31 1.05 1.31.487 0 .922-.312 1.197-.82z"
                          fill="#221F1F"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
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
