import { getSiteUrl } from "../url/getSiteUrl.js";

/**
 * Returns an absolute OG image URL:
 * - If NEXT_PUBLIC_OG_IMAGE_URL is set, use it
 * - Else use `${SITE_URL}${brand.defaultOgImagePath}`
 */
function resolveOgImageUrl(brand, siteUrl) {
  const envKey = brand?.envOgImageUrlKey || "NEXT_PUBLIC_OG_IMAGE_URL";
  const envVal = process.env[envKey];

  if (typeof envVal === "string" && envVal) return envVal;

  const path = brand?.defaultOgImagePath || "/og-image.png";
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Build openGraph and twitter metadata for a page.
 *
 * @param {Object} opts
 * @param {Object} opts.brand - brand config (brands.bmr / brands.controlfreak)
 * @param {string} opts.path
 * @param {string} opts.title
 * @param {string} opts.description
 * @param {string} [opts.image] - absolute URL override
 */
export function pageMeta({ brand, path, title, description, image }) {
  const SITE_URL = (brand?.siteUrl || getSiteUrl()).replace(/\/$/, "");

  const normalizedPath = path?.startsWith("/") ? path : `/${path || ""}`;
  const url = `${SITE_URL}${normalizedPath}`;

  const ogUrl = image || resolveOgImageUrl(brand, SITE_URL);

  const img = {
    url: ogUrl,
    width: 1200,
    height: 630,
    alt: title || brand?.name || brand?.companyName || "Website",
  };

  const openGraph = {
    type: "website",
    locale: "en_US",
    url,
    siteName: brand?.name || brand?.companyName || "Website",
    title,
    description,
    images: [img],
  };

  const twitter = {
    card: "summary_large_image",
    title: (title || "").slice(0, 70),
    description: description ? description.slice(0, 200) : undefined,
    images: [img.url],
  };

  return { openGraph, twitter, _resolved: { SITE_URL, OG_IMAGE_URL: ogUrl } };
}

/**
 * Optional helper if you still need the default OG object (same shape as before)
 */
export function defaultOgImage(brand) {
  const SITE_URL = (brand?.siteUrl || getSiteUrl()).replace(/\/$/, "");
  const OG_IMAGE_URL = resolveOgImageUrl(brand, SITE_URL);

  return {
    url: OG_IMAGE_URL,
    width: 1200,
    height: 630,
    alt: brand?.name || brand?.companyName || "Website",
  };
}
