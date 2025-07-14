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

export const metadata = {
  title:
    "Shop Details | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default async function Page({ params }) {
  const { id } = params;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/product/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    // Handle product not found or server error
    return <p>Product not found.</p>;
  }

  const product = await res.json();

  return (
    <>
      <Header2 />
      <div className="tf-breadcrumb">
        <div className="container">
          <div className="tf-breadcrumb-wrap d-flex justify-content-between flex-wrap align-items-center">
            <div className="tf-breadcrumb-list">
              <Link href={`/`} className="text">
                Home
              </Link>
              <i className="icon icon-arrow-right" />
              <Link
                href={`/products/${product.StartAppYear}-${
                  product.EndAppYear
                }-${
                  product.PlatformName
                    ? product.PlatformName.replace(/\s+/g, "-")
                    : ""
                }`}
                className="text"
              >
                {product.StartAppYear && product.EndAppYear
                  ? `${product.StartAppYear}-${product.EndAppYear} ${product.PlatformName}`
                  : product.PlatformName
                  ? product.PlatformName
                  : "Platform Name"}
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
      <Products product={product} />
      <RecentProducts />
      <Footer1 />
    </>
  );
}
