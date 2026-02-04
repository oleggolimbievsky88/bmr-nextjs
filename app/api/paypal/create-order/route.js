import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { SITE_URL } from "@/lib/site-url";

const PAYPAL_BASE =
  process.env.PAYPAL_SANDBOX === "true"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

async function getPayPalAccessToken(clientId, clientSecret) {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal token failed: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.access_token;
}

/**
 * PayPal create-order API.
 * Creates a PayPal order and returns approvalUrl for redirect.
 * Stores order payload for capture after return.
 */
export async function POST(request) {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          message:
            "PayPal is not configured. Add PAYPAL_CLIENT_ID and " +
            "PAYPAL_CLIENT_SECRET to your environment. See PAYPAL_SETUP.md.",
        },
        { status: 501 }
      );
    }

    const body = await request.json();
    const {
      billing,
      shipping,
      items,
      total,
      shippingCost,
      tax,
      discount,
      shippingMethod,
      freeShipping,
      couponCode,
      couponId,
      customerId,
      notes,
    } = body;

    if (!billing || !shipping || !items || items.length === 0) {
      return NextResponse.json(
        { message: "Missing required order data" },
        { status: 400 }
      );
    }

    const totalValue =
      typeof total === "number"
        ? total.toFixed(2)
        : String(Number(total).toFixed(2));
    const returnUrl = `${SITE_URL}/checkout/paypal/return`;
    const cancelUrl = `${SITE_URL}/checkout/paypal/cancel`;

    const accessToken = await getPayPalAccessToken(clientId, clientSecret);

    const createRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: totalValue,
            },
          },
        ],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          brand_name: "BMR Suspension",
        },
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("PayPal create order failed:", createRes.status, errText);
      return NextResponse.json(
        { message: "PayPal could not create order. Please try again." },
        { status: 502 }
      );
    }

    const orderData = await createRes.json();
    const paypalOrderId = orderData.id;
    const approveLink = orderData.links?.find((l) => l.rel === "approve")?.href;

    if (!approveLink) {
      console.error("PayPal response missing approve link:", orderData);
      return NextResponse.json(
        { message: "PayPal checkout configuration error." },
        { status: 502 }
      );
    }

    // Store payload for capture (ensure table exists)
    const payload = {
      billing,
      shipping,
      items,
      shippingMethod: shippingMethod || "Standard Shipping",
      shippingCost: shippingCost ?? 0,
      freeShipping: !!freeShipping,
      tax: tax ?? 0,
      discount: discount ?? 0,
      couponCode: couponCode || "",
      couponId: couponId ?? null,
      customerId: customerId ?? null,
      notes: notes || "",
    };

    try {
      await pool.query(
        `CREATE TABLE IF NOT EXISTS paypal_pending_orders (
          paypal_order_id VARCHAR(50) PRIMARY KEY,
          payload JSON NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`
      );
      await pool.query(
        "INSERT INTO paypal_pending_orders (paypal_order_id, payload) VALUES (?, ?)",
        [paypalOrderId, JSON.stringify(payload)]
      );
    } catch (dbErr) {
      console.error("Failed to store PayPal pending order:", dbErr);
      return NextResponse.json(
        { message: "Could not save checkout session. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ approvalUrl: approveLink });
  } catch (err) {
    console.error("PayPal create-order error:", err);
    return NextResponse.json(
      { message: err.message || "PayPal checkout failed" },
      { status: 500 }
    );
  }
}
