import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSiteUrl } from "@bmr/core/url";

const SITE_URL = getSiteUrl();
import { getCouponByIdIfActive, getCouponByCode } from "@/lib/queries";

const PAYPAL_BASE =
  String(process.env.PAYPAL_SANDBOX || "")
    .trim()
    .toLowerCase() === "true"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

const isDev = process.env.NODE_ENV === "development";

function jsonError(message, status = 500, extra = {}) {
  return NextResponse.json({ message, ...extra }, { status });
}

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
    // Log safe hint for Vercel (no credentials)
    console.error(
      "PayPal OAuth token failed:",
      res.status,
      err?.slice?.(0, 200) || err,
    );
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
    // Trim to avoid auth failures from accidental whitespace in Vercel env vars
    const clientId = (process.env.PAYPAL_CLIENT_ID || "").trim() || null;
    const clientSecret =
      (process.env.PAYPAL_CLIENT_SECRET || "").trim() || null;

    if (!clientId || !clientSecret) {
      return jsonError(
        "PayPal is not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to your environment. See PAYPAL_SETUP.md.",
        501,
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseErr) {
      console.error("PayPal create-order: invalid JSON body", parseErr);
      return jsonError("Invalid request body.");
    }
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
      return jsonError("Missing required order data", 400);
    }

    // Require coupon to be active (is_active = 1) when one is applied
    const hasCoupon =
      couponId != null || (couponCode && String(couponCode).trim() !== "");
    if (hasCoupon) {
      const byId =
        couponId != null ? await getCouponByIdIfActive(couponId) : null;
      const byCode =
        byId == null && couponCode
          ? await getCouponByCode(String(couponCode).trim())
          : null;
      const activeCoupon = byId || byCode;
      if (!activeCoupon) {
        return jsonError(
          "The coupon is no longer valid. Please remove it and try again.",
          400,
        );
      }
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
      return jsonError("PayPal could not create order. Please try again.", 502);
    }

    let orderData;
    try {
      orderData = await createRes.json();
    } catch (parseErr) {
      console.error(
        "PayPal create-order: invalid create response JSON",
        parseErr,
      );
      return jsonError("PayPal checkout failed. Please try again.");
    }
    const paypalOrderId = orderData.id;
    const approveLink = orderData.links?.find((l) => l.rel === "approve")?.href;

    if (!approveLink) {
      console.error("PayPal response missing approve link:", orderData);
      return jsonError("PayPal checkout configuration error.", 502);
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
        )`,
      );
      await pool.query(
        "INSERT INTO paypal_pending_orders (paypal_order_id, payload) VALUES (?, ?)",
        [paypalOrderId, JSON.stringify(payload)],
      );
    } catch (dbErr) {
      console.error("PayPal create-order: DB error", {
        message: dbErr.message,
        code: dbErr.code,
        errno: dbErr.errno,
      });
      return jsonError(
        "Could not save checkout session. Please try again.",
        500,
        isDev
          ? {
              hint: "Check DB connectivity and DATABASE_URL env on Vercel.",
              detail: dbErr.message,
            }
          : {},
      );
    }

    return NextResponse.json({ approvalUrl: approveLink });
  } catch (err) {
    const msg = err?.message || String(err);
    console.error("PayPal create-order error:", msg, err?.stack);

    // User-facing message: give a hint without exposing secrets
    let userMessage =
      "PayPal checkout failed. Please try again or use another payment method.";
    if (msg.includes("token") || msg.includes("oauth") || /401|403/.test(msg)) {
      userMessage =
        "PayPal authentication failed. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env.local (local) or in Vercel → Settings → Environment Variables for Production. Use PAYPAL_SANDBOX=true for sandbox credentials, false or unset for live. Remove any leading/trailing spaces.";
    } else if (
      /ECONNREFUSED|ETIMEDOUT|connect|ER_|MySQL|ECONNRESET/.test(msg)
    ) {
      userMessage =
        "Database connection error. Check DATABASE_URL in Vercel and that the database is reachable from the server.";
    } else if (
      msg &&
      !msg.includes("PAYPAL_") &&
      !/client.?credentials|secret/i.test(msg)
    ) {
      userMessage = msg;
    }

    return jsonError(
      userMessage,
      500,
      isDev ? { detail: msg, stack: err?.stack } : {},
    );
  }
}
