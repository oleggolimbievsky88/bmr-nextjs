"use client";

import { useState, useEffect } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [revealedCc, setRevealedCc] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === "all"
          ? "/api/admin/orders"
          : `/api/admin/orders?status=${statusFilter}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch orders");
      }

      setOrders(data.orders || []);
      setError("");
    } catch (err) {
      setError(err.message);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId,
    newStatus,
    trackingNumber = null,
  ) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          tracking_number: trackingNumber || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order status");
      }

      fetchOrders();
      if (selectedOrder?.new_order_id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus,
          tracking_number: trackingNumber || selectedOrder.tracking_number,
        });
      }
    } catch (err) {
      alert(err.message);
      console.error("Error updating order status:", err);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/admin/orders?orderId=${orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch order details");
      }

      setRevealedCc(null);
      setSelectedOrder(data.order);
    } catch (err) {
      alert(err.message);
      console.error("Error fetching order details:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  if (loading && orders.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 mb-0">Loading orders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Orders Management</h1>
        <div className="admin-toolbar">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: "auto", minWidth: "160px" }}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processed">Processed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            type="button"
            onClick={fetchOrders}
            className="admin-btn-primary"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="admin-alert-error">{error}</div>}

      {selectedOrder && (
        <div
          className="admin-modal-backdrop"
          onClick={() => {
            setRevealedCc(null);
            setSelectedOrder(null);
          }}
          role="presentation"
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
          >
            <div className="admin-modal-header">
              <h2 id="order-modal-title">
                Order: {selectedOrder.order_number}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setRevealedCc(null);
                  setSelectedOrder(null);
                }}
                className="admin-modal-close"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <h3 className="h6 fw-6 mb-2">Billing Information</h3>
                  <p className="mb-1">
                    {selectedOrder.billing_first_name}{" "}
                    {selectedOrder.billing_last_name}
                  </p>
                  <p className="mb-1">{selectedOrder.billing_address1}</p>
                  {selectedOrder.billing_address2 && (
                    <p className="mb-1">{selectedOrder.billing_address2}</p>
                  )}
                  <p className="mb-1">
                    {selectedOrder.billing_city}, {selectedOrder.billing_state}{" "}
                    {selectedOrder.billing_zip}
                  </p>
                  <p className="mb-1">{selectedOrder.billing_country}</p>
                  <p className="mb-1">{selectedOrder.billing_email}</p>
                  {selectedOrder.billing_phone && (
                    <p className="mb-1">{selectedOrder.billing_phone}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <h3 className="h6 fw-6 mb-2">Shipping Information</h3>
                  <p className="mb-1">
                    {selectedOrder.shipping_first_name}{" "}
                    {selectedOrder.shipping_last_name}
                  </p>
                  <p className="mb-1">{selectedOrder.shipping_address1}</p>
                  {selectedOrder.shipping_address2 && (
                    <p className="mb-1">{selectedOrder.shipping_address2}</p>
                  )}
                  <p className="mb-1">
                    {selectedOrder.shipping_city},{" "}
                    {selectedOrder.shipping_state} {selectedOrder.shipping_zip}
                  </p>
                  <p className="mb-1">{selectedOrder.shipping_country}</p>
                  <p className="mb-1">
                    <strong>Method:</strong> {selectedOrder.shipping_method}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="h6 fw-6 mb-2">Order Items</h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Part Number</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.new_order_item_id}>
                          <td>{item.product_name}</td>
                          <td>{item.part_number}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">
                            {formatCurrency(item.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="h6 fw-6 mb-2">Order Summary</h3>
                <div className="d-flex justify-content-end">
                  <div style={{ minWidth: "200px" }}>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>
                        {formatCurrency(
                          selectedOrder.total -
                            (parseFloat(selectedOrder.shipping_cost) || 0) -
                            (parseFloat(selectedOrder.tax) || 0) +
                            (parseFloat(selectedOrder.discount) || 0),
                        )}
                      </span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>Discount:</span>
                        <span>-{formatCurrency(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between mb-2">
                      <span>Shipping:</span>
                      <span>{formatCurrency(selectedOrder.shipping_cost)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tax:</span>
                      <span>
                        {formatCurrency(parseFloat(selectedOrder.tax) || 0)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between fw-7 border-top pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {(selectedOrder.cc_last_four ||
                selectedOrder.cc_payment_token) && (
                <div className="mb-4">
                  <h3 className="h6 fw-6 mb-2">Payment (card on file)</h3>
                  <p className="mb-1">
                    {selectedOrder.cc_type && (
                      <span>{selectedOrder.cc_type} </span>
                    )}
                    {selectedOrder.cc_last_four ? (
                      <span>****{selectedOrder.cc_last_four}</span>
                    ) : (
                      <span>••••</span>
                    )}
                    {selectedOrder.cc_exp_month &&
                      selectedOrder.cc_exp_year && (
                        <span className="ms-2">
                          Exp {selectedOrder.cc_exp_month}/
                          {String(selectedOrder.cc_exp_year).slice(-2)}
                        </span>
                      )}
                  </p>
                  {selectedOrder.cc_last_four && (
                    <button
                      type="button"
                      onClick={async () => {
                        setRevealedCc({
                          loading: true,
                          value: null,
                          error: null,
                        });
                        try {
                          const res = await fetch(
                            `/api/admin/orders/${selectedOrder.new_order_id}/decrypt-cc`,
                          );
                          const data = await res.json();
                          if (!res.ok)
                            throw new Error(data.error || "Failed to decrypt");
                          setRevealedCc({
                            loading: false,
                            value: data.ccNumber || null,
                            error: null,
                          });
                        } catch (e) {
                          setRevealedCc({
                            loading: false,
                            value: null,
                            error: e.message,
                          });
                        }
                      }}
                      className="admin-btn-secondary mt-1"
                      style={{ fontSize: "13px" }}
                      disabled={revealedCc?.loading}
                    >
                      {revealedCc?.loading ? "..." : "Reveal card number"}
                    </button>
                  )}
                  {revealedCc?.value != null && (
                    <div className="mt-2">
                      <code style={{ fontSize: "14px", letterSpacing: "1px" }}>
                        {revealedCc.value}
                      </code>
                      <button
                        type="button"
                        onClick={() => setRevealedCc(null)}
                        className="btn btn-link btn-sm ms-2"
                      >
                        Hide
                      </button>
                    </div>
                  )}
                  {revealedCc?.error && (
                    <p className="text-danger small mt-1">{revealedCc.error}</p>
                  )}
                </div>
              )}

              <div className="admin-form-group mb-4">
                <label htmlFor="tracking-number">
                  Tracking Number (for shipped orders)
                </label>
                <input
                  type="text"
                  id="tracking-number"
                  className="form-control"
                  placeholder="Enter tracking number"
                  defaultValue={selectedOrder.tracking_number || ""}
                />
              </div>
              <div className="admin-toolbar">
                {selectedOrder.status === "pending" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateOrderStatus(selectedOrder.new_order_id, "processed")
                    }
                    className="admin-btn-primary"
                  >
                    Mark as Processed
                  </button>
                )}
                {selectedOrder.status === "processed" && (
                  <button
                    type="button"
                    onClick={() => {
                      const trackingInput =
                        document.getElementById("tracking-number");
                      const trackingNumber = trackingInput?.value || "";
                      updateOrderStatus(
                        selectedOrder.new_order_id,
                        "shipped",
                        trackingNumber,
                      );
                    }}
                    className="admin-btn-primary"
                    style={{ background: "var(--success)" }}
                  >
                    Mark as Shipped
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setRevealedCc(null);
                    setSelectedOrder(null);
                  }}
                  className="admin-btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-secondary py-4">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.new_order_id}>
                    <td>
                      <strong>{order.order_number}</strong>
                    </td>
                    <td>{formatDate(order.order_date)}</td>
                    <td>
                      {order.billing_first_name} {order.billing_last_name}
                      <br />
                      <small className="text-secondary">
                        {order.billing_email}
                      </small>
                    </td>
                    <td className="text-center">
                      {order.item_count || 0} items
                    </td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <span
                        className={`admin-status-badge ${order.status || "pending"}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => viewOrderDetails(order.new_order_id)}
                        className="admin-btn-secondary me-2"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "13px" }}
                      >
                        View
                      </button>
                      {order.status === "pending" && (
                        <button
                          type="button"
                          onClick={() =>
                            updateOrderStatus(order.new_order_id, "processed")
                          }
                          className="admin-btn-primary me-2"
                          style={{
                            padding: "0.25rem 0.5rem",
                            fontSize: "13px",
                          }}
                        >
                          Process
                        </button>
                      )}
                      {order.status === "processed" && (
                        <button
                          type="button"
                          onClick={() => {
                            const tracking = prompt(
                              "Enter tracking number (optional):",
                            );
                            updateOrderStatus(
                              order.new_order_id,
                              "shipped",
                              tracking || null,
                            );
                          }}
                          className="admin-btn-primary"
                          style={{
                            padding: "0.25rem 0.5rem",
                            fontSize: "13px",
                            background: "var(--success)",
                          }}
                        >
                          Ship
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
