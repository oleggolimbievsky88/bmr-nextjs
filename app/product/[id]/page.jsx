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

export default async function ProductPage({ params }) {
  const { id } = params;

  const API_URL = process.env.API_URL || "http://localhost:3000";

  // Fetch product data from API
  const res = await fetch(`${API_URL}/api/product/${id}`);

  console.log("Res:", res);
  if (!res.ok) {
    // Handle product not found or server error
    return <p>Product not found.</p>;
  }

  const product = await res.json();

  console.log("Product:", product);

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
              <a href="#" className="text">
                2024 Mustang
              </a>
              <i className="icon icon-arrow-right" />
              <span className="text">
                {product.ProductName ? product.ProductName : "Product Title"}
              </span>
            </div>
            {/* <div className="tf-breadcrumb-prev-next">
              <a href="#" className="tf-breadcrumb-prev hover-tooltip center">
                <i className="icon icon-arrow-left" />
              </a>
              <a href="#" className="tf-breadcrumb-back hover-tooltip center">
                <i className="icon icon-shop" />
              </a>
              <a href="#" className="tf-breadcrumb-next hover-tooltip center">
                <i className="icon icon-arrow-right" />
              </a>
            </div> */}
          </div>
        </div>
      </div>
      {/* <DetailsOuterZoom product={product} /> */}
      <Details6 product={product} />
      <ShopDetailsTab />
      <Products />
      <RecentProducts />
      <Footer1 />
    </>
  );
}
