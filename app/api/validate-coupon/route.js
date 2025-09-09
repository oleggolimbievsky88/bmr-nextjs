import { validateCouponForCart } from "@/lib/queries";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { couponCode, cartItems, customerId } = await request.json();

    if (!couponCode) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart items are required" },
        { status: 400 }
      );
    }

    const validation = await validateCouponForCart(
      couponCode,
      cartItems,
      customerId
    );

    return NextResponse.json(validation);
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
