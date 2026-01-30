// app/api/admin/dealer-pos/route.js
// GET: list all dealer POs (non-draft)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAdminDealerPOs } from "@/lib/queries";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const list = await getAdminDealerPOs();
    return NextResponse.json({ success: true, pos: list });
  } catch (error) {
    console.error("Error fetching admin dealer POs:", error);
    return NextResponse.json(
      { error: "Failed to load POs" },
      { status: 500 },
    );
  }
}
