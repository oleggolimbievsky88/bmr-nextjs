// Central helpers for building asset URLs (images, instructions, etc.)
// Uses env-based bases so we can move files without changing code.
//
// IMPORTANT: When using these URLs as link href (not img src), use a plain <a>
// tag, NOT next/link <Link>. Next.js client-side routing intercepts same-origin
// links; /siteart/* are static assets (Cloudflare R2) and must trigger a full
// request. Example: <a href={getInstallUrl(...)} target="_blank" rel="noopener noreferrer">
//
// For product images:
//   NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL (e.g. http://legacy.bmrsuspension.com/siteart/products)
//   falls back to /siteart/products
//
// For install PDFs:
//   NEXT_PUBLIC_INSTALL_BASE_URL (e.g. http://legacy.bmrsuspension.com/siteart/install)
//   falls back to /siteart/install

const PRODUCT_IMAGE_BASE =
  process.env.NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL || "/siteart/products";

const INSTALL_BASE =
  process.env.NEXT_PUBLIC_INSTALL_BASE_URL || "/siteart/install";

export function getProductImageUrl(imagePath) {
  if (!imagePath || imagePath === "0") return "";

  // If it's already a full URL, return as is
  if (typeof imagePath === "string" && imagePath.startsWith("http")) {
    return imagePath;
  }

  // If it starts with /, assume it's already a full path on this domain
  if (typeof imagePath === "string" && imagePath.startsWith("/")) {
    return imagePath;
  }

  // Admin-uploaded images: "p_timestamp_random.jpg" (short name for varchar(45))
  if (
    typeof imagePath === "string" &&
    /^p_\d+_[a-z0-9]+\.(jpg|jpeg|png|gif|webp)$/i.test(imagePath)
  ) {
    return `/images/products/${imagePath}`;
  }

  // Admin-uploaded with path prefix
  if (typeof imagePath === "string" && imagePath.startsWith("images/")) {
    return `/${imagePath}`;
  }

  // Otherwise, treat as legacy filename under the image base
  return `${PRODUCT_IMAGE_BASE}/${imagePath}`;
}

// Platform images: served via Cloudflare R2
// bmrsuspension.com/siteart/* redirects to R2
// Always use production URL for these - they don't exist on localhost
const PRODUCTION_SITE = "https://www.bmrsuspension.com";

function getPlatformImageBase() {
  const base = process.env.NEXT_PUBLIC_PLATFORM_IMAGE_BASE_URL;
  if (base && base.trim()) return base.replace(/\/$/, "");
  const site =
    (typeof process.env.NEXT_PUBLIC_SITE_URL === "string" &&
      process.env.NEXT_PUBLIC_SITE_URL?.trim()) ||
    PRODUCTION_SITE;
  // On localhost, site assets only exist on production - always use bmrsuspension.com
  const isLocalhost =
    typeof site === "string" &&
    (site.includes("localhost") || site.startsWith("http://127.0.0.1"));
  const effectiveSite = isLocalhost ? PRODUCTION_SITE : site;
  return `${effectiveSite.replace(/\/$/, "")}/siteart/cars`;
}
const PLATFORM_IMAGE_BASE = getPlatformImageBase();
function getPlatformBannerBase() {
  const base = process.env.NEXT_PUBLIC_PLATFORM_BANNER_BASE_URL;
  if (base && base.trim()) return base.replace(/\/$/, "");
  const site =
    (typeof process.env.NEXT_PUBLIC_SITE_URL === "string" &&
      process.env.NEXT_PUBLIC_SITE_URL?.trim()) ||
    PRODUCTION_SITE;
  const isLocalhost =
    typeof site === "string" &&
    (site.includes("localhost") || site.startsWith("http://127.0.0.1"));
  const effectiveSite = isLocalhost ? PRODUCTION_SITE : site;
  return `${effectiveSite.replace(/\/$/, "")}/siteart/platformHeaders`;
}
const PLATFORM_BANNER_BASE = getPlatformBannerBase();

export function getPlatformImageUrl(imagePath) {
  if (!imagePath || imagePath === "0") return "";
  if (typeof imagePath === "string" && imagePath.startsWith("http")) {
    return imagePath;
  }
  if (typeof imagePath === "string" && imagePath.startsWith("/")) {
    return imagePath;
  }
  return `${PLATFORM_IMAGE_BASE}/${imagePath}`;
}

export function getPlatformBannerUrl(imagePath) {
  if (!imagePath || imagePath === "0") return "";
  if (typeof imagePath === "string" && imagePath.startsWith("http")) {
    return imagePath;
  }
  if (typeof imagePath === "string" && imagePath.startsWith("/")) {
    return imagePath;
  }
  return `${PLATFORM_BANNER_BASE}/${imagePath}`;
}

// Category images: legacy (bmrsuspension.com) or local uploads
const CATEGORY_IMAGE_BASE =
  process.env.NEXT_PUBLIC_CATEGORY_IMAGE_BASE_URL ||
  "https://bmrsuspension.com/siteart/categories";

export function getCategoryImageUrl(imagePath) {
  if (!imagePath || imagePath === "0") return "";

  if (typeof imagePath === "string" && imagePath.startsWith("http")) {
    return imagePath;
  }
  if (typeof imagePath === "string" && imagePath.startsWith("/")) {
    return imagePath;
  }
  if (typeof imagePath === "string" && imagePath.startsWith("images/")) {
    return `/${imagePath}`;
  }
  return `${CATEGORY_IMAGE_BASE}/${imagePath}`;
}

export function getInstallUrl(fileName) {
  if (!fileName || fileName === "0") return "";

  // Already a full URL
  if (typeof fileName === "string" && fileName.startsWith("http")) {
    return fileName;
  }

  // "inst_" instruction files are handled elsewhere (e.g. /instructions/inst_*)
  if (typeof fileName === "string" && fileName.startsWith("inst_")) {
    return `/instructions/${fileName}`;
  }

  // Default: under the install base
  return `${INSTALL_BASE}/${fileName}`;
}
