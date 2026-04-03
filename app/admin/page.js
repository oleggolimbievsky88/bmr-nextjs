import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db";

const quickActions = [
  { label: "Create Product", href: "/admin/products?create=1", icon: "➕" },
  {
    label: "Create Attribute Category",
    href: "/admin/attribute-categories?create=1",
    icon: "⚙️",
  },
  {
    label: "Manage Attribute Values",
    href: "/admin/attribute-categories",
    icon: "🔧",
  },
  {
    label: "Manage Attribute Categories",
    href: "/admin/attribute-categories",
    icon: "🧩",
  },
  {
    label: "Open Summit Attribute Parser",
    href: "/admin/summit-attribute-parser",
    icon: "📋",
  },
  { label: "Create Coupon", href: "/admin/coupons?create=1", icon: "🎟️" },
  { label: "Add Platform", href: "/admin/platforms", icon: "🚗" },
];

function toDisplayStatus(status) {
  const raw = String(status || "")
    .trim()
    .toLowerCase();
  if (!raw) return "Unknown";
  if (raw === "paid") return "Paid";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

async function getDashboardData() {
  try {
    const [
      newOrdersRows,
      pendingOrdersRows,
      ordersTodayRows,
      ordersWeekRows,
      totalProductsRows,
      productAttributesRows,
      recentOrdersRows,
      recentProductsRows,
      recentAttributeCategoriesRows,
    ] = await Promise.all([
      query(
        `SELECT COUNT(*) AS total
         FROM new_orders
         WHERE order_date >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
      ),
      query(
        `SELECT COUNT(*) AS total
         FROM new_orders
         WHERE LOWER(status) = 'pending'`,
      ),
      query(
        `SELECT COUNT(*) AS total
         FROM new_orders
         WHERE order_date >= CURDATE()`,
      ),
      query(
        `SELECT COUNT(*) AS total
         FROM new_orders
         WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      ),
      query(`SELECT COUNT(*) AS total FROM products`),
      query(`SELECT COUNT(*) AS total FROM category_attributes`),
      query(
        `SELECT
           new_order_id,
           order_number,
           billing_first_name,
           billing_last_name,
           status,
           total
         FROM new_orders
         ORDER BY order_date DESC
         LIMIT 6`,
      ),
      query(
        `SELECT ProductID, PartNumber, ProductName
         FROM products
         ORDER BY ProductID DESC
         LIMIT 6`,
      ),
      query(
        `SELECT
           ac.id,
           ac.name,
           COUNT(ca.id) AS values_count
         FROM attribute_categories ac
         LEFT JOIN category_attributes ca
           ON ca.attribute_category_id = ac.id
         GROUP BY ac.id, ac.name
         ORDER BY ac.id DESC
         LIMIT 6`,
      ),
    ]);

    const stats = [
      {
        title: "New Orders",
        value: Number(newOrdersRows?.[0]?.total || 0),
        subtext: "Placed in last 24 hours",
        icon: "🛒",
        border: "primary",
        href: "/admin/orders?preset=last24h",
      },
      {
        title: "Pending Orders",
        value: Number(pendingOrdersRows?.[0]?.total || 0),
        subtext: "Awaiting action",
        icon: "⏳",
        border: "warning",
        href: "/admin/orders?status=pending",
      },
      {
        title: "Orders Today",
        value: Number(ordersTodayRows?.[0]?.total || 0),
        subtext: "Placed today",
        icon: "📦",
        border: "info",
        href: "/admin/orders?preset=today",
      },
      {
        title: "Orders This Week",
        value: Number(ordersWeekRows?.[0]?.total || 0),
        subtext: "Last 7 days",
        icon: "📈",
        border: "success",
        href: "/admin/orders?preset=week",
      },
      {
        title: "Total Products",
        value: Number(totalProductsRows?.[0]?.total || 0),
        subtext: "Products in catalog",
        icon: "🏷️",
        border: "dark",
        href: "/admin/products",
      },
      {
        title: "Product Attributes",
        value: Number(productAttributesRows?.[0]?.total || 0),
        subtext: "Fields defined across attribute sets",
        icon: "🧩",
        border: "secondary",
        href: "/admin/attribute-categories",
      },
    ];

    const recentOrders = (recentOrdersRows || []).map((order) => {
      const orderRef = order.order_number || order.new_order_id;
      return {
        id: orderRef,
        orderId: order.new_order_id,
        customer: `${order.billing_first_name || ""} ${
          order.billing_last_name || ""
        }`.trim(),
        status: toDisplayStatus(order.status),
        total: formatCurrency(order.total),
      };
    });

    const recentProducts = (recentProductsRows || []).map((product) => ({
      id: product.ProductID,
      sku: product.PartNumber || `#${product.ProductID}`,
      name: product.ProductName || "Untitled product",
    }));

    const recentAttributeCategories = (recentAttributeCategoriesRows || []).map(
      (item) => ({
        id: item.id,
        name: item.name,
        values: Number(item.values_count || 0),
      }),
    );

    return { stats, recentOrders, recentProducts, recentAttributeCategories };
  } catch (error) {
    console.error("Error loading admin dashboard data:", error);
    const fallbackStats = [
      {
        title: "New Orders",
        value: 0,
        subtext: "Placed in last 24 hours",
        icon: "🛒",
        border: "primary",
        href: "/admin/orders?preset=last24h",
      },
      {
        title: "Pending Orders",
        value: 0,
        subtext: "Awaiting action",
        icon: "⏳",
        border: "warning",
        href: "/admin/orders?status=pending",
      },
      {
        title: "Orders Today",
        value: 0,
        subtext: "Placed today",
        icon: "📦",
        border: "info",
        href: "/admin/orders?preset=today",
      },
      {
        title: "Orders This Week",
        value: 0,
        subtext: "Last 7 days",
        icon: "📈",
        border: "success",
        href: "/admin/orders?preset=week",
      },
      {
        title: "Total Products",
        value: 0,
        subtext: "Products in catalog",
        icon: "🏷️",
        border: "dark",
        href: "/admin/products",
      },
      {
        title: "Product Attributes",
        value: 0,
        subtext: "Fields defined across attribute sets",
        icon: "🧩",
        border: "secondary",
        href: "/admin/attribute-categories",
      },
    ];
    return {
      stats: fallbackStats,
      recentOrders: [],
      recentProducts: [],
      recentAttributeCategories: [],
    };
  }
}

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

function StatCard({ title, value, subtext, icon, border, href }) {
  const card = (
    <div
      className={`card h-100 shadow-sm border-0 border-start border-4 border-${border} admin-stat-card-clickable`}
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
  );

  return (
    <div className="col-12 col-sm-6 col-lg-4">
      {href ? (
        <Link
          href={href}
          className="admin-stat-card-link text-reset text-decoration-none d-block h-100"
          aria-label={`${title}: ${value}`}
        >
          {card}
        </Link>
      ) : (
        card
      )}
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

export default async function AdminPage() {
  const [session, dashboard] = await Promise.all([
    getServerSession(authOptions),
    getDashboardData(),
  ]);
  const displayName = session?.user?.name || session?.user?.email || "Admin";
  const { stats, recentOrders, recentProducts, recentAttributeCategories } =
    dashboard;

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
            href="/admin/products?create=1"
            className="btn btn-dark rounded-pill px-3"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/attribute-categories?create=1"
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
                      <td className="fw-semibold">
                        <Link
                          href={`/admin/orders?orderId=${encodeURIComponent(
                            String(order.orderId ?? ""),
                          )}`}
                          className="text-decoration-none"
                        >
                          #{order.id}
                        </Link>
                      </td>
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
                actionHref="/admin/summit-attribute-parser"
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
                      href="/admin/summit-attribute-parser"
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
                    <Link
                      key={item.id ?? item.name}
                      href={`/admin/attribute-categories/${item.id}`}
                      className="list-group-item list-group-item-action px-0 d-flex justify-content-between align-items-center"
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
                    </Link>
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
                  key={product.id ?? product.sku}
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
