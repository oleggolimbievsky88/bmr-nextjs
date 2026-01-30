import { NextResponse } from "next/server";

/**
 * PayPal create-order API.
 * When PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set, creates a PayPal
 * order and returns approvalUrl for redirect. Otherwise returns 501.
 * See PAYPAL_SETUP.md for Business account setup and env configuration.
 */
export async function POST(request) {
	try {
		const clientId = process.env.PAYPAL_CLIENT_ID
		const clientSecret = process.env.PAYPAL_CLIENT_SECRET

		if (!clientId || !clientSecret) {
			return NextResponse.json(
				{
					message:
						"PayPal is not configured. Add PAYPAL_CLIENT_ID and " +
						"PAYPAL_CLIENT_SECRET to your environment. See PAYPAL_SETUP.md.",
				},
				{ status: 501 },
			)
		}

		const body = await request.json()
		const { billing, shipping, items, total, shippingCost, tax, discount } =
			body

		if (!billing || !shipping || !items || items.length === 0) {
			return NextResponse.json(
				{ message: "Missing required order data" },
				{ status: 400 },
			)
		}

		// TODO: Implement PayPal Orders API v2
		// 1. Get access token from PayPal OAuth2
		// 2. Create order with amount breakdown and return_url/cancel_url
		// 3. Return approval URL from order.links for redirect
		// Docs: https://developer.paypal.com/docs/api/orders/v2/
		return NextResponse.json(
			{
				message:
					"PayPal create-order not yet implemented. " +
					"Add implementation using PayPal Orders v2 API. See PAYPAL_SETUP.md.",
			},
			{ status: 501 },
		)
	} catch (err) {
		console.error("PayPal create-order error:", err)
		return NextResponse.json(
			{ message: "PayPal checkout failed" },
			{ status: 500 },
		)
	}
}
