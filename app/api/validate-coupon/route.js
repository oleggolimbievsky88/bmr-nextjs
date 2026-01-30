import { validateCouponForCart } from "@/lib/queries";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { couponCode, cartItems, customerId, shippingAddress } =
      await request.json();

    if (!couponCode) {
      return NextResponse.json({
        valid: false,
        message: "Coupon code is required",
      });
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({
        valid: false,
        message: "Cart items are required",
      });
    }

    console.log("API: Validating coupon:", couponCode);

    const validation = await validateCouponForCart(
      couponCode,
      cartItems,
      customerId,
      shippingAddress || null,
    );

    console.log("API: Validation result:", validation);

    // Ensure we always return a valid response format
    if (!validation || typeof validation.valid === "undefined") {
      return NextResponse.json({
        valid: false,
        message: "Error validating coupon",
      });
    }

    return NextResponse.json(validation);
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json({
      valid: false,
      message: "Error validating coupon. Please try again.",
    });
  }
}
