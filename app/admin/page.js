"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AdminPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processedOrders: 0,
    shippedOrders: 0,
    totalCoupons: 0,
    activeCoupons: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const ordersResponse = await fetch("/api/admin/orders");
      const ordersData = await ordersResponse.json();
      const couponsResponse = await fetch("/api/admin/coupons");
      const couponsData = await couponsResponse.json();

      if (ordersResponse.ok && couponsResponse.ok) {
        const orders = ordersData.orders || [];
        const coupons = couponsData.coupons || [];
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => o.status === "pending").length,
          processedOrders: orders.filter((o) => o.status === "processed")
            .length,
          shippedOrders: orders.filter((o) => o.status === "shipped").length,
          totalCoupons: coupons.length,
          activeCoupons: coupons.filter(
            (c) => c.is_active === 1 || c.is_active === true,
          ).length,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 mb-0">Loading dashboard...</p>
      </div>
    );
  }

  const displayName = session?.user?.name || session?.user?.email || "Admin";

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header admin-dashboard-header">
        <div>
          <h1 className="admin-dashboard-title">Admin Dashboard</h1>
          <p className="admin-dashboard-welcome">
            Welcome back, <strong>{displayName}</strong>
          </p>
        </div>
      </div>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Orders</div>
          <div className="admin-stat-value">{stats.totalOrders}</div>
          <Link href="/admin/orders" className="admin-stat-link">
            View all orders →
          </Link>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Pending Orders</div>
          <div className="admin-stat-value text-warning">
            {stats.pendingOrders}
          </div>
          <Link href="/admin/orders?status=pending" className="admin-stat-link">
            View pending →
          </Link>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Processed Orders</div>
          <div className="admin-stat-value text-info">
            {stats.processedOrders}
          </div>
          <Link
            href="/admin/orders?status=processed"
            className="admin-stat-link"
          >
            View processed →
          </Link>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Shipped Orders</div>
          <div className="admin-stat-value text-success">
            {stats.shippedOrders}
          </div>
          <Link href="/admin/orders?status=shipped" className="admin-stat-link">
            View shipped →
          </Link>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Coupons</div>
          <div className="admin-stat-value">{stats.totalCoupons}</div>
          <Link href="/admin/coupons" className="admin-stat-link">
            Manage coupons →
          </Link>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Active Coupons</div>
          <div className="admin-stat-value text-success">
            {stats.activeCoupons}
          </div>
          <Link href="/admin/coupons" className="admin-stat-link">
            Manage coupons →
          </Link>
        </div>
      </div>
      <div className="admin-quick-actions">
        <h2 className="admin-quick-actions-title">Quick Actions</h2>
        <div className="admin-quick-actions-grid">
          <Link
            href="/admin/orders"
            className="admin-quick-action-btn btn-orders"
          >
            Manage Orders
          </Link>
          <Link
            href="/admin/coupons"
            className="admin-quick-action-btn btn-coupons"
          >
            Manage Coupons
          </Link>
          <Link
            href="/admin/import"
            className="admin-quick-action-btn btn-import"
          >
            Import ACES/PIES
          </Link>
        </div>
      </div>
    </div>
  );
}
