// app/api/dealer/colors/route.js
// GET: list colors for PO line (dealer only)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAllColors } from "@/lib/queries";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["dealer", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const colors = await getAllColors();
    const list = (colors || []).map((c) => ({
      ColorID: c.ColorID,
      ColorName: c.ColorName,
    }));
    return NextResponse.json({ success: true, colors: list });
  } catch (error) {
    console.error("Error fetching dealer colors:", error);
    return NextResponse.json(
      { error: "Failed to load colors" },
      { status: 500 },
    );
  }
}
