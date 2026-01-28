// app/api/auth/my-orders/[orderNumber]/route.js
// Get single order details for authenticated user

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getOrderById,
  getOrderItems,
  getOrderStatusHistory,
} from "@/lib/queries";
import { redactOrderCcToken } from "@/lib/ccEncryption";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderNumber } = await params;
    const customerId = parseInt(session.user.id);

    // Get order
    const order = await getOrderById(orderNumber);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify order belongs to this customer
    if (order.customer_id && parseInt(order.customer_id) !== customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    redactOrderCcToken(order, { forAdmin: false });

    const [items, status_history] = await Promise.all([
      getOrderItems(order.new_order_id),
      getOrderStatusHistory(order.new_order_id),
    ]);

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items,
        status_history,
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
