// app/api/dealer/po/[poId]/route.js
// GET: single PO with items (dealer only, must own)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDealerPOWithItems } from "@/lib/queries";

function getCustomerId(session) {
  if (!session?.user?.id) return null;
  const id = parseInt(session.user.id, 10);
  return Number.isNaN(id) ? null : id;
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["dealer", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = getCustomerId(session);
    if (!customerId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const poId = parseInt(params.poId, 10);
    if (Number.isNaN(poId)) {
      return NextResponse.json({ error: "Invalid PO id" }, { status: 400 });
    }

    const full = await getDealerPOWithItems(poId, customerId);
    if (!full) {
      return NextResponse.json({ error: "PO not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      po: {
        id: full.id,
        status: full.status,
        notes: full.notes,
        created_at: full.created_at,
        sent_at: full.sent_at,
      },
      items: full.items || [],
    });
  } catch (error) {
    console.error("Error fetching dealer PO:", error);
    return NextResponse.json(
      { error: "Failed to load PO" },
      { status: 500 },
    );
  }
}
