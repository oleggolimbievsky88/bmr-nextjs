// app/api/admin/dealer-pos/route.js
// GET: list dealer POs (non-draft) with pagination and sorting

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAdminDealerPOsPaginated,
  getAdminDealerPOsCount,
} from "@/lib/queries";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));
    const sortColumn = searchParams.get("sortColumn") || "sent_at";
    const sortDirection = (searchParams.get("sortDirection") || "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const filters = {
      customer: searchParams.get("customer") || "",
      poNumber: searchParams.get("poNumber") || "",
      status: searchParams.get("status") || "",
      dateFrom: searchParams.get("dateFrom") || "",
      dateTo: searchParams.get("dateTo") || "",
    };

    const [pos, total] = await Promise.all([
      getAdminDealerPOsPaginated(limit, offset, sortColumn, sortDirection, filters),
      getAdminDealerPOsCount(filters),
    ]);

    return NextResponse.json({ success: true, pos, total });
  } catch (error) {
    console.error("Error fetching admin dealer POs:", error);
    return NextResponse.json(
      { error: "Failed to load POs" },
      { status: 500 },
    );
  }
}
