/**
 * Canonical site URL for metadata, sitemap, robots, and Open Graph.
 * Resolved in order: NEXT_PUBLIC_SITE_URL → VERCEL_URL → NEXTAUTH_URL → localhost.
 */
export function getSiteUrl() {
  if (
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string" &&
    process.env.NEXT_PUBLIC_SITE_URL
  ) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  const v = process.env.VERCEL_URL;
  if (typeof v === "string" && v) {
    return `https://${v}`;
  }
  const authUrl = process.env.NEXTAUTH_URL;
  if (typeof authUrl === "string" && authUrl) {
    return authUrl.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}
