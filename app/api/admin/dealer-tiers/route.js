// app/api/admin/dealer-tiers/route.js
// Admin API for dealer tier configuration (tiers 1-8, discount %)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDealerTiers, updateDealerTiersBulk } from "@/lib/queries";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tiers = await getDealerTiers();
    return NextResponse.json({ success: true, tiers });
  } catch (error) {
    console.error("Error fetching dealer tiers:", error);
    return NextResponse.json(
      { error: "Failed to fetch dealer tiers" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const tiers = Array.isArray(body.tiers) ? body.tiers : [];

    if (tiers.length === 0) {
      return NextResponse.json(
        { error: "tiers array is required" },
        { status: 400 },
      );
    }

    for (const t of tiers) {
      const tier = parseInt(t.tier, 10);
      const discount = parseFloat(t.discount_percent);
      if (tier < 1 || tier > 8) {
        return NextResponse.json(
          { error: `Tier must be 1-8, got ${tier}` },
          { status: 400 },
        );
      }
      if (isNaN(discount) || discount < 0 || discount > 100) {
        return NextResponse.json(
          { error: `Discount must be 0-100, got ${t.discount_percent}` },
          { status: 400 },
        );
      }
    }

    await updateDealerTiersBulk(tiers);
    const updated = await getDealerTiers();
    return NextResponse.json({ success: true, tiers: updated });
  } catch (error) {
    console.error("Error updating dealer tiers:", error);
    return NextResponse.json(
      { error: "Failed to update dealer tiers" },
      { status: 500 },
    );
  }
}
