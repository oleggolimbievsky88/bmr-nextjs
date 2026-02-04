// app/api/admin/coupons/route.js
// Admin API for managing coupons

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAllCouponsAdmin,
  getCouponsAdminPaginated,
  getCouponByIdAdmin,
  createCouponAdmin,
} from "@/lib/queries";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const couponId = searchParams.get("id");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    if (couponId) {
      // Get single coupon
      const coupon = await getCouponByIdAdmin(couponId);
      if (!coupon) {
        return NextResponse.json(
          { error: "Coupon not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, coupon });
    }

    // Get coupons (paginated if limit provided, else all)
    if (limit != null && offset != null) {
      const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 25), 100);
      const offsetNum = Math.max(0, parseInt(offset, 10) || 0);
      const { coupons, total } = await getCouponsAdminPaginated(
        limitNum,
        offsetNum
      );
      return NextResponse.json({ success: true, coupons, total });
    }

    const coupons = await getAllCouponsAdmin();
    return NextResponse.json({
      success: true,
      coupons,
      total: coupons.length,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const couponData = await request.json();

    // Validate required fields
    if (
      !couponData.code ||
      !couponData.name ||
      !couponData.discount_type ||
      !couponData.discount_value
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: code, name, discount_type, discount_value",
        },
        { status: 400 }
      );
    }

    if (!couponData.start_date || !couponData.end_date) {
      return NextResponse.json(
        { error: "Missing required fields: start_date, end_date" },
        { status: 400 }
      );
    }

    const couponId = await createCouponAdmin(couponData);

    return NextResponse.json({
      success: true,
      message: "Coupon created successfully",
      couponId,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);

    // Check for duplicate code error
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
