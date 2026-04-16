import { getSiteUrl } from "@bmr/core/url";
import { headers } from "next/headers";

function resolveSiteUrl() {
  const configured = getSiteUrl();

  // If the app isn't explicitly configured, prefer the request Host header so
  // `robots.txt` + `sitemap.xml` match the actual domain (e.g. custom domains).
  try {
    const h = headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    const proto = h.get("x-forwarded-proto") || "https";
    if (host) return `${proto}://${host}`.replace(/\/$/, "");
  } catch {
    // headers() can throw in certain build-time contexts; fall back to config.
  }

  return configured;
}

/**
 * Generated robots.txt for search engine crawlers.
 * Allow crawling of public pages; disallow admin, API, and auth-only routes.
 */
export default function robots() {
  const SITE_URL = resolveSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/confirmation",
          "/checkout",
          "/login",
          "/register",
          "/reset-password",
          "/verify-email",
          "/view-cart",
          "/my-account",
          "/my-account-address",
          "/my-account-edit",
          "/my-account-orders",
          "/my-account-wishlist",
          "/test-cart",
          "/payment-failure",
          "/payment-confirmation",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
