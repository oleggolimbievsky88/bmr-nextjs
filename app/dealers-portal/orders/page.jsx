"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function formatPrice(val) {
  const n = parseFloat(val);
  if (Number.isNaN(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function formatDate(str) {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString();
  } catch {
    return str;
  }
}

export default function DealersPortalOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/my-orders").then((r) => r.json()),
      fetch("/api/dealer/po-list").then((r) => r.json()),
    ])
      .then(([ordersData, posData]) => {
        if (ordersData.success) setOrders(ordersData.orders || []);
        if (posData.success) setPos(posData.pos || []);
      })
      .catch((err) => {
        setError(err.message);
        setOrders([]);
        setPos([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="my-account-content account-order">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-account-content account-order">
      <h5 className="fw-5 mb_30">Orders &amp; Purchase Orders</h5>

      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      <div className="mb-4">
        <h6 className="fw-6 mb-3">Past Invoices (Orders)</h6>
        {orders.length === 0 ? (
          <p className="text-muted mb-0">You have no past orders yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.new_order_id}>
                    <td>#{order.order_number}</td>
                    <td>{formatDate(order.order_date)}</td>
                    <td>
                      <span
                        className={`badge ${
                          order.status === "completed" ||
                          order.status === "delivered"
                            ? "bg-success"
                            : order.status === "processed"
                              ? "bg-warning"
                              : order.status === "shipped"
                                ? "bg-info"
                                : "bg-secondary"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>{formatPrice(order.total)}</td>
                    <td>
                      {order.payment_status === "paid" ? (
                        <span className="text-success">Paid</span>
                      ) : (
                        <span className="text-muted">
                          {order.payment_method || "—"}
                        </span>
                      )}
                    </td>
                    <td>
                      <Link
                        href={`/my-account-orders/${order.order_number}`}
                        className="btn btn-outline-primary btn-sm me-1"
                      >
                        View
                      </Link>
                      {order.payment_status !== "paid" &&
                        order.status !== "cancelled" && (
                          <>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm me-1"
                              onClick={() =>
                                (window.location.href = `/checkout?order=${order.order_number}`)
                              }
                            >
                              Pay with CC
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() =>
                                (window.location.href = `/checkout?order=${order.order_number}&pay=paypal`)
                              }
                            >
                              PayPal
                            </button>
                          </>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h6 className="fw-6 mb-3">Purchase Orders</h6>
        {pos.length === 0 ? (
          <p className="text-muted mb-0">You have no purchase orders yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>PO #</th>
                  <th>Created</th>
                  <th>Sent</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pos.map((po) => (
                  <tr key={po.id}>
                    <td>PO #{po.id}</td>
                    <td>{formatDate(po.created_at)}</td>
                    <td>{formatDate(po.sent_at)}</td>
                    <td>
                      <span
                        className={`badge ${
                          po.status === "sent"
                            ? "bg-primary"
                            : po.status === "draft"
                              ? "bg-secondary"
                              : "bg-info"
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td>
                      {po.status === "draft" ? (
                        <Link
                          href="/dealers-portal/po"
                          className="btn btn-outline-primary btn-sm"
                        >
                          Edit / Send
                        </Link>
                      ) : (
                        <>
                          <Link
                            href={`/dealers-portal/po/${po.id}`}
                            className="btn btn-outline-primary btn-sm me-1"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm me-1"
                            onClick={() =>
                              (window.location.href = `/checkout?po=${po.id}`)
                            }
                          >
                            Pay with CC
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() =>
                              (window.location.href = `/checkout?po=${po.id}&pay=paypal`)
                            }
                          >
                            PayPal
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-3">
          <Link href="/dealers-portal/po" className="btn btn-outline-primary btn-sm">
            Create / Edit Draft PO
          </Link>
        </div>
      </div>
    </div>
  );
}
