"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const stats = [
  {
    title: "New Orders",
    value: 12,
    subtext: "Need review",
    icon: "🛒",
    border: "primary",
  },
  {
    title: "Pending Orders",
    value: 5,
    subtext: "Awaiting action",
    icon: "⏳",
    border: "warning",
  },
  {
    title: "Orders Today",
    value: 8,
    subtext: "Placed today",
    icon: "📦",
    border: "info",
  },
  {
    title: "Orders This Week",
    value: 34,
    subtext: "Last 7 days",
    icon: "📈",
    border: "success",
  },
  {
    title: "Total Products",
    value: 742,
    subtext: "Published products",
    icon: "🏷️",
    border: "dark",
  },
  {
    title: "Attribute Categories",
    value: 28,
    subtext: "Available to use",
    icon: "⚙️",
    border: "secondary",
  },
  {
    title: "Active Coupons",
    value: 50,
    subtext: "Currently enabled",
    icon: "🎟️",
    border: "success",
  },
];

const quickActions = [
  { label: "Add Product", href: "/admin/products", icon: "➕" },
  {
    label: "Add Attribute Category",
    href: "/admin/attribute-categories",
    icon: "⚙️",
  },
  {
    label: "Add Attribute Value",
    href: "/admin/attribute-categories",
    icon: "🔧",
  },
  {
    label: "Manage Attributes",
    href: "/admin/attribute-categories",
    icon: "🧩",
  },
  { label: "Summit Parser", href: "/admin/products", icon: "📋" },
  { label: "Create Coupon", href: "/admin/coupons", icon: "🎟️" },
  { label: "Add Platform", href: "/admin/platforms", icon: "🚗" },
];

const recentOrders = [
  { id: 10425, customer: "John Smith", status: "Pending", total: "$329.95" },
  { id: 10424, customer: "Summit Racing", status: "Paid", total: "$1,249.00" },
  {
    id: 10423,
    customer: "Mike Johnson",
    status: "Processing",
    total: "$214.99",
  },
  {
    id: 10422,
    customer: "Lethal Performance",
    status: "Pending",
    total: "$789.00",
  },
];

const recentProducts = [
  { sku: "AA001", name: "Front Control Arm" },
  { sku: "AA002", name: "Rear Control Arm" },
  { sku: "AA010", name: "Adjustable Toe Rod" },
  { sku: "CB005", name: "Sway Bar Kit" },
];

const recentAttributeCategories = [
  { name: "Bushing Material", values: 3 },
  { name: "Control Arm Style", values: 4 },
  { name: "Finish", values: 2 },
  { name: "Rod End Type", values: 5 },
];

function StatusBadge({ status }) {
  const map = {
    Pending: "warning",
    Paid: "success",
    Processing: "info",
    Shipped: "primary",
    Cancelled: "danger",
  };

  return (
    <span className={`badge text-bg-${map[status] || "secondary"}`}>
      {status}
    </span>
  );
}

