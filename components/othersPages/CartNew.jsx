"use client";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function CartNew() {
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

  const [termsAgreed, setTermsAgreed] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

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
    setCartProducts((pre) => [...pre.filter((elm) => elm.ProductID != id)]);
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
  const shipping = freeShipping ? 0 : 0;
  const tax = 0;
  const grandTotal = subtotal - couponDiscount + shipping + tax;

  return (
    <section className="flat-spacing-11">
      <div className="container">
        <div className="tf-page-cart-wrap">
          <div className="tf-page-cart-item">
            <form onSubmit={(e) => e.preventDefault()}>
              <table className="tf-table-page-cart">
                <thead>
                  <tr>
                    <th className="Coupon-Code-Header">PRODUCT</th>
                    <th className="Coupon-Code-Header">QUANTITY</th>
                    <th className="Coupon-Code-Header">PRICE</th>
                  </tr>
                </thead>
                <tbody>
                  {cartProducts.map((elm, i) => (
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
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#333333",
                              textDecoration: "none",
                              marginBottom: "8px",
                              display: "block",
                            }}
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
                            style={{
                              color: "#dc3545",
                              fontSize: "12px",
                              textDecoration: "underline",
                              cursor: "pointer",
                              marginTop: "8px",
                              display: "inline-block",
                            }}
                          >
                            Remove
                          </span>
                        </div>
                      </td>
                      <td
                        className="tf-cart-item_quantity"
                        cart-data-title="Quantity"
                      >
                        <div className="cart-quantity">
                          <div className="wg-quantity">
                            <span
                              className="btn-quantity minus-btn"
                              onClick={() =>
                                setQuantity(elm.ProductID, elm.quantity - 1)
                              }
                              style={{
                                cursor: "pointer",
                                padding: "8px 12px",
                                border: "1px solid #ccc",
                                backgroundColor: "#f8f9fa",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "4px 0 0 4px",
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
                              style={{
                                width: "60px",
                                textAlign: "center",
                                padding: "8px",
                                border: "1px solid #ccc",
                                borderLeft: "none",
                                borderRight: "none",
                                backgroundColor: "white",
                                borderRadius: "0",
                              }}
                            />
                            <span
                              className="btn-quantity plus-btn"
                              onClick={() =>
                                setQuantity(elm.ProductID, elm.quantity + 1)
                              }
                              style={{
                                cursor: "pointer",
                                padding: "8px 12px",
                                border: "1px solid #ccc",
                                backgroundColor: "#f8f9fa",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "0 4px 4px 0",
                              }}
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
                          style={{
                            minWidth: "60px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#333333",
                          }}
                        >
                          $
                          {(
                            (parseFloat(elm.Price) || 0) * elm.quantity
                          ).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!cartProducts.length && (
                <div className="row align-items-center mb-5">
                  <div className="col-6 fs-18">Your shop cart is empty</div>
                  <div className="col-6">
                    <Link
                      href={`/shop-default`}
                      className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                      style={{ width: "fit-content" }}
                    >
                      Explore Products!
                    </Link>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Coupon and Order Summary - Single row layout */}
          <div className="row mt-4">
            {/* Coupon Section */}
            <div className="col-md-6">
              <div className="tf-cart-coupon-section">
                <h3
                  className="mb-3"
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#333333",
                  }}
                >
                  Have a coupon code? Enter it here!
                </h3>

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
                        style={{
                          border: "1px solid #ced4da",
                          borderRadius: "4px 0 0 4px",
                          padding: "10px 15px",
                          fontSize: "14px",
                        }}
                      />
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        style={{
                          backgroundColor: "#dc3545",
                          borderColor: "#dc3545",
                          padding: "10px 20px",
                          fontWeight: "600",
                          borderRadius: "0 4px 4px 0",
                          whiteSpace: "nowrap",
                        }}
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
                    <div
                      className="alert alert-success d-flex justify-content-between align-items-center"
                      style={{
                        backgroundColor: "#d4edda",
                        border: "1px solid #c3e6cb",
                        color: "#155724",
                        borderRadius: "4px",
                        padding: "15px",
                        margin: "0",
                      }}
                    >
                      <div>
                        <strong>{appliedCoupon.name}</strong> -{" "}
                        {appliedCoupon.valueType === "percentage"
                          ? `${appliedCoupon.value}%`
                          : `$${appliedCoupon.value}`}{" "}
                        off
                        {appliedCoupon.freeShipping && " and FREE shipping"}
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleRemoveCoupon}
                        style={{
                          color: "#dc3545",
                          borderColor: "#dc3545",
                          backgroundColor: "transparent",
                          padding: "5px 10px",
                          fontSize: "12px",
                          borderRadius: "3px",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="col-md-6">
              <div className="tf-cart-order-summary">
                <div
                  className="d-flex justify-content-between mb-2"
                  style={{ fontSize: "14px" }}
                >
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div
                  className="d-flex justify-content-between mb-2"
                  style={{ fontSize: "14px" }}
                >
                  <span>Shipping:</span>
                  <span>
                    {freeShipping ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {appliedCoupon && (
                  <div
                    className="d-flex justify-content-between mb-2 text-danger"
                    style={{ fontSize: "14px" }}
                  >
                    <span>Coupon ({appliedCoupon.code}):</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div
                  className="d-flex justify-content-between mb-2"
                  style={{ fontSize: "14px" }}
                >
                  <span>Gift Certificate:</span>
                  <span>$0.00</span>
                </div>
                <div
                  className="d-flex justify-content-between mb-2"
                  style={{ fontSize: "14px" }}
                >
                  <span>Tax:</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <hr style={{ margin: "15px 0", borderColor: "#dee2e6" }} />
                <div
                  className="d-flex justify-content-between mb-3"
                  style={{ fontSize: "16px", fontWeight: "600" }}
                >
                  <strong>Grand Total:</strong>
                  <strong>${grandTotal.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Checkout */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="cart-checkbox mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="terms"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="terms"
                    style={{ fontSize: "14px" }}
                  >
                    I agree to BMR Suspension's{" "}
                    <Link href="/terms-conditions" style={{ color: "#dc3545" }}>
                      Terms & Conditions
                    </Link>
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="consent"
                    defaultChecked
                  />
                  <label
                    className="form-check-label"
                    htmlFor="consent"
                    style={{ fontSize: "14px" }}
                  >
                    I consent to emails and text messages from BMR Suspension
                  </label>
                </div>
              </div>

              <button
                className="tf-btn btn-fill animate-hover-btn radius-3 w-100"
                style={{
                  backgroundColor: "#dc3545",
                  borderColor: "#dc3545",
                  padding: "15px 30px",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                disabled={!termsAgreed}
              >
                CHECKOUT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Viewed Section */}
      <div className="container mt-5">
        <div className="row">
          <div className="col-12">
            <h3
              className="text-center mb-4"
              style={{ fontSize: "24px", fontWeight: "600", color: "#333333" }}
            >
              Recently Viewed
            </h3>
            <div className="row justify-content-center">
              {/* Placeholder for recently viewed products */}
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="col-md-3 col-sm-6 mb-4">
                  <div
                    className="recently-viewed-item"
                    style={{
                      border: "1px solid #e9ecef",
                      borderRadius: "8px",
                      padding: "20px",
                      textAlign: "center",
                      backgroundColor: "#f8f9fa",
                      minHeight: "200px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ color: "#6c757d", fontSize: "14px" }}>
                      Product image
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
