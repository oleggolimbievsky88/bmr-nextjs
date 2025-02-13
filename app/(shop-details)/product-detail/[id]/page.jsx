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

const API_URL = process.env.API_URL || "http://localhost:3000";

export default async function ProductPage({ params }) {
  const { id } = params;

  // Fetch product data from API
  const res = await fetch(`${API_URL}/api/products/${id}`);

  if (!res.ok) {
    // Handle product not found or server error
    return <p>Product not found.</p>;
  }

  const product = await res.json();
  console.log("product=%o", product);
  const { bodyid } = product;

  // Fetch vehicle data using bodyid
  const vehicleRes = await fetch(`${API_URL}/api/platforms/${bodyid}`);

  console.log(vehicleRes);

  if (!vehicleRes.ok) {
    // Handle vehicle not found or server error
    return <p>Vehicle information not found.</p>;
  }

  const vehicle = await vehicleRes.json();

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
                href={`/platforms/${vehicle.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                className="text"
              >
                {vehicle.name}
              </Link>
              <i className="icon icon-arrow-right" />
              <span className="text">
                {product?.ProductName ? product?.ProductName : "Product Title"}
              </span>
            </div>
            <div className="tf-breadcrumb-prev-next">
              <Link
                href={`/`}
                className="tf-breadcrumb-prev hover-tooltip center"
              >
                <i className="icon icon-arrow-left" />
              </Link>
              <Link
                href={`/`}
                className="tf-breadcrumb-back hover-tooltip center"
              >
                <i className="icon icon-shop" />
              </Link>
              <Link
                href={`/`}
                className="tf-breadcrumb-next hover-tooltip center"
              >
                <i className="icon icon-arrow-right" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* <Details6 product={product} /> */}

      <DetailsOuterZoom product={product} />
      <ShopDetailsTab product={product} />
      <Products />
      <RecentProducts />
      <Footer1 />
    </>
  );
}
