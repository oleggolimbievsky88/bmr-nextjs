import {
  getVendorBrandFromHost,
  getBrandR2Prefix,
} from "@/lib/vendorPortal/brand";
import {
  verifyVendorSessionToken,
  getVendorSessionCookieName,
} from "@/lib/vendorPortal/session";

export function requireVendorSession(request) {
  const token = request.cookies.get(getVendorSessionCookieName())?.value;
  const verified = verifyVendorSessionToken(token);
  if (!verified.ok) return { ok: false, status: 401, error: "Unauthorized" };

  const hostBrand = getVendorBrandFromHost(request.headers.get("host"));
  const tokenBrandKey = String(verified.payload?.brandKey || "");
  // Prevent cookie reuse across brand subdomains.
  if (tokenBrandKey && tokenBrandKey !== hostBrand.key) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const prefix = getBrandR2Prefix(hostBrand.key);
  return { ok: true, brand: hostBrand, prefix };
}

export function ensureKeyInPrefix(key, prefix) {
  const normalizedPrefix = String(prefix || "").replace(/^\/+/, "");
  const normalizedKey = String(key || "").replace(/^\/+/, "");
  if (!normalizedPrefix) return false;
  if (!normalizedKey) return false;
  if (normalizedKey.includes("..")) return false;
  return normalizedKey.startsWith(normalizedPrefix);
}
