// app/api/dealer/po/route.js
// GET: current draft PO with items; POST: ensure draft exists (create if needed)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getDealerDraftPO,
  createDealerPO,
  getDealerPOWithItems,
} from "@/lib/queries";

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

    const draft = await getDealerDraftPO(customerId);
    if (!draft) {
      return NextResponse.json({ success: true, po: null, items: [] });
    }

    const full = await getDealerPOWithItems(draft.id, customerId);
    return NextResponse.json({
      success: true,
      po: {
        id: full.id,
        status: full.status,
        po_number: full.po_number,
        notes: full.notes,
        created_at: full.created_at,
        updated_at: full.updated_at,
      },
      items: full.items || [],
    });
  } catch (error) {
    console.error("Error fetching dealer PO:", error);
    return NextResponse.json({ error: "Failed to load PO" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["dealer", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = getCustomerId(session);
    if (!customerId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    let draft = await getDealerDraftPO(customerId);
    if (!draft) {
      const poId = await createDealerPO(customerId);
      draft = await getDealerPOWithItems(poId, customerId);
    } else {
      draft = await getDealerPOWithItems(draft.id, customerId);
    }

    return NextResponse.json({
      success: true,
      po: {
        id: draft.id,
        status: draft.status,
        po_number: draft.po_number,
        notes: draft.notes,
        created_at: draft.created_at,
        updated_at: draft.updated_at,
      },
      items: draft.items || [],
    });
  } catch (error) {
    console.error("Error creating dealer PO:", error);
    return NextResponse.json({ error: "Failed to create PO" }, { status: 500 });
  }
}
