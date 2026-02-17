import productsJson from "./products.json";

/**
 * This project uses a mix of:
 * - Real DB-shaped product objects (from `data/products.json`)
 * - Theme/demo components that expect a simplified `{ id, title, price, imgSrc }` shape.
 *
 * `products1` is the DB-shaped list.
 * The other exports are lightweight adapters used by demo/theme components.
 */

export const products1 = Array.isArray(productsJson) ? productsJson : [];

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
