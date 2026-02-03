// app/api/admin/customers/route.js
// Admin API for managing customers

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAllCustomersAdmin, getCustomersCountAdmin } from "@/lib/queries";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "25");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || null;
    const sortColumn = searchParams.get("sortColumn") || "datecreated";
    const sortDirection = searchParams.get("sortDirection") || "desc";

    const filters = {};
    const role = searchParams.get("role");
    if (role && ["customer", "admin", "vendor", "dealer"].includes(role)) {
      filters.role = role;
    }
    const dealerTier = searchParams.get("dealerTier");
    if (dealerTier !== null && dealerTier !== undefined && dealerTier !== "") {
      filters.dealerTier = dealerTier;
    }
    const dateFrom = searchParams.get("dateFrom");
    if (dateFrom) filters.dateFrom = dateFrom;
    const dateTo = searchParams.get("dateTo");
    if (dateTo) filters.dateTo = dateTo;

    const [customers, total] = await Promise.all([
      getAllCustomersAdmin(
        limit,
        offset,
        search,
        sortColumn,
        sortDirection,
        filters
      ),
      getCustomersCountAdmin(search, filters),
    ]);

    return NextResponse.json({
      success: true,
      customers,
      total,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
