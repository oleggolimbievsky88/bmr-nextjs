// app/api/admin/coupons/[couponId]/route.js
// Admin API for updating and deleting coupons

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getCouponByIdAdmin,
  updateCouponAdmin,
  updateCouponActiveStatusAdmin,
  deleteCouponAdmin,
} from "@/lib/queries";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { couponId } = await params;
    const coupon = await getCouponByIdAdmin(couponId);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { couponId } = await params;
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

    const updated = await updateCouponAdmin(couponId, couponData);

    if (!updated) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
    });
  } catch (error) {
    console.error("Error updating coupon:", error);

    // Check for duplicate code error
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { couponId } = await params;
    const id = parseInt(couponId, 10);
    if (Number.isNaN(id) || id < 1) {
      return NextResponse.json({ error: "Invalid coupon ID" }, { status: 400 });
    }
    const body = await request.json();

    if (typeof body.is_active !== "boolean") {
      return NextResponse.json(
        { error: "Missing or invalid is_active (boolean)" },
        { status: 400 }
      );
    }

    const updated = await updateCouponActiveStatusAdmin(id, body.is_active);

    if (!updated) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: body.is_active ? "Coupon enabled" : "Coupon disabled",
    });
  } catch (error) {
    console.error("Error updating coupon status:", error);
    return NextResponse.json(
      { error: "Failed to update coupon status" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { couponId } = await params;
    const deleted = await deleteCouponAdmin(couponId);

    if (!deleted) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
