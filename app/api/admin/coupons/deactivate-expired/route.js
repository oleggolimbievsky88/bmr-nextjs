// app/api/admin/coupons/deactivate-expired/route.js
// Admin API: deactivate all coupons that have expired (end_date before today)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { deactivateExpiredCouponsAdmin } from "@/lib/queries";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await deactivateExpiredCouponsAdmin();

    return NextResponse.json({
      success: true,
      message: `${count} expired coupon(s) deactivated.`,
      count,
    });
  } catch (error) {
    console.error("Error deactivating expired coupons:", error);
    return NextResponse.json(
      { error: "Failed to deactivate expired coupons" },
      { status: 500 }
    );
  }
}
