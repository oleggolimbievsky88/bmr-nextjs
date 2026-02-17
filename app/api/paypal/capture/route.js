import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSiteUrl } from "@bmr/core/url";

const SITE_URL = getSiteUrl();

const PAYPAL_BASE =
  String(process.env.PAYPAL_SANDBOX || "")
    .trim()
    .toLowerCase() === "true"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

async function getPayPalAccessToken() {
  const clientId = (process.env.PAYPAL_CLIENT_ID || "").trim() || null;
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET || "").trim() || null;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal not configured");
  }
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal token failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

/**
 * Capture PayPal order and create order in our DB.
 * Called when the user returns from PayPal approval.
 * Query: token = PayPal order ID
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Missing token" },
        { status: 400 },
      );
    }

    const accessToken = await getPayPalAccessToken();

    const captureRes = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${token}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!captureRes.ok) {
      const errText = await captureRes.text();
      console.error("PayPal capture failed:", captureRes.status, errText);
      return NextResponse.json(
        {
          success: false,
          message: "PayPal capture failed. Please contact support.",
        },
        { status: 502 },
      );
    }

    const captureData = await captureRes.json();
    const paypalPayerEmail =
      captureData.payer?.email_address ||
      captureData.payment_source?.paypal?.email_address ||
      null;

    const [rows] = await pool.query(
      "SELECT payload FROM paypal_pending_orders WHERE paypal_order_id = ?",
      [token],
    );
    const row = rows?.[0];
    if (!row || !row.payload) {
      console.error("No pending order found for PayPal ID:", token);
      return NextResponse.json(
        { success: false, message: "Checkout session expired or invalid." },
        { status: 404 },
      );
    }

    const payload =
      typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;

    const orderPayload = {
      billing: payload.billing,
      shipping: payload.shipping,
      items: payload.items,
      shippingMethod: payload.shippingMethod || "Standard Shipping",
      shippingCost: payload.shippingCost ?? 0,
      freeShipping: payload.freeShipping ?? false,
      discount: payload.discount ?? 0,
      couponCode: payload.couponCode || "",
      couponId: payload.couponId ?? null,
      customerId: payload.customerId ?? null,
      notes: payload.notes || "",
      paymentMethod: "PayPal",
      paypalEmail: paypalPayerEmail || null,
    };

    const baseUrl = SITE_URL || "http://localhost:3000";
    const orderRes = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    let orderResult;
    try {
      orderResult = await orderRes.json();
    } catch {
      orderResult = {
        success: false,
        message: "Invalid response from orders API",
      };
    }

    await pool.query(
      "DELETE FROM paypal_pending_orders WHERE paypal_order_id = ?",
      [token],
    );

    if (!orderRes.ok || !orderResult.success) {
      console.error("Order creation after PayPal capture failed:", orderResult);
      const userMessage =
        orderResult.error ||
        orderResult.message ||
        "Order could not be created. Please contact support with your PayPal transaction.";
      return NextResponse.json(
        {
          success: false,
          message: userMessage,
          ...(process.env.NODE_ENV === "development" &&
            orderResult.details && { details: orderResult.details }),
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      orderNumber: orderResult.orderNumber,
      orderId: orderResult.orderId,
    });
  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Capture failed",
        ...(process.env.NODE_ENV === "development" && {
          error: err.message,
          stack: err.stack,
        }),
      },
      { status: 500 },
    );
  }
}
