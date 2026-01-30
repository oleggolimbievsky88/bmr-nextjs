// app/api/dealer/po/items/[itemId]/route.js
// PATCH: update quantity; DELETE: remove item

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";
import { updateDealerPOItem, removeDealerPOItem } from "@/lib/queries";

function getCustomerId(session) {
  if (!session?.user?.id) return null;
  const id = parseInt(session.user.id, 10);
  return Number.isNaN(id) ? null : id;
}

async function getItemPoOwner(itemId) {
  const [rows] = await pool.query(
    `SELECT d.customer_id FROM dealer_po_items i
     JOIN dealer_purchase_orders d ON i.po_id = d.id
     WHERE i.id = ? AND d.status = 'draft'`,
    [itemId],
  );
  return rows[0]?.customer_id ?? null;
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["dealer", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = getCustomerId(session);
    if (!customerId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const itemId = parseInt(params.itemId, 10);
    if (Number.isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
    }

    const ownerId = await getItemPoOwner(itemId);
    if (ownerId != null && ownerId !== customerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { quantity, colorId, colorName } = body;
    if (quantity == null && colorId === undefined && colorName === undefined) {
      return NextResponse.json(
        { error: "Provide quantity and/or colorId/colorName" },
        { status: 400 },
      );
    }

    await updateDealerPOItem(itemId, { quantity, colorId, colorName });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating PO item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["dealer", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = getCustomerId(session);
    if (!customerId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const itemId = parseInt(params.itemId, 10);
    if (Number.isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
    }

    const ownerId = await getItemPoOwner(itemId);
    if (ownerId != null && ownerId !== customerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await removeDealerPOItem(itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing PO item:", error);
    return NextResponse.json(
      { error: "Failed to remove item" },
      { status: 500 },
    );
  }
}
