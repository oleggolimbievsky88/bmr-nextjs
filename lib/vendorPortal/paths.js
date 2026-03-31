import { VENDOR_BRANDS, getBrandR2Prefix } from "@/lib/vendorPortal/brand";

export function normalizeRelPath(path) {
  return String(path || "")
    .replace(/^\/+/, "")
    .replace(/\.\./g, "")
    .trim();
}

export function sanitizeFolderSegment(name) {
  return String(name || "")
    .trim()
    .replace(/[/\\]/g, "")
    .replace(/\.\./g, "")
    .slice(0, 200);
}

export function sanitizeFilename(name) {
  const base = String(name || "")
    .replace(/^.*[/\\]/, "")
    .trim();
  return (
    base.replace(/\.\./g, "").replace(/[/\\]/g, "_").slice(0, 255) || "file"
  );
}

export function resolveVendorBrandKeyFromQuery(brandParam) {
  const k = String(brandParam || "")
    .trim()
    .toLowerCase();
  if (k && VENDOR_BRANDS[k]) return k;
  return (process.env.NEXT_PUBLIC_BRAND || process.env.BRAND || "bmr")
    .trim()
    .toLowerCase();
}

export function getFullKey(brandKey, relPath) {
  const base = getBrandR2Prefix(brandKey);
  const rel = normalizeRelPath(relPath);
  if (!rel) return base.endsWith("/") ? base.slice(0, -1) : base;
  return `${base}${rel}`;
}

export function ensureFullKeyUnderBrandPrefix(fullKey, brandKey) {
  const prefix = getBrandR2Prefix(brandKey);
  const k = String(fullKey || "").replace(/^\/+/, "");
  if (!k || k.includes("..")) return false;
  return k.startsWith(prefix) || k === prefix.slice(0, -1);
}
