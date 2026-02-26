# AGENTS.md

## Cursor Cloud specific instructions

### Overview

BMR Suspension is a multi-brand e-commerce Next.js 16 app (App Router, plain JavaScript — no TypeScript) using a pnpm monorepo with two workspace packages (`@bmr/core`, `@bmr/ui`). It serves two brands toggled via `BRAND` / `NEXT_PUBLIC_BRAND` env var: `bmr` (BMR Suspension) and `controlfreak` (Control Freak Suspension).

### Services

| Service | How to run | Notes |
|---------|-----------|-------|
| **Next.js dev server** | `pnpm dev` (port 3000) | Requires Node.js 22.x and MySQL running |
| **MySQL** | `sudo mysqld --user=mysql --daemonize --pid-file=/var/run/mysqld/mysqld.pid --socket=/var/run/mysqld/mysqld.sock` | Must start before dev server. Database: `bmrsuspension`, user: `bmr`/`bmrdev` |

### Important caveats

- **`next lint` does not exist in Next.js 16.** The `pnpm lint` script will fail. Use `pnpm knip` for unused code detection instead.
- **MySQL must be started manually** before running the dev server. The data directory is at `/var/lib/mysql`. Run directory `/var/run/mysqld` must exist with mysql ownership.
- **pnpm build scripts**: Some native dependencies (`@parcel/watcher`, `esbuild`, `sharp`) require build script approval. The update script handles this by adding `pnpm.onlyBuiltDependencies` temporarily during install.
- **Registration flow**: The app needs SMTP configured for email verification. In dev, the verification URL is printed to the server console log as a workaround.
- The `.env.local` file must contain at minimum: `DATABASE_URL`, `NEXTAUTH_SECRET`, `BRAND`, `NEXT_PUBLIC_BRAND`.
- Database schema is created from SQL files in `/database/`. The core tables are: `products`, `platforms`, `platform_groups`, `bodycats`, `maincategories`, `categories`, `mans`, `customers`, `vehicles`, `product_platforms`, `brands`, `site_settings`.

### Standard commands

See `package.json` scripts: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm knip`.
