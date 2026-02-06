# Going Live: bmrsuspension.com on Hostek DNS (Vercel)

Use this guide to point **bmrsuspension.com** and **www.bmrsuspension.com** to your Next.js site on Vercel using Hostek DNS.

---

## 1. Add domains in Vercel

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your project.
2. Go to **Settings** → **Domains**.
3. Add:
   - `bmrsuspension.com`
   - `www.bmrsuspension.com`
4. Vercel will show the exact DNS records to add. **Use those values** if they differ from below (they can change).

---

## 2. DNS records at Hostek

Log in to [Hostek](https://www.hostek.com) → **Domains** → **bmrsuspension.com** → **DNS** (or **Manage DNS** / **DNS Settings**).

Add these records. Remove or don’t add conflicting records for the same names.

### Root domain (bmrsuspension.com)

| Type | Name/Host | Value/Points to        | TTL  |
|------|------------|------------------------|------|
| **A**   | `@` (or leave blank) | `76.76.21.21` | 3600 |

- **Name:** `@` or blank (means “root”).
- **Value:** `76.76.21.21` (Vercel’s IP).

If Hostek supports **ALIAS** for the root and you prefer it, you can use:

| Type   | Name | Value                 | TTL  |
|--------|------|------------------------|------|
| ALIAS  | `@`  | `cname.vercel-dns.com` | 3600 |

(Use the exact target Vercel shows in the Domains page if different.)

### www subdomain (www.bmrsuspension.com)

| Type   | Name/Host | Value/Points to        | TTL  |
|--------|------------|------------------------|------|
| **CNAME** | `www`   | `cname.vercel-dns.com` | 3600 |

- **Name:** `www`.
- **Value:** `cname.vercel-dns.com` (or the CNAME target Vercel shows for `www.bmrsuspension.com`).

---

## 3. Optional: redirect root → www (or vice versa)

- If you want **bmrsuspension.com** to redirect to **www.bmrsuspension.com**:  
  Configure the redirect in Vercel (Domains → set one domain as primary; Vercel can add the redirect).
- If you want **www** to redirect to **root**:  
  Same idea: set root as primary in Vercel.

No extra DNS records are needed for the redirect; both names must point to Vercel as above.

---

## 4. SSL (HTTPS)

After DNS is correct, Vercel will issue certificates for both hostnames. This can take a few minutes to an hour. Check **Settings → Domains** for “Valid” or any error message.

---

## 5. Verify

- **DNS:** [whatsmydns.net](https://www.whatsmydns.net) — check **A** for `bmrsuspension.com` and **CNAME** for `www.bmrsuspension.com`.
- **Site:** Open `https://bmrsuspension.com` and `https://www.bmrsuspension.com` in a browser.

Allow up to 24–48 hours for full DNS propagation; often it’s within 15–60 minutes.

---

## 6. If you still use ColdFusion (device routing)

From your `DEVICE_ROUTING_SETUP.md`:

- **Desktop** → ColdFusion at **www.bmrsuspension.com**
- **Mobile** → Next.js at **dev.bmrsuspension.com**

If you are **replacing** the ColdFusion site with this Next.js app on **bmrsuspension.com** and **www.bmrsuspension.com**:

1. Point both root and www to Vercel using the records above.
2. Update env vars (e.g. in Vercel):
   - `NEXT_PUBLIC_SITE_URL=https://www.bmrsuspension.com` (or `https://bmrsuspension.com` if that’s canonical).
   - If you no longer use the CF site, you can remove or repurpose `CF_SITE_URL` and `NEXT_PUBLIC_CF_SITE_URL` later.

If you are **keeping** ColdFusion on www and only using Next.js on **dev.bmrsuspension.com**:

- Leave **www** and **root** pointing to your current ColdFusion host (don’t change those to Vercel).
- Add only a **CNAME** for **dev** → `cname.vercel-dns.com` so **dev.bmrsuspension.com** goes to Vercel.

---

## Quick reference (Hostek)

| Hostname              | Type  | Value                 |
|-----------------------|-------|------------------------|
| `@` (root)            | A     | `76.76.21.21`          |
| `www`                 | CNAME | `cname.vercel-dns.com` |

Use the values from Vercel’s **Domains** page if they differ.
