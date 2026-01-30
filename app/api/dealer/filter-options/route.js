// app/api/dealer/filter-options/route.js
// Filter options for dealer products: platforms, main categories, categories, vendors

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDealerFilterOptions } from "@/lib/queries";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "dealer" && role !== "admin") {
      return NextResponse.json(
        { error: "Dealer access required" },
        { status: 403 },
      );
    }

    const options = await getDealerFilterOptions();
    return NextResponse.json({ success: true, ...options });
  } catch (error) {
    console.error("Error fetching dealer filter options:", error);
    return NextResponse.json(
      { error: "Failed to load filter options" },
      { status: 500 },
    );
  }
}
