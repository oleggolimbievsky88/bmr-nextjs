import { getSiteUrl } from "@bmr/core/url";

const SITE_URL = getSiteUrl();

/**
 * Generated robots.txt for search engine crawlers.
 * Allow crawling of public pages; disallow admin, API, and auth-only routes.
 */
export default function robots() {
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
    host: SITE_URL.replace(/^https?:\/\//, ""),
  };
}
