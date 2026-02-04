// app/api/dealer/po/send/route.js
// POST: send current draft PO (status -> sent)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendDealerPO } from "@/lib/queries";

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

    const body = await request.json().catch(() => ({}));
    const poId = body.poId != null ? parseInt(body.poId, 10) : null;
    if (!poId || Number.isNaN(poId)) {
      return NextResponse.json(
        { error: "Missing or invalid poId" },
        { status: 400 }
      );
    }

    const notesRaw = body.notes != null ? String(body.notes) : "";
    const notes = notesRaw.trim() ? notesRaw : null;
    const poNumberRaw = body.poNumber != null ? String(body.poNumber) : "";
    const poNumber = poNumberRaw.trim() ? poNumberRaw : null;
    const sent = await sendDealerPO(poId, customerId, {
      notes,
      poNumber,
    });
    if (!sent) {
      return NextResponse.json(
        { error: "PO not found, already sent, or not yours" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, sent: true });
  } catch (error) {
    console.error("Error sending dealer PO:", error);
    return NextResponse.json({ error: "Failed to send PO" }, { status: 500 });
  }
}
