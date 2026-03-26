import crypto from "crypto";

const COOKIE_NAME = "vendor_portal_session";
const COOKIE_MAX_AGE_SECONDS = 6 * 60 * 60; // 6 hours

function getSecret() {
  const secret = process.env.VENDOR_PORTAL_COOKIE_SECRET;
  if (!secret) {
    throw new Error("Missing VENDOR_PORTAL_COOKIE_SECRET");
  }
  return secret;
}

function base64urlEncode(input) {
  return Buffer.from(input).toString("base64url");
}

function base64urlDecode(input) {
  return Buffer.from(String(input), "base64url").toString("utf8");
}

function sign(data) {
  const h = crypto.createHmac("sha256", getSecret());
  h.update(data);
  return h.digest("base64url");
}

function timingSafeEqual(a, b) {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function createVendorSessionToken({ brandKey }) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + COOKIE_MAX_AGE_SECONDS;
  const payload = JSON.stringify({ v: 1, exp, brandKey: brandKey || "bmr" });
  const payloadB64 = base64urlEncode(payload);
  const sig = sign(payloadB64);
  return `${payloadB64}.${sig}`;
}

export function verifyVendorSessionToken(token) {
  if (!token || typeof token !== "string") return { ok: false };
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false };
  const [payloadB64, sig] = parts;
  const expected = sign(payloadB64);
  if (!timingSafeEqual(sig, expected)) return { ok: false };
  try {
    const payload = JSON.parse(base64urlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    if (!payload?.exp || now >= payload.exp) return { ok: false };
    return { ok: true, payload };
  } catch {
    return { ok: false };
  }
}

export function getVendorSessionCookieName() {
  return COOKIE_NAME;
}

export function getVendorSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
}
