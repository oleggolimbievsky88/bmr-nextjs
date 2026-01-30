// app/api/dealer/orders/route.js
// GET: list past orders (invoices) for the dealer

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOrdersByCustomerId } from "@/lib/queries";

function getCustomerId(session) {
  if (!session?.user?.id) return null;
  const id = parseInt(session.user.id, 10);
  return Number.isNaN(id) ? null : id;
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["dealer", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = getCustomerId(session);
    if (!customerId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "50", 10))
    );

    const orders = await getOrdersByCustomerId(customerId, limit);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching dealer orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
