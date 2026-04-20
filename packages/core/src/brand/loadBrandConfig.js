import { getSiteUrl } from "../url/getSiteUrl.js";
import { effectiveAssetsBaseUrl } from "./resolveAssetUrl.js";
import { getBrandKey, defaultBrands, deepMerge } from "./brands.js";

let dbFetcher = null;
const CACHE_TTL_MS = (Number(process.env.BRAND_CACHE_TTL_SECONDS) || 60) * 1000;
const DB_FETCH_TIMEOUT_MS =
  (Number(process.env.BRAND_DB_FETCH_TIMEOUT_MS) || 1500) * 1;

function withTimeout(promise, timeoutMs, label) {
  if (!timeoutMs || timeoutMs <= 0) return promise;
  let timerId = null;
  const timeout = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      const err = new Error(
        `${label || "Operation"} timed out after ${timeoutMs}ms`,
      );
      err.code = "ETIMEDOUT";
      reject(err);
    }, timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timerId) clearTimeout(timerId);
  });
}
const cache = new Map();

/**
 * Register a function to fetch brand config from DB. Call from app init.
 * @param {(key: string) => Promise<object|null>} fn
 */
export function setBrandDbFetcher(fn) {
  dbFetcher = fn;
}

/**
 * Load brand config: merge DB (if available) with file defaults, apply runtime overrides.
 * Uses in-memory cache with TTL.
 */
export async function getBrandConfig() {
  const key = getBrandKey();
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.config;
  }

  const base = defaultBrands[key] || defaultBrands.bmr;
  const merged = JSON.parse(JSON.stringify(base));

  let dbConfig = null;
  if (dbFetcher) {
    try {
      dbConfig = await withTimeout(
        dbFetcher(key),
        DB_FETCH_TIMEOUT_MS,
        "Brand DB fetch",
      );
    } catch (err) {
      console.error("loadBrandConfig: DB fetch failed:", err);
    }
  }

  if (dbConfig) {
    deepMerge(merged, dbConfig);
  }

  const siteUrl = getSiteUrl();
  merged.siteUrl = siteUrl;

  // Ensure critical brand presentation defaults can't be accidentally shrunk by stale DB config.
  // Heidts specifically needs a larger logo across header/footer.
  if (String(merged.key || key).toLowerCase() === "heidts") {
    if (!merged.logo || typeof merged.logo !== "object") merged.logo = {};
    const desiredHeader = { maxWidth: "260px", maxHeight: "72px" };
    const desiredFooter = { maxWidth: "300px", maxHeight: "84px" };
    // Force larger presentation regardless of DB values.
    merged.logo.headerMaxSize = desiredHeader;
    merged.logo.footerMaxSize = desiredFooter;
  }

  // Env logo overrides must win even when the DB has stale absolute URLs
  // (e.g. dev subdomain saved in brand.logo.*).
  const envHeaderLogo =
    typeof process.env.NEXT_PUBLIC_HEADER_LOGO === "string"
      ? process.env.NEXT_PUBLIC_HEADER_LOGO.trim()
      : "";
  const envFooterLogo =
    typeof process.env.NEXT_PUBLIC_FOOTER_LOGO === "string"
      ? process.env.NEXT_PUBLIC_FOOTER_LOGO.trim()
      : "";
  if (!merged.logo || typeof merged.logo !== "object") merged.logo = {};
  if (envHeaderLogo) merged.logo.headerPath = envHeaderLogo;
  if (envFooterLogo) merged.logo.footerPath = envFooterLogo;

  const envAssets =
    (typeof process.env.NEXT_PUBLIC_ASSETS_BASE_URL === "string" &&
      process.env.NEXT_PUBLIC_ASSETS_BASE_URL.trim()) ||
    "";
  merged.assetsBaseUrl =
    envAssets || effectiveAssetsBaseUrl(merged.assetsBaseUrl, siteUrl);

  cache.set(key, { config: merged, expiresAt: now + CACHE_TTL_MS });
  return merged;
}

/**
 * Load brand config for a specific key (e.g. for /api/favicon?brand=controlfreak).
 * Same merge logic as getBrandConfig() but uses the given key instead of env.
 */
export async function getBrandConfigByKey(key) {
  const effectiveKey = key && String(key).trim() ? key : getBrandKey();
  const now = Date.now();
  const cached = cache.get(effectiveKey);
  if (cached && cached.expiresAt > now) {
    return cached.config;
  }

  const base = defaultBrands[effectiveKey] || defaultBrands.bmr;
  const merged = JSON.parse(JSON.stringify(base));

  let dbConfig = null;
  if (dbFetcher) {
    try {
      dbConfig = await withTimeout(
        dbFetcher(effectiveKey),
        DB_FETCH_TIMEOUT_MS,
        "Brand DB fetch",
      );
    } catch (err) {
      console.error("loadBrandConfig: DB fetch failed:", err);
    }
  }

  if (dbConfig) {
    deepMerge(merged, dbConfig);
  }

  const siteUrl = getSiteUrl();
  merged.siteUrl = siteUrl;

  // Same env override behavior as getBrandConfig().
  const envHeaderLogo =
    typeof process.env.NEXT_PUBLIC_HEADER_LOGO === "string"
      ? process.env.NEXT_PUBLIC_HEADER_LOGO.trim()
      : "";
  const envFooterLogo =
    typeof process.env.NEXT_PUBLIC_FOOTER_LOGO === "string"
      ? process.env.NEXT_PUBLIC_FOOTER_LOGO.trim()
      : "";
  if (!merged.logo || typeof merged.logo !== "object") merged.logo = {};
  if (envHeaderLogo) merged.logo.headerPath = envHeaderLogo;
  if (envFooterLogo) merged.logo.footerPath = envFooterLogo;

  const envAssets =
    (typeof process.env.NEXT_PUBLIC_ASSETS_BASE_URL === "string" &&
      process.env.NEXT_PUBLIC_ASSETS_BASE_URL.trim()) ||
    "";
  merged.assetsBaseUrl =
    envAssets || effectiveAssetsBaseUrl(merged.assetsBaseUrl, siteUrl);

  cache.set(effectiveKey, { config: merged, expiresAt: now + CACHE_TTL_MS });
  return merged;
}
