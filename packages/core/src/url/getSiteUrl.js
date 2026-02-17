/**
 * Canonical site URL for metadata, sitemap, robots, and Open Graph.
 * Resolved in order: NEXT_PUBLIC_SITE_URL → VERCEL_URL → NEXTAUTH_URL → localhost.
 * Always returns a full URL (with protocol) so it is safe to pass to new URL().
 */
function ensureProtocol(url) {
  if (!url || typeof url !== "string") return url;
  const trimmed = url.replace(/\/$/, "");
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function getSiteUrl() {
  if (
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string" &&
    process.env.NEXT_PUBLIC_SITE_URL
  ) {
    return ensureProtocol(process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ""));
  }
  const v = process.env.VERCEL_URL;
  if (typeof v === "string" && v) {
    return `https://${v}`;
  }
  const authUrl = process.env.NEXTAUTH_URL;
  if (typeof authUrl === "string" && authUrl) {
    return ensureProtocol(authUrl.replace(/\/$/, ""));
  }
  return "http://localhost:3000";
}
