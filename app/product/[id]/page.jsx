// app/products/[id]/page.js

import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import DefaultShopDetails from "@/components/shopDetails/DefaultShopDetails";
import Products from "@/components/shopDetails/Products";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import DetailsOuterZoom from "@/components/shopDetails/DetailsOuterZoom";
import Link from "next/link";
import Details6 from "@/components/shopDetails/Details6";
import {
  getProductById,
  getProductsByBodyAndCat,
  getCategorySlugById,
} from "@/lib/queries";

export const metadata = {
  title:
    "Shop Details | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default async function ProductDetails({ params }) {
  const { id } = await params;

  const res = await fetch(`/api/products/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    // Handle product not found or server error
    return <p>Product not found.</p>;
  }

  const data = await res.json();
  const product = data.product;

  // Helper to slugify for URLs
  const slugify = (str) =>
    str
      ? str
          .toString()
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9\-]/g, "")
      : "";

  const platformSlug = `${product.StartAppYear}-${product.EndAppYear}-${slugify(
    product.PlatformName
  )}`;
  const mainCategorySlug = slugify(product.MainCategoryName);
  const categorySlug = slugify(product.CategoryName);

  console.log("Product:", product);
  return (
    <>
      <Header2 />
      <div className="tf-breadcrumb">
        <div className="container">
          <div className="tf-breadcrumb-wrap d-flex justify-content-center flex-wrap align-items-center text-center">
            <div className="tf-breadcrumb-list">
              <Link href="/" className="text">
                Home
              </Link>
              <i className="icon icon-arrow-right" />
              <Link href="/products" className="text">
                Products
              </Link>
              <i className="icon icon-arrow-right" />
              <Link href={`/products/${platformSlug}`} className="text">
                {product.StartAppYear && product.EndAppYear
                  ? `${product.StartAppYear}-${product.EndAppYear} ${product.PlatformName}`
                  : product.PlatformName || "Platform"}
              </Link>
              <i className="icon icon-arrow-right" />
              {product.MainCategoryName && (
                <>
                  <Link
                    href={`/products/${platformSlug}/${mainCategorySlug}`}
                    className="text"
                  >
                    {product.MainCategoryName}
                  </Link>
                  <i className="icon icon-arrow-right" />
                </>
              )}
              <Link
                href={`/products/${platformSlug}/${mainCategorySlug}/${categorySlug}`}
                className="text"
              >
                {product.CategoryName || "Product Type"}
              </Link>
              <i className="icon icon-arrow-right" />
              <span className="text">
                {product.ProductName ? product.ProductName : "Product Title"}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* <DetailsOuterZoom product={product} /> */}
      <Details6 product={product} />
      <ShopDetailsTab product={product} />
      {/* <Products product={product} /> */}
      {/* <RecentProducts /> */}
      <Footer1 />
    </>
  );
}
