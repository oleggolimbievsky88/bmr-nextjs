// app/api/dealer/discount/route.js
// Returns effective dealer discount and tier for the current session (dealer only)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getEffectiveDealerDiscount } from "@/lib/queries";

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

    const tier = session.user.dealerTier ?? 0;
    const customerDiscount = session.user.dealerDiscount ?? 0;
    const discount = await getEffectiveDealerDiscount(tier, customerDiscount);

    return NextResponse.json({
      success: true,
      tier: parseInt(tier, 10) || 0,
      discount: parseFloat(discount) || 0,
    });
  } catch (error) {
    console.error("Error fetching dealer discount:", error);
    return NextResponse.json(
      { error: "Failed to fetch dealer discount" },
      { status: 500 },
    );
  }
}