function StatCard({ title, value, subtext, icon, border }) {
  return (
    <div className="col-12 col-sm-6 col-xl-3">
      <div
        className={`card h-100 shadow-sm border-0 border-start border-4 border-${border}`}
      >
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <div className="text-muted small fw-semibold text-uppercase">
                {title}
              </div>
              <div className="display-6 fw-bold lh-1 mt-2">{value}</div>
            </div>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-light"
              style={{ width: 48, height: 48, fontSize: 22 }}
            >
              {icon}
            </div>
          </div>
          <div className="text-muted small">{subtext}</div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, actionLabel, actionHref, children }) {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-header bg-white border-0 pt-3 pb-0">
        <div className="d-flex align-items-center justify-content-between gap-2">
          <h5 className="mb-0 fw-bold">{title}</h5>
          {actionLabel && actionHref ? (
            <Link
              href={actionHref}
              className="btn btn-sm btn-outline-dark rounded-pill"
            >
              {actionLabel}
            </Link>
          ) : null}
        </div>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

export default function AdminPage() {
  const { data: session } = useSession();
  const displayName = session?.user?.name || session?.user?.email || "Admin";

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted mb-0">
            Welcome back, <strong>{displayName}</strong>. Quick overview of
            orders, products, coupons, and product attribute activity.
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <Link
            href="/admin/products"
            className="btn btn-dark rounded-pill px-3"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/attribute-categories"
            className="btn btn-warning rounded-pill px-3"
          >
            + Attribute Category
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {stats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 className="fw-bold mb-1">Quick Actions</h5>
              <p className="text-muted mb-0 small">
                Shortcuts for the tasks you’ll use the most.
              </p>
            </div>
          </div>

          <div className="row g-2 g-md-3">
            {quickActions.map((action) => (
              <div
                className="col-12 col-sm-6 col-lg-4 col-xl-3"
                key={action.label}
              >
                <Link
                  href={action.href}
                  className="btn btn-light border w-100 text-start p-3 rounded-4 shadow-sm h-100 d-flex align-items-center gap-3"
                  style={{ minHeight: 74 }}
                >
                  <span
                    className="rounded-circle bg-white border d-inline-flex align-items-center justify-content-center"
                    style={{ width: 42, height: 42, fontSize: 18 }}
                  >
                    {action.icon}
                  </span>
                  <span className="fw-semibold">{action.label}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <SectionCard
            title="Recent Orders"
            actionLabel="View All Orders"
            actionHref="/admin/orders"
          >
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="fw-semibold">#{order.id}</td>
                      <td>{order.customer}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="text-end fw-semibold">{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <div className="col-12 col-xl-5">
          <div className="row g-4">
            <div className="col-12">
              <SectionCard
                title="Summit Attribute Parser"
                actionLabel="Open Parser"
                actionHref="/admin/products"
              >
                <div className="d-flex flex-column gap-3">
                  <p className="text-muted mb-0">
                    Paste Summit Racing attributes and let the system create
                    missing product attribute categories automatically before
                    attaching values.
                  </p>

                  <div className="rounded-4 border bg-light p-3">
                    <div className="small text-muted mb-1">
                      Recommended workflow
                    </div>
                    <ol className="mb-0 ps-3 small">
                      <li>Paste Summit attributes</li>
                      <li>Auto-detect missing categories</li>
                      <li>Create missing categories</li>
                      <li>Attach parsed values to the product</li>
                    </ol>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <Link
                      href="/admin/products"
                      className="btn btn-dark rounded-pill"
                    >
                      Launch Parser
                    </Link>
                    <Link
                      href="/admin/attribute-categories"
                      className="btn btn-outline-secondary rounded-pill"
                    >
                      Add Category Manually
                    </Link>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="col-12">
              <SectionCard
                title="Recent Attribute Categories"
                actionLabel="Manage"
                actionHref="/admin/attribute-categories"
              >
                <div className="list-group list-group-flush">
                  {recentAttributeCategories.map((item) => (
                    <div
                      key={item.name}
                      className="list-group-item px-0 d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="fw-semibold">{item.name}</div>
                        <div className="small text-muted">
                          {item.values} values
                        </div>
                      </div>
                      <span className="badge text-bg-light border">
                        {item.values}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <SectionCard
            title="Recently Added Products"
            actionLabel="Manage Products"
            actionHref="/admin/products"
          >
            <div className="list-group list-group-flush">
              {recentProducts.map((product) => (
                <div
                  key={product.sku}
                  className="list-group-item px-0 d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div className="fw-semibold">{product.name}</div>
                    <div className="small text-muted">{product.sku}</div>
                  </div>
                  <Link
                    href={`/admin/products?search=${product.sku}`}
                    className="btn btn-sm btn-outline-dark rounded-pill"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="col-12 col-lg-6">
          <SectionCard
            title="Data Entry Focus"
            actionLabel="Go to Attributes"
            actionHref="/admin/attribute-categories"
          >
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <div className="rounded-4 border p-3 h-100">
                  <div className="small text-muted text-uppercase fw-semibold mb-1">
                    Priority
                  </div>
                  <div className="fw-bold mb-2">Product Attributes</div>
                  <p className="text-muted small mb-0">
                    Keep attribute categories easy to create, easy to reuse, and
                    hard to duplicate.
                  </p>
                </div>
              </div>

              <div className="col-12 col-sm-6">
                <div className="rounded-4 border p-3 h-100">
                  <div className="small text-muted text-uppercase fw-semibold mb-1">
                    Goal
                  </div>
                  <div className="fw-bold mb-2">Faster Product Entry</div>
                  <p className="text-muted small mb-0">
                    Let staff paste Summit attributes once and avoid bouncing
                    between multiple admin pages.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
