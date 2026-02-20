// lib/dbBrandCore.js
// Optional second DB for shared brand config across sites.
// Uses process.env.DATABASE_BRAND_CORE_URL (same format as DATABASE_URL).
// If not set, or if it points to the same DB as DATABASE_URL, uses the main pool
// to avoid "Too many connections" from duplicate pools.
// connectionLimit kept low (2) for Vercel → Hostek so total connections stay under MySQL max.

import mysql from "mysql2/promise";
import mainPool from "./db.js";

const globalForBrandDb =
  typeof globalThis !== "undefined" ? globalThis : global;

function parseDatabaseUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    const options = {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 3306,
      user: decodeURIComponent(parsed.username || "root"),
      password: decodeURIComponent(parsed.password || ""),
      database: parsed.pathname
        ? parsed.pathname.slice(1).replace(/%2f/gi, "/")
        : "",
      waitForConnections: true,
      connectionLimit:
        Number(process.env.DATABASE_BRAND_CORE_POOL_SIZE) ||
        Number(process.env.DATABASE_POOL_SIZE) ||
        2,
      queueLimit: 0,
      connectTimeout: 60000,
    };
    const sslParam = parsed.searchParams.get("ssl");
    if (sslParam === "true" || sslParam === "1") {
      options.ssl = { rejectUnauthorized: false };
    }
    return options;
  } catch {
    return null;
  }
}

/** Same DB if host, port, and database name match (ignore user/password for comparison). */
function sameDb(url1, url2) {
  if (!url1 || !url2) return false;
  try {
    const a = new URL(url1);
    const b = new URL(url2);
    const dbA = (a.pathname || "").replace(/%2f/gi, "/").replace(/^\//, "");
    const dbB = (b.pathname || "").replace(/%2f/gi, "/").replace(/^\//, "");
    return (
      a.hostname === b.hostname &&
      (a.port || "3306") === (b.port || "3306") &&
      dbA === dbB
    );
  } catch {
    return false;
  }
}

function getBrandPool() {
  if (globalForBrandDb.__dbBrandCorePool)
    return globalForBrandDb.__dbBrandCorePool;
  const brandCoreUrl = process.env.DATABASE_BRAND_CORE_URL;
  const mainUrl = process.env.DATABASE_URL;
  if (!brandCoreUrl || sameDb(brandCoreUrl, mainUrl)) return mainPool;
  const options = parseDatabaseUrl(brandCoreUrl);
  if (!options) return mainPool;
  globalForBrandDb.__dbBrandCorePool = mysql.createPool(options);
  globalForBrandDb.__dbBrandCorePool.on("error", (err) => {
    console.error("Brand core database pool error:", {
      message: err.message,
      code: err.code,
    });
  });
  return globalForBrandDb.__dbBrandCorePool;
}

export { getBrandPool };
export default new Proxy(
  {},
  {
    get(_, prop) {
      return getBrandPool()[prop];
    },
  },
);
