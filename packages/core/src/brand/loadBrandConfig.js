import { getSiteUrl } from "../url/getSiteUrl.js";
import { getBrandKey, defaultBrands, deepMerge } from "./brands.js";

let dbFetcher = null;
const CACHE_TTL_MS = (Number(process.env.BRAND_CACHE_TTL_SECONDS) || 60) * 1000;
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
      dbConfig = await dbFetcher(key);
    } catch (err) {
      console.error("loadBrandConfig: DB fetch failed:", err);
    }
  }

  if (dbConfig) {
    deepMerge(merged, dbConfig);
  }

  merged.siteUrl = getSiteUrl();
  merged.assetsBaseUrl =
    process.env.NEXT_PUBLIC_ASSETS_BASE_URL || merged.assetsBaseUrl || "";

  cache.set(key, { config: merged, expiresAt: now + CACHE_TTL_MS });
  return merged;
}
