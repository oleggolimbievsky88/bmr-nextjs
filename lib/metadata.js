import { SITE_URL } from "./site-url";

/**
 * Default OG/Twitter image. Use 1200x630 for best results; logo is fallback.
 * Set OG_IMAGE_URL env or add public/og-image.png (1200x630) and use /og-image.png.
 */
const OG_IMAGE_URL =
  process.env.NEXT_PUBLIC_OG_IMAGE_URL || `${SITE_URL}/images/bmr-logo.png`;

const DEFAULT_OG_IMAGE = {
  url: OG_IMAGE_URL,
  width: 1200,
  height: 630,
  alt: "BMR Suspension - Performance Suspension & Chassis Parts",
};

/**
 * Build openGraph and twitter metadata for a page.
 * Use in page metadata so OG/Twitter tags are always present (required by validators).
 *
 * @param {Object} opts
 * @param {string} opts.path - Path (e.g. '/' or '/login')
 * @param {string} opts.title - Page title (≤70 chars for Twitter)
 * @param {string} opts.description - Page description (≤200 chars for Twitter)
 * @param {string} [opts.image] - Override image URL
 */
export function pageMeta({ path, title, description, image }) {
  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const img = image
    ? { url: image, width: 1200, height: 630, alt: title }
    : DEFAULT_OG_IMAGE;

  const openGraph = {
    type: "website",
    locale: "en_US",
    url,
    siteName: "BMR Suspension",
    title,
    description,
    images: [img],
  };

  const twitter = {
    card: "summary_large_image",
    title: title.slice(0, 70),
    description: description ? description.slice(0, 200) : undefined,
    images: [img.url],
  };

  return { openGraph, twitter };
}

export { DEFAULT_OG_IMAGE, OG_IMAGE_URL };
