"use client";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

// Email Receipt Form Component
function EmailReceiptForm({ order }) {
  const [email, setEmail] = useState(order?.billing?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/send-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          orderId: order.orderId,
          orderData: order,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setEmail("");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to send receipt");
      }
    } catch (err) {
      setError("Failed to send receipt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="alert alert-success">
        <i className="fas fa-check-circle me-2"></i>
        <strong>Receipt sent successfully!</strong> Check your email for your
        order confirmation receipt.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="email-receipt-form">
      <div className="row">
        <div className="col-md-8">
          <div className="form-group">
            <label htmlFor="receiptEmail" className="form-label">
              Email Address (or enter a different email)
            </label>
            <input
              type="email"
              className="form-control"
              id="receiptEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Sending...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2"></i>
                Send Receipt
              </>
            )}
          </button>
        </div>
      </div>
      {error && (
        <div className="alert alert-danger mt-3">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
    </form>
  );
}

export default function OrderConfirmation({ orderData }) {
  const { cartProducts } = useContextElement();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If orderData is passed as prop, use it directly
    if (orderData) {
      // Ensure notes are included if missing
      if (!orderData.notes) {
        const notesFromStorage = localStorage.getItem("orderNotes") || "";
        orderData.notes = notesFromStorage;
      }
      setOrder(orderData);
      setLoading(false);
    } else {
      // Try to get order from sessionStorage first (from checkout)
      const storedOrder = sessionStorage.getItem("orderConfirmation");
      if (storedOrder) {
        try {
          const parsedOrder = JSON.parse(storedOrder);
          // Ensure notes are included if missing
          if (!parsedOrder.notes) {
            const notesFromStorage = localStorage.getItem("orderNotes") || "";
            parsedOrder.notes = notesFromStorage;
          }
          setOrder(parsedOrder);
          setLoading(false);
          // Clear the stored order data and notes after displaying
          sessionStorage.removeItem("orderConfirmation");
          // Clear notes from localStorage after order is displayed
          setTimeout(() => {
            localStorage.removeItem("orderNotes");
          }, 1000);
          return;
        } catch (error) {
          console.error("Error parsing stored order:", error);
        }
      }

      // Otherwise, try to get order from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get("orderId");

      if (orderId) {
        // Fetch order details from API
        fetchOrderDetails(orderId);
      } else {
        setLoading(false);
      }
    }
  }, [orderData]);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const result = await response.json();
        // API returns { success: true, order: orderData }
        let orderToSet = null;
        if (result.success && result.order) {
          orderToSet = result.order;
        } else {
          // Fallback for direct order data
          orderToSet = result;
        }
        // Ensure notes are included if missing (fallback to localStorage)
        if (!orderToSet.notes || !orderToSet.notes.trim()) {
          const notesFromStorage = localStorage.getItem("orderNotes") || "";
          if (notesFromStorage) {
            orderToSet.notes = notesFromStorage;
          }
        }
        setOrder(orderToSet);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="alert alert-warning text-center">
              <h4>Order Not Found</h4>
              <p>
                We couldn't find your order details. Please contact us if you
                need assistance.
              </p>
              <Link href="/contact" className="btn btn-primary">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateSubtotal = () => {
    return order.items.reduce((total, item) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = parseFloat(order.shippingCost || 0);
    const tax = 0; // No tax for now
    const discount = parseFloat(order.discount || 0);
    return subtotal + shipping + tax - discount;
  };

  const getColorClass = (colorName) => {
    if (!colorName) return "color-default";

    const color = colorName.toLowerCase();
    if (color.includes("black") || color.includes("dark")) {
      return "color-black";
    } else if (color.includes("red")) {
      return "color-red";
    } else {
      return "color-default";
    }
  };

  return (
    <div className="container py-5 order-confirmation-page">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Receipt Header with BMR Logo */}
          <div className="receipt-header">
            <div className="receipt-header-inner">
              <Image
                src="/images/logo/bmr-logo.webp"
                alt="BMR Suspension"
                width={240}
                height={80}
                className="receipt-logo"
                priority
              />
              <div className="receipt-success">
                <div className="success-icon">
                  <i className="fas fa-check-circle" />
                </div>
                <h1 className="receipt-title">Order Confirmed!</h1>
                <p className="receipt-lead">
                  Thank you for your purchase. Your order has been successfully
                  placed.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="card order-summary-card mb-4">
            <div className="card-header">
              <h3 className="mb-0">
                <i className="fas fa-receipt me-2"></i>
                Order #{order.orderId}
              </h3>
              <small>
                Placed on{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <h5>Billing Information</h5>
                  <address>
                    {order.billing.firstName} {order.billing.lastName}
                    <br />
                    {order.billing.address1}
                    <br />
                    {order.billing.address2 && (
                      <>
                        {order.billing.address2}
                        <br />
                      </>
                    )}
                    {order.billing.city}, {order.billing.state}{" "}
                    {order.billing.zip}
                    <br />
                    {order.billing.country}
                  </address>
                </div>
                <div className="col-md-4">
                  <h5>Shipping Information</h5>
                  <address>
                    {order.shipping.firstName} {order.shipping.lastName}
                    <br />
                    {order.shipping.address1}
                    <br />
                    {order.shipping.address2 && (
                      <>
                        {order.shipping.address2}
                        <br />
                      </>
                    )}
                    {order.shipping.city}, {order.shipping.state}{" "}
                    {order.shipping.zip}
                    <br />
                    {order.shipping.country}
                  </address>
                </div>
                <div className="col-md-4">
                  <h5>Payment Information</h5>
                  <div className="payment-info">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-credit-card me-2 text-muted"></i>
                      <span>Card ending in {order.cardLastFour}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-truck me-2 text-muted"></i>
                      <span>{order.shippingMethod}</span>
                    </div>
                    {order.couponCode && (
                      <div className="d-flex align-items-center">
                        <i className="fas fa-tag me-2 text-muted"></i>
                        <span>Coupon: {order.couponCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card shadow-sm mb-4">
            <div className="card-header">
              <h4 className="mb-0">Order Items</h4>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 order-items-table">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Part Number</th>
                      <th>Color</th>
                      <th>Quantity</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center product-info">
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={50}
                                height={50}
                                className="me-3 rounded"
                              />
                            )}
                            <div className="product-details">
                              <h6 className="mb-1">{item.name}</h6>
                              <small className="text-muted">
                                {item.platform} ({item.yearRange})
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code className="part-number">{item.partNumber}</code>
                        </td>
                        <td>
                          <span
                            className={`color-badge ${getColorClass(
                              item.color,
                            )}`}
                          >
                            {item.color}
                          </span>
                        </td>
                        <td>{item.quantity}</td>
                        <td className="text-end">
                          ${parseFloat(item.price).toFixed(2)}
                        </td>
                        <td className="text-end fw-bold">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Order Totals */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row justify-content-end">
                <div className="col-md-6">
                  <div className="order-totals">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>Discount ({order.couponCode || "Coupon"}):</span>
                        <span>-${parseFloat(order.discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between mb-2">
                      <span>Shipping:</span>
                      <span>
                        ${parseFloat(order.shippingCost || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tax:</span>
                      <span>${parseFloat(order.tax || 0).toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-3">
                      <strong>Total:</strong>
                      <strong>
                        $
                        {order.total
                          ? order.total.toFixed(2)
                          : calculateTotal().toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && order.notes.trim() && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-light">
                <h4 className="mb-0">
                  <i className="fas fa-sticky-note me-2 text-primary"></i>
                  Order Notes
                </h4>
              </div>
              <div className="card-body">
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    marginBottom: 0,
                    padding: "15px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px",
                    borderLeft: "4px solid #dc3545",
                  }}
                >
                  {order.notes}
                </div>
              </div>
            </div>
          )}

          {/* Email Receipt Section */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h4 className="card-title mb-3">
                <i className="fas fa-envelope me-2"></i>
                Email Receipt
              </h4>
              <div className="alert alert-success">
                <p className="mb-3">
                  <strong>Receipt sent automatically!</strong> We've
                  automatically sent a detailed receipt to{" "}
                  <strong>{order.billing.email}</strong>. If you didn't receive
                  it, check your spam folder or use the form below to resend it.
                </p>
                <div className="mt-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => {
                      const emailForm = document.querySelector(
                        ".email-receipt-form",
                      );
                      if (emailForm) {
                        emailForm.style.display =
                          emailForm.style.display === "none" ? "block" : "none";
                      }
                    }}
                  >
                    <i className="fas fa-paper-plane me-1"></i>
                    Resend Receipt
                  </button>
                </div>
                <div
                  className="email-receipt-form mt-3"
                  style={{ display: "none" }}
                >
                  <EmailReceiptForm order={order} />
                </div>
              </div>
            </div>
          </div>

          {/* Customer Message */}
          <div className="card shadow-sm mb-4">
            <div className="card-body customer-message">
              <h4 className="card-title mb-3">
                <i className="fas fa-info-circle me-2"></i>
                What's Next?
              </h4>
              <div className="alert alert-info">
                <p className="mb-3">
                  Thank you for your purchase! We have received your order and
                  will work on shipping it out as soon as possible. Once your
                  order is processed through our system, you will receive
                  tracking information. Please note, we will not charge your
                  card until your part(s) are ready to ship out.
                </p>
                <p className="mb-3">
                  All orders are manually entered to ensure all information is
                  correct before shipment.
                </p>
                <p className="mb-0">
                  If you have any questions or would like to change any part of
                  your order, simply send us an email at{" "}
                  <a
                    href="mailto:WebSales@bmrsuspension.com"
                    className="text-decoration-none"
                  >
                    WebSales@bmrsuspension.com
                  </a>{" "}
                  or call us at{" "}
                  <a href="tel:+18139869302" className="text-decoration-none">
                    (813) 986-9302
                  </a>{" "}
                  between 8:30 - 5:00 pm Eastern time, Monday through Friday. We
                  thank you for continuing to support American manufacturing!
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center action-buttons">
            <Link href="/" className="btn btn-primary btn-lg me-3">
              <i className="fas fa-home me-2"></i>
              Continue Shopping
            </Link>
            <Link href="/contact" className="btn btn-outline-primary btn-lg">
              <i className="fas fa-envelope me-2"></i>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
