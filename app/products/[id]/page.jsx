// app/products/[id]/page.js

import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import DefaultShopDetails from "@/components/shopDetails/DefaultShopDetails";
import Products from "@/components/shopDetails/Products";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import DetailsOuterZoom from "@/components/shopDetails/DetailsOuterZoom";
import Link from "next/link";

export const metadata = {
  title: "Shop Details || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};

export default async function ProductPage({ params }) {
  const { id } = params;

  // Fetch product data from API
  const res = await fetch(`http://localhost:3000/api/products/${id}`);

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
              <a href="#" className="text">
                2024 Mustang
              </a>
              <i className="icon icon-arrow-right" />
              <span className="text">
                {product.title ? product.title : "Product Title"}
              </span>
            </div>
            <div className="tf-breadcrumb-prev-next">
              <a href="#" className="tf-breadcrumb-prev hover-tooltip center">
                <i className="icon icon-arrow-left" />
              </a>
              <a href="#" className="tf-breadcrumb-back hover-tooltip center">
                <i className="icon icon-shop" />
              </a>
              <a href="#" className="tf-breadcrumb-next hover-tooltip center">
                <i className="icon icon-arrow-right" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <DetailsOuterZoom product={product} />
      <ShopDetailsTab />
      <Products />
      <RecentProducts />
      <Footer1 />
    </>
  );
}
