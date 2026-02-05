"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { getColorBadgeClass } from "@/lib/colorBadge";

export default function PrintOrderReceipt() {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasAutoPrinted = useRef(false);

  useEffect(() => {
    if (params.orderId) {
      fetchOrder();
    }
  }, [params.orderId]);

  useEffect(() => {
    if (order && !loading && !hasAutoPrinted.current) {
      hasAutoPrinted.current = true;
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [order, loading]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/orders?orderId=${params.orderId}`
      );
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading receipt...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error || "Order not found"}
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        @media print {
          @page {
            margin: 0.5in;
            size: letter;
          }
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 100% !important;
            height: auto !important;
          }
          header,
          footer,
          nav,
          .no-print,
          .admin-page-header,
          .admin-nav,
          .topbar,
          .header,
          .footer {
            display: none !important;
          }
          .print-receipt {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-receipt * {
            color: #000 !important;
            background: transparent !important;
          }
          .print-receipt table {
            border-collapse: collapse;
            width: 100%;
            margin: 0;
          }
          .print-receipt table th,
          .print-receipt table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          .print-receipt table th {
            background: #f0f0f0 !important;
            font-weight: bold;
          }
          .print-receipt .admin-color-badge {
            display: inline-block;
            padding: 2px 6px;
            margin-top: 2px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.02em;
            color: #000 !important;
            background: #e9ecef !important;
            border: 1px solid #ccc !important;
          }
          .print-receipt .admin-color-badge.admin-color-badge--black {
            background: #1a1a1a !important;
            color: #fff !important;
            border-color: #1a1a1a !important;
          }
          .print-receipt .admin-color-badge.admin-color-badge--red {
            background: #dc3545 !important;
            color: #fff !important;
            border-color: #dc3545 !important;
          }
          .print-receipt .admin-color-badge.admin-color-badge--default {
            background: #6c757d !important;
            color: #fff !important;
            border-color: #6c757d !important;
          }
          .receipt-address-row {
            display: flex !important;
            flex-wrap: nowrap !important;
            width: 100% !important;
          }
          .receipt-address-row .receipt-col-billing,
          .receipt-address-row .receipt-col-shipping,
          .receipt-address-row .receipt-col-payment {
            flex: 0 0 33.333% !important;
            max-width: 33.333% !important;
            width: 33.333% !important;
            padding-right: 12px !important;
          }
        }
        @media screen {
          body {
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
          }
          .print-receipt {
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
            background: white;
            border: 1px solid #ddd;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>
      <div className="print-receipt">
        <div className="no-print mb-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-primary"
          >
            🖨️ Print Receipt
          </button>
          <button
            type="button"
            onClick={() => window.close()}
            className="btn btn-secondary ms-2"
          >
            Close
          </button>
        </div>

        <div className="receipt-header mb-4">
          <h1 className="h3 mb-1">Order Receipt</h1>
          <p className="text-muted mb-0">
            Order #{order.order_number} • {formatDate(order.order_date)}
          </p>
          {order.status && (
            <p className="mb-0">
              <strong>Status:</strong>{" "}
              <span className="text-capitalize">{order.status}</span>
            </p>
          )}
          {order.tracking_number && (
            <p className="mb-0">
              <strong>Tracking:</strong> {order.tracking_number}
            </p>
          )}
        </div>

        <div className="row mb-4 receipt-address-row">
          <div className="col-md-4 receipt-col-billing">
            <h5 className="mb-2">Billing Address</h5>
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
              <p className="mb-1">Phone: {order.billing_phone}</p>
            )}
            <p className="mb-0">Email: {order.billing_email}</p>
          </div>
          <div className="col-md-4 receipt-col-shipping">
            <h5 className="mb-2">Shipping Address</h5>
            <p className="mb-1">
              {order.shipping_first_name} {order.shipping_last_name}
            </p>
            <p className="mb-1">{order.shipping_address1}</p>
            {order.shipping_address2 && (
              <p className="mb-1">{order.shipping_address2}</p>
            )}
            <p className="mb-1">
              {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
            </p>
            <p className="mb-1">{order.shipping_country}</p>
            <p className="mb-1">
              <strong>Shipping method:</strong>{" "}
              {order.free_shipping && order.coupon_code
                ? `Free Shipping (Coupon: ${order.coupon_code})`
                : order.free_shipping
                ? "Free Shipping"
                : order.shipping_method || "—"}
            </p>
            {order.free_shipping ? (
              <p className="mb-0">
                <strong>
                  {order.coupon_code ? "Free (Coupon)" : "Free Shipping"}
                </strong>
              </p>
            ) : (
              <p className="mb-0">
                <strong>Shipping cost:</strong>{" "}
                {formatCurrency(parseFloat(order.shipping_cost) || 0)}
              </p>
            )}
            {order.coupon_code && (
              <p className="mb-0">
                <strong>Coupon:</strong> {order.coupon_code}
              </p>
            )}
          </div>
          <div className="col-md-4 receipt-col-payment">
            {(order.payment_method ||
              order.cc_last_four ||
              order.cc_type ||
              order.cc_payment_token ||
              order.paypal_email) && (
              <>
                <h5 className="mb-2">Payment</h5>
                {order.payment_method && (
                  <p className="mb-1">
                    <strong>Payment Method:</strong> {order.payment_method}
                    {order.payment_method === "PayPal" &&
                      order.paypal_email && (
                        <span> ({order.paypal_email})</span>
                      )}
                  </p>
                )}
                {order.payment_method !== "PayPal" && (
                  <>
                    <p className="mb-1">
                      <strong>Card:</strong>{" "}
                      {order.cc_type ? <span>{order.cc_type} </span> : null}
                      {order.cc_last_four ? (
                        <span>****{order.cc_last_four}</span>
                      ) : (
                        <span>••••</span>
                      )}
                    </p>
                    {order.cc_exp_month && order.cc_exp_year && (
                      <p className="mb-1">
                        <strong>Exp:</strong> {order.cc_exp_month}/
                        {String(order.cc_exp_year).slice(-2)}
                      </p>
                    )}
                    {order.cc_payment_token && !order.cc_last_four && (
                      <p className="mb-0">
                        <strong>Payment:</strong> Card on file
                      </p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {order.notes && order.notes.trim() && (
          <div className="mb-4">
            <h5 className="mb-2">Order Notes</h5>
            <div
              className="p-3 rounded border"
              style={{
                background: "#f8f9fa",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {order.notes}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h5 className="mb-2">Order Items</h5>
          <table className="table table-bordered">
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
                  <td>
                    <div>{item.product_name}</div>
                    {item.color != null && String(item.color).trim() !== "" && (
                      <span
                        className={`admin-color-badge admin-color-badge--${getColorBadgeClass(
                          item.color
                        ).replace("color-", "")}`}
                      >
                        {item.color}
                      </span>
                    )}
                  </td>
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

        <div className="order-summary">
          <div className="row">
            <div className="col-md-6 offset-md-6">
              <div className="border-top pt-2">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>
                    {formatCurrency(
                      order.total -
                        (parseFloat(order.shipping_cost) || 0) -
                        (parseFloat(order.tax) || 0) +
                        (parseFloat(order.discount) || 0)
                    )}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Discount:</span>
                    <span className="text-success">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span>
                    Shipping (
                    {order.free_shipping && order.coupon_code
                      ? `Free Shipping (Coupon: ${order.coupon_code})`
                      : order.free_shipping
                      ? "Free Shipping"
                      : order.shipping_method || "—"}
                    {order.free_shipping ? ", Free" : ""}):
                  </span>
                  <span>
                    {order.free_shipping
                      ? "$0.00"
                      : formatCurrency(parseFloat(order.shipping_cost) || 0)}
                  </span>
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

        {order.coupon_code && (
          <div className="mt-3">
            <p className="mb-0">
              <strong>Coupon Code:</strong> {order.coupon_code}
            </p>
          </div>
        )}

        {order.status_history?.length > 0 && (
          <div className="mt-4 pt-3 border-top">
            <h5 className="mb-2">Order timeline</h5>
            <ul className="list-unstyled mb-0 small">
              {order.status_history
                .slice()
                .reverse()
                .map((entry) => (
                  <li key={entry.id} className="mb-1">
                    {formatDate(entry.created_at)} — {entry.new_status}
                    {entry.tracking_number && (
                      <span className="ms-2">
                        (tracking: {entry.tracking_number})
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        )}

        <div className="mt-4 pt-3 border-top text-center text-muted small">
          <p className="mb-0">Thank you for your order!</p>
        </div>
      </div>
    </>
  );
}
