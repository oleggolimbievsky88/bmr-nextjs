// app/api/admin/orders/[orderId]/decrypt-cc/route.js
// Admin-only: decrypt cc_payment_token (encrypted PAN or token) for viewing/charging.
// Never log the decrypted value.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOrderById } from "@/lib/queries";
import { decrypt } from "@/lib/ccEncryption";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = params.orderId;
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const encrypted = order.cc_payment_token;
    if (!encrypted || encrypted === "[stored]") {
      return NextResponse.json({ ccNumber: null });
    }

    const ccNumber = decrypt(encrypted);
    return NextResponse.json({ ccNumber: ccNumber || null });
  } catch (error) {
    console.error("Error in decrypt-cc:", error.message);
    return NextResponse.json({ error: "Failed to decrypt" }, { status: 500 });
  }
}
