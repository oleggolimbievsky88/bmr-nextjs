// Central helpers for building asset URLs (images, instructions, etc.)
// Uses env-based bases so we can move files without changing code.
//
// IMPORTANT: When using these URLs as link href (not img src), use a plain <a>
// tag, NOT next/link <Link>. Next.js client-side routing intercepts same-origin
// links; /siteart/* are static assets (Cloudflare R2) and must trigger a full
// request. Example: <a href={getInstallUrl(...)} target="_blank" rel="noopener noreferrer">
//
// For product images:
//   NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL (e.g. https://bmrsuspension.com/siteart/products)
//   falls back to /siteart/products
//   NEXT_PUBLIC_ADMIN_PRODUCT_IMAGE_BASE_URL (optional): base URL for admin-uploaded images
//   (p_*.jpg, images/*). Set in production when images live elsewhere (e.g. Blob CDN).
//
// For install PDFs:
//   NEXT_PUBLIC_INSTALL_BASE_URL (e.g. https://bmrsuspension.com/siteart/install)
//   falls back to /siteart/install

const PRODUCT_IMAGE_BASE =
  process.env.NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL || "/siteart/products";

const ADMIN_PRODUCT_IMAGE_BASE =
  typeof process.env.NEXT_PUBLIC_ADMIN_PRODUCT_IMAGE_BASE_URL === "string" &&
  process.env.NEXT_PUBLIC_ADMIN_PRODUCT_IMAGE_BASE_URL.trim()
    ? process.env.NEXT_PUBLIC_ADMIN_PRODUCT_IMAGE_BASE_URL.replace(/\/$/, "")
    : "";

const INSTALL_BASE =
  process.env.NEXT_PUBLIC_INSTALL_BASE_URL || "/siteart/install";

export function getProductImageUrl(imagePath) {
  if (!imagePath || imagePath === "0") return "";

  if (typeof imagePath === "string" && imagePath.startsWith("http")) {
    return withoutWww(imagePath);
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
    const path = `/images/products/${imagePath}`;
    return ADMIN_PRODUCT_IMAGE_BASE
      ? `${ADMIN_PRODUCT_IMAGE_BASE}${path}`
      : path;
  }

  // Admin-uploaded with path prefix
  if (typeof imagePath === "string" && imagePath.startsWith("images/")) {
    const path = `/${imagePath}`;
    return ADMIN_PRODUCT_IMAGE_BASE
      ? `${ADMIN_PRODUCT_IMAGE_BASE}${path}`
      : path;
  }

  // Otherwise, treat as legacy filename under the image base
  return `${PRODUCT_IMAGE_BASE}/${imagePath}`;
}

// Platform images: served via Cloudflare R2
// Use domain without www so Vercel doesn't treat asset paths as page routes.
// Base URL for asset origins (e.g. https://bmrsuspension.com) from NEXT_PUBLIC_ASSETS_BASE_URL.
const ASSETS_BASE_URL =
  (typeof process.env.NEXT_PUBLIC_ASSETS_BASE_URL === "string" &&
    process.env.NEXT_PUBLIC_ASSETS_BASE_URL?.trim()) ||
  "";

