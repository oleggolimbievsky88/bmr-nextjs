"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DealersPortalOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/my-orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.orders || []);
      })
      .catch(() => setOrders([]))
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
      <h5 className="fw-5 mb_30">My Orders</h5>
      {orders.length === 0 ? (
        <div className="text-center py-5">
          <p>You haven&apos;t placed any orders yet.</p>
          <Link
            href="/dealers-portal/products"
            className="tf-btn btn-fill mt-3"
          >
            Browse Dealer Products
          </Link>
        </div>
      ) : (
        <div className="wrap-account-order">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th className="fw-6">Order</th>
                  <th className="fw-6">Date</th>
                  <th className="fw-6">Status</th>
                  <th className="fw-6">Tracking</th>
                  <th className="fw-6">Total</th>
                  <th className="fw-6">Items</th>
                  <th className="fw-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.new_order_id} className="tf-order-item">
                    <td>#{order.order_number}</td>
                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
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
                    <td>
                      {order.status === "shipped" && order.tracking_number ? (
                        <span className="text-info">
                          {order.tracking_number}
                        </span>
                      ) : order.status === "shipped" ? (
                        <span className="text-muted">Pending</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>${parseFloat(order.total).toFixed(2)}</td>
                    <td>{order.item_count} items</td>
                    <td>
                      <Link
                        href={`/my-account-orders/${order.order_number}`}
                        className="tf-btn btn-fill animate-hover-btn rounded-0 justify-content-center"
                      >
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
