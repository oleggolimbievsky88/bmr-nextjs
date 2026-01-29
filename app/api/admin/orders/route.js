// app/api/admin/orders/route.js
// Admin API for managing orders

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAllOrdersAdmin,
  getOrderWithItemsAdmin,
  getOrdersCountAdmin,
  getOrderStatusHistory,
  getOrderCcRevealLog,
} from "@/lib/queries";
import { redactOrderCcToken } from "@/lib/ccEncryption";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "25");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || null;
    const orderId = searchParams.get("orderId");
    const sortColumn = searchParams.get("sortColumn") || "order_date";
    const sortDirection = searchParams.get("sortDirection") || "desc";
    const orderNumber = searchParams.get("orderNumber") || null;
    const name = searchParams.get("name") || null;
    let dateFrom = searchParams.get("dateFrom") || null;
    let dateTo = searchParams.get("dateTo") || null;
    // Include full day for dateTo (end of day)
    if (dateTo) dateTo = `${dateTo} 23:59:59`;

    if (orderId) {
      // Get single order with items
      const order = await getOrderWithItemsAdmin(orderId);
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      const [statusHistory, ccRevealLog] = await Promise.all([
        getOrderStatusHistory(order.new_order_id),
        getOrderCcRevealLog(order.new_order_id),
      ]);
      redactOrderCcToken(order, { forAdmin: true });
      return NextResponse.json({
        success: true,
        order: {
          ...order,
          status_history: statusHistory,
          cc_reveal_log: ccRevealLog,
        },
      });
    }

    // Get all orders with filters, sort, pagination
    const [orders, total] = await Promise.all([
      getAllOrdersAdmin(
        limit,
        offset,
        status,
        sortColumn,
        sortDirection,
        orderNumber,
        name,
        dateFrom,
        dateTo,
      ),
      getOrdersCountAdmin(status, orderNumber, name, dateFrom, dateTo),
    ]);
    orders.forEach((o) => redactOrderCcToken(o, { forAdmin: true }));

    return NextResponse.json({
      success: true,
      orders,
      total,
    });
  } catch (error) {
    const code = error?.code;
    const msg = error?.message || String(error);
    const sqlMessage = error?.sqlMessage;

    console.error("Error fetching orders:", {
      message: msg,
      code,
      sqlMessage,
      stack: error?.stack,
    });

    // Tables not created on this environment (run create_order_tables.sql + order_audit_tables.sql)
    const isMissingTable =
      code === "ER_NO_SUCH_TABLE" ||
      (msg && msg.includes("doesn't exist")) ||
      (sqlMessage && sqlMessage.includes("doesn't exist"));

    if (isMissingTable) {
      return NextResponse.json(
        {
          error: "Orders database not configured",
          code: "MIGRATION_REQUIRED",
          hint: "Run create_order_tables.sql and order_audit_tables.sql on this database.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
