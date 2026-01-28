"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderDetail({ orderNumber }) {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/auth/my-orders/${orderNumber}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch order");
      }

      setOrder(data.order);
      setError("");
    } catch (err) {
      setError(err.message);
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: "bg-secondary",
      processed: "bg-warning",
      shipped: "bg-info",
      delivered: "bg-success",
      cancelled: "bg-danger",
    };
    return classes[status] || "bg-secondary";
  };

  if (loading) {
    return (
      <div className="my-account-content account-order">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-account-content account-order">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Link href="/my-account-orders" className="tf-btn btn-fill mt-3">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="my-account-content account-order">
        <div className="alert alert-warning" role="alert">
          Order not found
        </div>
        <Link href="/my-account-orders" className="tf-btn btn-fill mt-3">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="my-account-content account-order">
      <div className="no-print mb_30">
        <Link href="/my-account-orders" className="tf-btn btn-line mb_20">
          ← Back to Orders
        </Link>
        <div className="d-flex justify-content-between align-items-center mb_20">
          <h5 className="fw-5 mb-0">Order #{order.order_number}</h5>
          <button
            onClick={handlePrint}
            className="tf-btn btn-fill animate-hover-btn"
          >
            🖨️ Print Receipt
          </button>
        </div>
      </div>

      <div className="order-detail-wrapper">
        {/* Order Status */}
        <div className="mb_30">
          <div className="d-flex align-items-center gap-3">
            <strong>Status:</strong>
            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            {order.status === "shipped" && order.tracking_number && (
              <div className="ms-3">
                <strong>Tracking Number:</strong>{" "}
                <span className="text-info">{order.tracking_number}</span>
              </div>
            )}
          </div>
          <p className="text-muted mt-2 mb-0">
            Order Date: {formatDate(order.order_date)}
          </p>
        </div>

        {/* Billing & Shipping Info */}
        <div className="row mb_30">
          <div className="col-md-4 mb_20">
            <h6 className="fw-5 mb_15">Billing Address</h6>
            <div className="address-box">
              <p className="mb-1">
                {order.billing_first_name} {order.billing_last_name}
              </p>
              <p className="mb-1">{order.billing_address1}</p>
              {order.billing_address2 && (
                <p className="mb-1">{order.billing_address2}</p>
              )}
              <p className="mb-1">
                {order.billing_city}, {order.billing_state} {order.billing_zip}
              </p>
              <p className="mb-1">{order.billing_country}</p>
              {order.billing_phone && (
                <p className="mb-0">{order.billing_phone}</p>
              )}
              <p className="mb-0">{order.billing_email}</p>
            </div>
          </div>
          <div className="col-md-4 mb_20">
            <h6 className="fw-5 mb_15">Shipping Address</h6>
            <div className="address-box">
              <p className="mb-1">
                {order.shipping_first_name} {order.shipping_last_name}
              </p>
              <p className="mb-1">{order.shipping_address1}</p>
              {order.shipping_address2 && (
                <p className="mb-1">{order.shipping_address2}</p>
              )}
              <p className="mb-1">
                {order.shipping_city}, {order.shipping_state}{" "}
                {order.shipping_zip}
              </p>
              <p className="mb-1">{order.shipping_country}</p>
              <p className="mb-0">
                <strong>Method:</strong> {order.shipping_method}
              </p>
            </div>
          </div>
          <div className="col-md-4 mb_20">
            {(order.payment_method ||
              order.cc_last_four ||
              order.cc_type ||
              order.cc_payment_token) && (
              <>
                <h6 className="fw-5 mb_15">Payment Information</h6>
                <div className="address-box">
                  {order.payment_method && (
                    <p className="mb-1">
                      <strong>Payment Method:</strong> {order.payment_method}
                    </p>
                  )}
                  {(order.cc_type || order.cc_last_four) && (
                    <p className="mb-1">
                      <strong>Card:</strong>{" "}
                      {order.cc_type && <span>{order.cc_type} </span>}
                      {order.cc_last_four ? (
                        <span>****{order.cc_last_four}</span>
                      ) : (
                        <span>••••</span>
                      )}
                      {order.cc_exp_month && order.cc_exp_year && (
                        <span className="ms-2">
                          (Exp: {order.cc_exp_month}/
                          {String(order.cc_exp_year).slice(-2)})
                        </span>
                      )}
                    </p>
                  )}
                  {order.cc_payment_token && !order.cc_last_four && (
                    <p className="mb-0">
                      <strong>Payment:</strong> Card on file
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="mb_30">
          <h6 className="fw-5 mb_15">Order Items</h6>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Part Number</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.new_order_item_id}>
                    <td>{item.product_name}</td>
                    <td>{item.part_number}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">{formatCurrency(item.price)}</td>
                    <td className="text-end">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <div className="row">
            <div className="col-md-6 offset-md-6">
              <div className="summary-box">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>
                    {formatCurrency(
                      parseFloat(order.total) -
                        (parseFloat(order.shipping_cost) || 0) -
                        (parseFloat(order.tax) || 0) +
                        (parseFloat(order.discount) || 0),
                    )}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Discount:</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span>{formatCurrency(order.shipping_cost)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax:</span>
                  <span>{formatCurrency(parseFloat(order.tax) || 0)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-2 mt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {order.status_history?.length > 0 && (
          <div className="mb_30">
            <h6 className="fw-5 mb_15">Order timeline</h6>
            <div className="address-box">
              <ul className="list-unstyled mb-0">
                {order.status_history
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <li
                      key={entry.id}
                      className="mb-2 pb-2 border-bottom border-light"
                    >
                      <strong>
                        {formatDate(entry.created_at)} — {entry.new_status}
                      </strong>
                      {entry.tracking_number && (
                        <span className="ms-2 text-info">
                          Tracking: {entry.tracking_number}
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            .no-print {
              display: none !important;
            }
            .order-detail-wrapper {
              max-width: 100%;
            }
            .address-box,
            .summary-box {
              border: 1px solid #ddd;
              padding: 15px;
              margin-bottom: 20px;
            }
            table {
              font-size: 12px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
