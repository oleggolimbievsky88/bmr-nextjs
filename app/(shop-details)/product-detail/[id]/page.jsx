// app/(shop-details)/product-detail/[id]/page.jsx

import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import DefaultShopDetails from "@/components/shopDetails/DefaultShopDetails";
import Products from "@/components/shopDetails/Products";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import DetailsOuterZoom from "@/components/shopDetails/DetailsOuterZoom";
import Link from "next/link";
import Details6 from "@/components/shopDetails/Details6";
import { getProductById } from "@/lib/queries";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title:
    "Shop Details | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default async function ProductPage({ params }) {
  const { id } = params || {};

  if (!id) {
    return notFound();
  }

  let product;
  try {
    // Fetch product data directly from database (more efficient than API call)
    product = await getProductById(id);
  } catch (error) {
    console.error("Error loading product detail", { id, error });
    // Surface a generic error to the user but keep details in logs
    return (
      <p style={{ padding: "2rem", textAlign: "center" }}>
        Sorry, something went wrong loading this product.
      </p>
    );
  }

  if (!product) {
    // Let Next.js render a 404 page for missing products
    return notFound();
  }

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
              <Link href={`/products/2024-mustang`} className="text">
                2024 Mustang
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

      {/* <DetailsOuterZoom product={product} />  */}
      <ShopDetailsTab product={product} />
      <Products />
      <RecentProducts />
      <Footer1 />
    </>
  );
}
