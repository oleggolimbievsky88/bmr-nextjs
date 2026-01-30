// app/api/dealer/po/items/route.js
// POST: add item to draft PO

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDealerPOById, addDealerPOItem } from "@/lib/queries";

function getCustomerId(session) {
  if (!session?.user?.id) return null;
  const id = parseInt(session.user.id, 10);
  return Number.isNaN(id) ? null : id;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["dealer", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = getCustomerId(session);
    if (!customerId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const body = await request.json();
    const {
      poId,
      productId,
      partNumber,
      productName,
      quantity = 1,
      colorId = null,
      colorName = null,
      unitPrice,
      greaseId = null,
      greaseName = null,
      anglefinderId = null,
      anglefinderName = null,
      hardwareId = null,
      hardwareName = null,
    } = body;

    if (!poId || !productId || partNumber == null || !productName || unitPrice == null) {
      return NextResponse.json(
        { error: "Missing poId, productId, partNumber, productName, or unitPrice" },
        { status: 400 },
      );
    }

    const po = await getDealerPOById(poId, customerId);
    if (!po || po.status !== "draft") {
      return NextResponse.json(
        { error: "Draft PO not found or not yours" },
        { status: 404 },
      );
    }

    const itemId = await addDealerPOItem({
      poId,
      productId,
      partNumber: String(partNumber),
      productName: String(productName),
      quantity,
      colorId: colorId || null,
      colorName: colorName || null,
      unitPrice: parseFloat(unitPrice) || 0,
      greaseId: greaseId || null,
      greaseName: greaseName || null,
      anglefinderId: anglefinderId || null,
      anglefinderName: anglefinderName || null,
      hardwareId: hardwareId || null,
      hardwareName: hardwareName || null,
    });

    return NextResponse.json({ success: true, itemId });
  } catch (error) {
    console.error("Error adding PO item:", error);
    return NextResponse.json(
      { error: "Failed to add item" },
      { status: 500 },
    );
  }
}
