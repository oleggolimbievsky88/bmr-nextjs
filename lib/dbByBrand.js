import mysql from "mysql2/promise";
import mainPool from "@/lib/db";

const globalForBrandPools =
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
      connectionLimit: Number(process.env.DATABASE_POOL_SIZE) || 2,
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

function getEnvUrlForBrand(brandKey) {
  const key = String(brandKey || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "_");
  if (!key) return null;
  const envName = `DATABASE_URL_${key}`;
  return process.env[envName] || null;
}

export function isBrandDbConfigured(brandKey) {
  const key = String(brandKey || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "_");
  if (!key) return false;
  const envName = `DATABASE_URL_${key}`;
  return Boolean(process.env[envName]);
}

export function getDbPoolForBrand(brandKey) {
  const key = String(brandKey || "")
    .trim()
    .toLowerCase();
  if (!key) return mainPool;

  if (!globalForBrandPools.__dbPoolsByBrand) {
    globalForBrandPools.__dbPoolsByBrand = {};
  }

  if (globalForBrandPools.__dbPoolsByBrand[key]) {
    return globalForBrandPools.__dbPoolsByBrand[key];
  }

  const url = getEnvUrlForBrand(key);
  if (!url) return mainPool;

  const options = parseDatabaseUrl(url);
  if (!options) return mainPool;

  const pool = mysql.createPool(options);
  pool.on("error", (err) => {
    console.error("Brand database pool error:", {
      brand: key,
      message: err.message,
      code: err.code,
    });
  });
  globalForBrandPools.__dbPoolsByBrand[key] = pool;
  return pool;
}
