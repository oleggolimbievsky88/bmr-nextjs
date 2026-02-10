// app/api/admin/orders/[orderId]/route.js
// Admin API for updating order status

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  updateOrderStatus,
  getOrderWithItemsAdmin,
  getOrderById,
  insertOrderStatusHistory,
  getOrderStatusHistory,
  getOrderCcRevealLog,
  getOrderTrackingNumbers,
} from "@/lib/queries";
import { redactOrderCcToken } from "@/lib/ccEncryption";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    const order = await getOrderWithItemsAdmin(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const [statusHistory, ccRevealLog, tracking_numbers] = await Promise.all([
      getOrderStatusHistory(order.new_order_id),
      getOrderCcRevealLog(order.new_order_id),
      getOrderTrackingNumbers(order.new_order_id),
    ]);
    redactOrderCcToken(order, { forAdmin: true });
    return NextResponse.json({
      success: true,
      order: {
        ...order,
        status_history: statusHistory,
        cc_reveal_log: ccRevealLog,
        tracking_numbers: tracking_numbers || [],
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    const body = await request.json();
    const { status, tracking_number } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    const validStatuses = [
      "pending",
      "processed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const existingOrder = await getOrderById(orderId);
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updated = await updateOrderStatus(
      orderId,
      status,
      tracking_number || null,
    );

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await insertOrderStatusHistory(
      existingOrder.new_order_id,
      session.user?.id ?? null,
      session.user?.email ?? "unknown",
      session.user?.name ?? null,
      existingOrder.status ?? null,
      status,
      tracking_number || null,
    );

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 },
    );
  }
}
