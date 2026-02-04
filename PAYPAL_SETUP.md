# PayPal Business Account Setup

This guide helps you set up a **PayPal Business account** and connect it to your checkout so that:

- **US & Canada** customers can pay with **credit card** or **PayPal**.
- **International** (outside US & Canada) customers **must use PayPal**.

---

## 1. Create a PayPal Business Account

1. Go to [https://www.paypal.com/business](https://www.paypal.com/business).
2. Click **Sign Up** and choose **Business account**.
3. Enter your business email, create a password, and complete the signup flow.
4. Provide business details (name, address, type of business) when prompted.
5. Link a bank account and verify your identity if required by PayPal.

---

## 2. Get API Credentials (Client ID & Secret)

1. Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).
2. If prompted, log in with your Business account.
3. Go to **Apps & Credentials**.
4. Under **REST API apps**, click **Create App**.
   - Name it (e.g. "BMR Suspension Store").
   - Choose **Merchant** if you only need to receive payments.
5. After creation you’ll see:
   - **Client ID** (public, used in frontend if you use JS SDK).
   - **Secret** – click **Show** to reveal it (keep this private).
6. For **live** payments, switch the dashboard to **Live** and create or use a Live app; use its Client ID and Secret for production.

---

## 3. Add Credentials to Your Project

Add these to your environment (e.g. `.env.local` or your host’s env vars):

```env
# PayPal (from Developer Dashboard → Apps & Credentials)
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_secret_here
```

- **Sandbox**: use credentials from the **Sandbox** tab in Apps & Credentials for testing.
- **Live**: use credentials from the **Live** tab for real payments.

Never commit the Secret to git; use env vars only.

---

## 4. Complete the Create-Order API (Backend)

The route `app/api/paypal/create-order/route.js` is a stub. To finish PayPal checkout:

1. **Install** the PayPal server SDK (optional but recommended):

   ```bash
   pnpm add @paypal/checkout-server-sdk
   ```

2. **Implement** in `app/api/paypal/create-order/route.js`:
   - Get an **access token** using `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` (PayPal OAuth2).
   - Call the [PayPal Orders v2 API](https://developer.paypal.com/docs/api/orders/v2/) to **create an order** with:
     - `intent: "CAPTURE"`
     - Amount (total from your cart, in the currency you use, e.g. USD).
     - Optional: breakdown (item_total, shipping, tax, handling).
   - Set `application_context.return_url` and `cancel_url` to your site (e.g. `https://yoursite.com/checkout/paypal/return` and `.../checkout/paypal/cancel`).
   - From the created order response, take the **approval URL** from `links` (rel `approve`) and return it to the frontend as `approvalUrl`.

3. **Return URL page** (e.g. `app/checkout/paypal/return/page.jsx`):
   - Read the `token` (order ID) from the query string.
   - Call a backend route (e.g. `app/api/paypal/capture/route.js`) to **capture** the order with that ID.
   - On success, create the order in your database (reuse your existing order-creation logic), then redirect to the order confirmation page.

4. **Capture route** (`app/api/paypal/capture/route.js`):
   - Use the same PayPal client to call **Orders v2 Capture** with the order ID from the return URL.
   - After a successful capture, create the order in your DB with `payment_method: "PayPal"` and payment status completed, then return success to the frontend.

---

## 5. Payment Rules (Already Implemented)

- **`lib/paymentRules.js`**
  - `mustUsePayPal(country)` – `true` when the shipping country is **not** US or Canada.
  - `canUseCreditCard(country)` – `true` only for US and Canada.

- **Checkout**
  - If the shipping country is outside US & Canada, only the **PayPal** option is shown and the customer must pay with PayPal.
  - If the shipping country is US or Canada, the customer can choose **Credit card** or **PayPal**.

---

## 6. Testing

- Use **Sandbox** credentials and [Sandbox accounts](https://developer.paypal.com/dashboard/accounts) to test without real money.
- Test both flows: US/Canada (card + PayPal) and international (PayPal only).
- After capture, confirm the order appears in your admin with `payment_method: "PayPal"` and correct totals.

---

## 7. Go Live

- In the [Developer Dashboard](https://developer.paypal.com/dashboard/), switch to **Live**.
- Create or use a **Live** app and put its **Client ID** and **Secret** in your production env.
- Ensure return/cancel URLs use your live domain (e.g. `https://yourdomain.com/checkout/paypal/return`).

For full API reference and samples, see: [PayPal Orders v2](https://developer.paypal.com/docs/api/orders/v2/).

---

## 8. PayPal on Vercel (Production 500 errors)

If `/api/paypal/create-order` returns **500** on Vercel:

1. **Environment variables**
   In Vercel → Project → **Settings → Environment Variables**, set for Production (and Preview if needed):
   - `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` (Live credentials for production).
   - `PAYPAL_SANDBOX=true` only for sandbox/testing; leave unset or `false` for live.
   - `NEXT_PUBLIC_SITE_URL` or `VERCEL_URL` so return/cancel URLs are correct (e.g. `https://dev.bmrsuspension.com`).

2. **Database**
   The route stores the pending order in MySQL (`paypal_pending_orders`). Ensure:
   - `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` are set in Vercel.
   - If your DB requires SSL, set `MYSQL_SSL=true`.
   - The database must be reachable from Vercel (e.g. not bound to localhost; allow Vercel’s outbound IPs or use a cloud DB with public access).

3. **Logs**
   In Vercel → **Deployments** → select a deployment → **Functions** → open the log for the failing request. You’ll see either:
   - `PayPal create-order: DB error` → fix DB connectivity or env.
   - `PayPal create-order error:` / `PayPal token failed` → fix PayPal credentials or network.

After fixing env or DB, redeploy so the new variables are applied.
