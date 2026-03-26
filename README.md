# BMR Suspension E-commerce Site

This is a Next.js application built with the App Router for BMR Suspension.

## Development

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your database credentials:
   ```
   cp .env.example .env.local
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Deployment to Vercel

The app loads **products, platforms, and menu data from MySQL**. For production to work, the database must be reachable from Vercel’s servers.

## Vendor Downloads Portal (Vercel + Cloudflare R2)

This repo includes a vendor file-explorer portal intended to replace FTP downloads.

### Domains

Add these domains to the same Vercel project:

- `vendors.bmrsuspension.com`
- `vendors.controlfreaksuspension.com`

Then set DNS for each domain as instructed by Vercel (typically a CNAME to Vercel’s target).

### Cloudflare R2 storage layout

Use **one R2 bucket** and store files under prefixes:

- `bmr/...`
- `controlfreak/...`

The portal enforces brand separation by hostname → prefix mapping.

### Required environment variables (Vercel)

**Portal auth**

- `VENDOR_PORTAL_USER`
- `VENDOR_PORTAL_PASS`
- `VENDOR_PORTAL_COOKIE_SECRET` (any random string; used to sign the session cookie)

**Cloudflare R2 (S3-compatible)**

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- Optional (defaults shown):
  - `R2_PREFIX_BMR=bmr/`
  - `R2_PREFIX_CONTROLFREAK=controlfreak/`
  - `R2_ENDPOINT=https://<accountId>.r2.cloudflarestorage.com`

### Routes

- UI: `/vendor-portal` (the `vendors.*` subdomains rewrite `/` to this route)
- Auth:
  - `POST /api/vendor-auth/login`
  - `POST /api/vendor-auth/logout`
  - `GET /api/vendor-auth/session`
- Files (requires vendor session cookie):
  - `GET /api/vendor-files/list?path=...`
  - `GET /api/vendor-files/download?key=...`

### Required: `DATABASE_URL`

In Vercel, set **`DATABASE_URL`** (the app does **not** use `MYSQL_HOST` / `MYSQL_USER` / etc.):

- **Format:** `mysql://USER:PASSWORD@HOST:PORT/DATABASE`
- **Example:** `mysql://myuser:mypass@db.example.com:3306/bmrsuspension`
- **If your provider requires SSL**, add: `?ssl=true` (e.g. `mysql://.../bmrsuspension?ssl=true`).

**Important:**

- Do **not** use `localhost` or `127.0.0.1` as the host on Vercel; the server runs in the cloud and cannot reach your local machine.
- Use a MySQL host that accepts connections from the internet (e.g. PlanetScale, Railway, Aiven, or a VPS with remote access and firewall rules that allow Vercel).
- Ensure the MySQL user is allowed to connect from any host (`'user'@'%'`) if your provider uses host-based permissions.

## Troubleshooting

### API Route Errors (404/500)

If you encounter 404 errors for routes like `/fitment/[id]` or `/video/[id]`, make sure:

1. The directory structure in the `app` folder is correctly set up
2. The appropriate API routes exist in the `app/api` directory
3. The database connection environment variables are correctly set in Vercel

### Products / platforms / menu not loading on Vercel ("No platforms in this category")

This usually means the app cannot reach the database in production:

1. In Vercel → Project → **Settings → Environment Variables**, set **`DATABASE_URL`** (see "Deployment to Vercel" above). Do not rely on `MYSQL_*` variables; only `DATABASE_URL` is used.
2. Use a **remotely accessible** MySQL host (not `localhost`). Add `?ssl=true` to `DATABASE_URL` if your provider requires SSL.
3. In Vercel → **Deployments** → select a deployment → **Functions** or **Logs**, and check for connection/timeout errors when calling `/api/menu` or product APIs.

## Required Routes

This application requires the following routes to function correctly:

- `/api/menu`
- `/api/products/new-products`
- `/api/platforms/[bodyID]`
- `/fitment/[id]`
- `/video/[id]`
- `/products/bmr-merchandise`
- `/products/gift-cards`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