/** Strip www from host so asset URLs are never treated as page routes (e.g. on Vercel). */
function withoutWww(url) {
  if (typeof url !== "string" || !url.startsWith("http")) return url;
  try {
    const u = new URL(url);
    if (u.hostname.toLowerCase().startsWith("www.")) {
      u.hostname = u.hostname.slice(4);
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}

// Brand key used for path defaults (BMR → siteart/*, Control Freak → /cars, /platformHeaders).
const BRAND_KEY_PLATFORM = (
  process.env.NEXT_PUBLIC_BRAND ||
  process.env.BRAND ||
  "bmr"
).toLowerCase();

/** Path for vehicle thumbnails: env override, or "cars" for Control Freak, "siteart/cars" for BMR. */
function getPlatformImagePath() {
  if (
    typeof process.env.NEXT_PUBLIC_PLATFORM_IMAGE_PATH === "string" &&
    process.env.NEXT_PUBLIC_PLATFORM_IMAGE_PATH.trim()
  ) {
    return process.env.NEXT_PUBLIC_PLATFORM_IMAGE_PATH.trim().replace(
      /^\//,
      "",
    );
  }
  return BRAND_KEY_PLATFORM === "controlfreak" ? "cars" : "siteart/cars";
}

/** Path for platform banners: env override, or "platformHeaders" for Control Freak, "siteart/platformHeaders" for BMR. */
function getPlatformBannerPath() {
  if (
    typeof process.env.NEXT_PUBLIC_PLATFORM_BANNER_PATH === "string" &&
    process.env.NEXT_PUBLIC_PLATFORM_BANNER_PATH.trim()
  ) {
    return process.env.NEXT_PUBLIC_PLATFORM_BANNER_PATH.trim().replace(
      /^\//,
      "",
    );
  }
  return BRAND_KEY_PLATFORM === "controlfreak"
    ? "platformHeaders"
    : "siteart/platformHeaders";
}

function getPlatformImageBase() {
  const base = process.env.NEXT_PUBLIC_PLATFORM_IMAGE_BASE_URL;
  if (base && base.trim()) return withoutWww(base.replace(/\/$/, ""));
  const assetsBase =
    typeof process.env.NEXT_PUBLIC_ASSETS_BASE_URL === "string" &&
    process.env.NEXT_PUBLIC_ASSETS_BASE_URL?.trim();
  const site =
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string" &&
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const origin = withoutWww((assetsBase || site || "").replace(/\/$/, ""));
  const path = getPlatformImagePath();
  return origin ? `${origin}/${path}` : `/${path}`;
}
const PLATFORM_IMAGE_BASE = getPlatformImageBase();
function getPlatformBannerBase() {
  const base = process.env.NEXT_PUBLIC_PLATFORM_BANNER_BASE_URL;
  if (base && base.trim()) return withoutWww(base.replace(/\/$/, ""));
  const assetsBase =
    typeof process.env.NEXT_PUBLIC_ASSETS_BASE_URL === "string" &&
    process.env.NEXT_PUBLIC_ASSETS_BASE_URL?.trim();
  const site =
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string" &&
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const origin = withoutWww((assetsBase || site || "").replace(/\/$/, ""));
  const path = getPlatformBannerPath();
  return origin ? `${origin}/${path}` : `/${path}`;
}
const PLATFORM_BANNER_BASE = getPlatformBannerBase();

export function getPlatformImageUrl(imagePath) {
  if (!imagePath || imagePath === "0") return "";
  if (typeof imagePath === "string" && imagePath.startsWith("http")) {
    return withoutWww(imagePath);
  }
  if (typeof imagePath === "string" && imagePath.startsWith("/")) {
    return imagePath;
  }
  return `${PLATFORM_IMAGE_BASE}/${encodeURI(imagePath)}`;
}

export function getPlatformBannerUrl(imagePath) {
  if (!imagePath || imagePath === "0") return "";
  if (typeof imagePath === "string" && imagePath.startsWith("http")) {
    return withoutWww(imagePath);
  }
  if (typeof imagePath === "string" && imagePath.startsWith("/")) {
    return imagePath;
  }
  return `${PLATFORM_BANNER_BASE}/${encodeURI(imagePath)}`;
}

// Category images: base depends on brand (BMR → /siteart/categories, Control Freak → /images/categories)
const CATEGORY_IMAGE_BASE =
  process.env.NEXT_PUBLIC_CATEGORY_IMAGE_BASE_URL ||
  (ASSETS_BASE_URL
    ? `${ASSETS_BASE_URL.replace(/\/$/, "")}/siteart/categories`
    : "/siteart/categories");

const BRAND_KEY = (
  process.env.NEXT_PUBLIC_BRAND ||
  process.env.BRAND ||
  "bmr"
).toLowerCase();

/** Base path for category images: BMR uses siteart, Control Freak uses /images/categories */
function getCategoryImageBasePath() {
  return BRAND_KEY === "controlfreak" ? "/images/categories" : null;
}

export function getCategoryImageUrl(imagePath) {
  if (!imagePath || imagePath === "0") return "";

  if (typeof imagePath === "string" && imagePath.startsWith("http")) {
    return withoutWww(imagePath);
  }
  if (typeof imagePath === "string" && imagePath.startsWith("/")) {
    return imagePath;
  }
  const categoryBasePath = getCategoryImageBasePath();
  // "images/categories/xxx" — for BMR serve from /siteart/categories; for Control Freak keep /images/categories
  if (
    typeof imagePath === "string" &&
    imagePath.startsWith("images/categories/")
  ) {
    const filename = imagePath.slice("images/categories/".length);
    if (categoryBasePath) {
      return `${categoryBasePath}/${encodeURIComponent(filename)}`;
    }
    return `${CATEGORY_IMAGE_BASE}/${encodeURIComponent(filename)}`;
  }
  if (typeof imagePath === "string" && imagePath.startsWith("images/")) {
    return `/${imagePath}`;
  }
  // Plain filename: BMR → /siteart/categories, Control Freak → /images/categories
  if (typeof imagePath === "string" && !imagePath.includes("/")) {
    if (categoryBasePath) {
      return `${categoryBasePath}/${encodeURIComponent(imagePath)}`;
    }
    return `${CATEGORY_IMAGE_BASE}/${encodeURIComponent(imagePath)}`;
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
