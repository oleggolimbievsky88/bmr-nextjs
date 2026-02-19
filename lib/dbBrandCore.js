// lib/dbBrandCore.js
// Optional second DB for shared brand config across sites.
// Uses process.env.DATABASE_BRAND_CORE_URL (same format as DATABASE_URL).
// If not set, falls back to the main app pool (lib/db.js) for backward compatibility.

import mysql from "mysql2/promise";
import mainPool from "./db.js";

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
      connectionLimit: 10,
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

let brandCorePool;

function getBrandPool() {
  if (brandCorePool) return brandCorePool;
  const options = parseDatabaseUrl(process.env.DATABASE_BRAND_CORE_URL);
  if (!options) return mainPool;
  brandCorePool = mysql.createPool(options);
  brandCorePool.on("error", (err) => {
    console.error("Brand core database pool error:", {
      message: err.message,
      code: err.code,
    });
  });
  return brandCorePool;
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
