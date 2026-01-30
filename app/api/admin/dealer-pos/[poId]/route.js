// app/api/admin/dealer-pos/[poId]/route.js
// GET: PO detail with items (admin)

import { NextResponse } from "next/server";
import { getServerSession } from "next/auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDealerPOWithItems } from "@/lib/queries";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { poId: poIdParam } = await params;
    const poId = parseInt(poIdParam, 10);
    if (Number.isNaN(poId)) {
      return NextResponse.json({ error: "Invalid PO id" }, { status: 400 });
    }

    const po = await getDealerPOWithItems(poId, null);
    if (!po) {
      return NextResponse.json({ error: "PO not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      po: {
        id: po.id,
        customer_id: po.customer_id,
        status: po.status,
        notes: po.notes,
        admin_notes: po.admin_notes,
        created_at: po.created_at,
        sent_at: po.sent_at,
        firstname: po.firstname,
        lastname: po.lastname,
        email: po.email,
      },
      items: po.items || [],
    });
  } catch (error) {
    console.error("Error fetching dealer PO:", error);
    return NextResponse.json({ error: "Failed to load PO" }, { status: 500 });
  }
}
