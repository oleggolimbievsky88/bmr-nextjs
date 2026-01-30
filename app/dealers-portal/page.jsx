"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DealersPortalDashboardPage() {
  const { data: session, status } = useSession();
  const [discountInfo, setDiscountInfo] = useState(null);

  useEffect(() => {
    if (session?.user?.role !== "dealer" && session?.user?.role !== "admin") {
      return;
    }
    fetch("/api/dealer/discount")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDiscountInfo(data);
      })
      .catch(() => {});
  }, [session]);

  if (status === "loading" || !session?.user) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const tier = discountInfo?.tier ?? session?.user?.dealerTier ?? 0;
  const discount = discountInfo?.discount ?? session?.user?.dealerDiscount ?? 0;

  return (
    <div className="my-account-content">
      <h5 className="fw-5 mb_30">Dashboard</h5>
      <div className="dashboard-hero mb-4">
        <h2 className="dashboard-title">
          Welcome, {session.user?.name || "Dealer"}
        </h2>
        <p className="dashboard-subtitle">
          Your dealer account gives you access to wholesale pricing and order
          management.
        </p>
      </div>
      <div className="dashboard-stats mb-4">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-label">Your Tier</span>
          </div>
          <div className="dashboard-card-value">Tier {tier}</div>
          <p className="dashboard-card-note mb-0">
            Assigned by your account administrator.
          </p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-label">Dealer Discount</span>
          </div>
          <div className="dashboard-card-value">{discount}%</div>
          <p className="dashboard-card-note mb-0">
            Applied to product prices in the dealer catalog.
          </p>
        </div>
      </div>
      <div className="dashboard-actions">
        <Link
          href="/dealers-portal/products"
          className="tf-btn btn-fill animate-hover-btn rounded-0"
        >
          <span>Browse Products</span>
        </Link>
        <Link
          href="/dealers-portal/orders"
          className="tf-btn btn-outline animate-hover-btn rounded-0"
        >
          <span>View Orders</span>
        </Link>
      </div>
    </div>
  );
}
