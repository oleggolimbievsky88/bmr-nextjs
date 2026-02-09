// Central helpers for building asset URLs (images, instructions, etc.)
// Uses env-based bases so we can move files without changing code.
//
// For product images:
//   NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL (e.g. https://legacy.bmrsuspension.com/siteart/products)
//   falls back to /siteart/products
//
// For install PDFs:
//   NEXT_PUBLIC_INSTALL_BASE_URL (e.g. https://legacy.bmrsuspension.com/siteart/install)
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

  // Otherwise, treat it as a filename or relative path under the image base
  return `${PRODUCT_IMAGE_BASE}/${imagePath}`;
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

