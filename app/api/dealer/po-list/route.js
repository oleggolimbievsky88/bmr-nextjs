// app/api/dealer/po-list/route.js
// GET: list all POs for the dealer (draft, sent, etc.)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDealerPOsByCustomer } from "@/lib/queries";

function getCustomerId(session) {
  if (!session?.user?.id) return null;
  const id = parseInt(session.user.id, 10);
  return Number.isNaN(id) ? null : id;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["dealer", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = getCustomerId(session);
    if (!customerId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const pos = await getDealerPOsByCustomer(customerId);
    return NextResponse.json({ success: true, pos });
  } catch (error) {
    console.error("Error fetching dealer PO list:", error);
    return NextResponse.json(
      { error: "Failed to fetch POs" },
      { status: 500 },
    );
  }
}
