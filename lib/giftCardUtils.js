/**
 * Client-safe gift card helpers (no DB or Node-only deps).
 * Use this in client components. For server-side gift card logic, use lib/giftCards.js.
 */

const GIFT_CERT_PATTERNS = [
  /^gc\d+/i, // GC050, GC100, GC500
  /gift\s*certificate/i,
];

export function isGiftCertificateProduct(item) {
  const part = (item.partNumber || "").trim();
  const name = (item.name || "").toLowerCase();
  return (
    GIFT_CERT_PATTERNS.some((p) => p.test(part)) ||
    name.includes("gift certificate")
  );
}
