import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOrderById, addOrderTrackingNumber } from "@/lib/queries";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const trackingNumber = body.tracking_number || body.trackingNumber || "";
    const carrier = body.carrier || null;

    if (!String(trackingNumber).trim()) {
      return NextResponse.json(
        { error: "tracking_number is required" },
        { status: 400 },
      );
    }

    const id = await addOrderTrackingNumber(
      order.new_order_id,
      String(trackingNumber).trim(),
      carrier,
    );
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error adding tracking number:", error);
    return NextResponse.json(
      { error: "Failed to add tracking number" },
      { status: 500 },
    );
  }
}
