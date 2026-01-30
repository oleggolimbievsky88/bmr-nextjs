// app/api/dealer/resources/route.js
// GET: list dealer download resources (dealer only)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  dealerResourceCategories,
  dealerResources,
} from "@/data/dealer-resources";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["dealer", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      categories: dealerResourceCategories,
      resources: dealerResources,
    });
  } catch (error) {
    console.error("Error fetching dealer resources:", error);
    return NextResponse.json(
      { error: "Failed to load resources" },
      { status: 500 },
    );
  }
}
