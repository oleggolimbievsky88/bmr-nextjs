import { NextResponse } from "next/server";
import pool from "@/lib/db";
import brandCorePool from "@/lib/dbBrandCore";

export const dynamic = "force-dynamic";

function safeString(v) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function getDefaultPoolSize() {
  const isVercel = Boolean(process.env.VERCEL);
  const isProd = process.env.NODE_ENV === "production";
  return isVercel || isProd ? 1 : 2;
}

function summarizeDbUrl(url) {
  const raw = safeString(url).trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const dbName = (u.pathname || "").replace(/%2f/gi, "/").replace(/^\//, "");
    return {
      protocol: u.protocol.replace(":", ""),
      host: u.hostname,
      port: u.port || "3306",
      database: dbName || "",
      ssl:
        u.searchParams.get("ssl") === "true" ||
        u.searchParams.get("ssl") === "1",
    };
  } catch {
    return { invalid: true };
  }
}

function getEnvPresenceForBrandDbUrls() {
  const out = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (!k.startsWith("DATABASE_URL_")) continue;
    out[k] = Boolean(v);
  }
  return out;
}

async function ping(p) {
  const startedAt = Date.now();
  await p.query("SELECT 1 AS ok");
  return Date.now() - startedAt;
}

export async function GET() {
  const mainUrl = process.env.DATABASE_URL;
  const brandCoreUrl = process.env.DATABASE_BRAND_CORE_URL;

  const configuredPoolSize =
    Number(process.env.DATABASE_POOL_SIZE) || getDefaultPoolSize();
  const configuredBrandCorePoolSize =
    Number(process.env.DATABASE_BRAND_CORE_POOL_SIZE) ||
    Number(process.env.DATABASE_POOL_SIZE) ||
    getDefaultPoolSize();

  try {
    const [mainMs, brandCoreMs] = await Promise.all([
      ping(pool),
      // brandCorePool may be the same as main pool (see lib/dbBrandCore.js)
      ping(brandCorePool),
    ]);

    return NextResponse.json(
      {
        ok: true,
        now: new Date().toISOString(),
        env: {
          VERCEL: Boolean(process.env.VERCEL),
          VERCEL_ENV: safeString(process.env.VERCEL_ENV),
          NODE_ENV: safeString(process.env.NODE_ENV),
        },
        db: {
          main: {
            url: summarizeDbUrl(mainUrl),
            poolSizeConfigured: configuredPoolSize,
            pingMs: mainMs,
          },
          brandCore: {
            url: summarizeDbUrl(brandCoreUrl),
            poolSizeConfigured: configuredBrandCorePoolSize,
            pingMs: brandCoreMs,
          },
          brandDbEnvVarsPresent: getEnvPresenceForBrandDbUrls(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        now: new Date().toISOString(),
        error: safeString(error?.message) || "DB health check failed",
        db: {
          main: {
            url: summarizeDbUrl(mainUrl),
            poolSizeConfigured: configuredPoolSize,
          },
          brandCore: {
            url: summarizeDbUrl(brandCoreUrl),
            poolSizeConfigured: configuredBrandCorePoolSize,
          },
          brandDbEnvVarsPresent: getEnvPresenceForBrandDbUrls(),
        },
      },
      { status: 500 },
    );
  }
}
