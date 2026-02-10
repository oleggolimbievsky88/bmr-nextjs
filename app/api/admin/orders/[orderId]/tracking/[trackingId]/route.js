import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOrderById, deleteOrderTrackingNumber } from "@/lib/queries";

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, trackingId } = await params;
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const id = parseInt(trackingId, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid tracking id" },
        { status: 400 },
      );
    }

    const deleted = await deleteOrderTrackingNumber(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Tracking number not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tracking number:", error);
    return NextResponse.json(
      { error: "Failed to delete tracking number" },
      { status: 500 },
    );
  }
}
