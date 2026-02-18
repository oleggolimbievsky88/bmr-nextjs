/**
 * Static product list is no longer used for related products (those come from the DB).
 * Exports below are empty/placeholder for any remaining theme/demo components that
 * still import from here; those components should be updated to fetch from the API.
 */
export const products1 = [];

function toPriceNumber(value) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function toDemoProduct(p, fallbackId) {
  return {
    id: p?.ProductID ?? fallbackId,
    title: p?.ProductName || p?.PartNumber || `Product ${fallbackId}`,
    price: toPriceNumber(p?.Price),
    // Use a stable local asset so builds/prerender never depend on remote URLs.
    imgSrc: "/images/logo/bmr_logo_square_small.webp",
  };
}

export const allProducts = products1.map((p, idx) => toDemoProduct(p, idx + 1));

export const featuredProducts = allProducts.slice(0, 4);

// Theme sections expect at least one item.
export const productBestcell =
  allProducts.length > 0 ? allProducts.slice(0, 1) : [toDemoProduct(null, 1)];

export const bundleproducts =
  allProducts.length > 0 ? allProducts.slice(0, 3) : [toDemoProduct(null, 1)];
