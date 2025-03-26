// app/products/[id]/page.js

import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import Details6 from "@/components/shopDetails/Details6";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/queries";

export async function generateMetadata({ params }) {
  const product = await getProductById(params.id);

  if (!product) {
    return {
      title: "Product Not Found | BMR Suspension",
      description: "The requested product could not be found.",
    };
  }

  return {
    title: `${product.ProductName} | BMR Suspension`,
    description:
      product.Description?.substring(0, 160) ||
      "BMR Suspension - Performance Racing Suspension & Chassis Parts",
    openGraph: {
      title: product.ProductName,
      description: product.Description?.substring(0, 160),
      images: [
        {
          url: `/images/products/${product.ImageLarge || product.ImageSmall}`,
          width: 800,
          height: 600,
          alt: product.ProductName,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  // Get the platform/body name for breadcrumb
  const platformName = product.PlatformName || "Products";

  return (
    <>
      <Header2 />
      <div className="tf-breadcrumb">
        <div className="container">
          <div className="tf-breadcrumb-wrap d-flex justify-content-between flex-wrap align-items-center">
            <div className="tf-breadcrumb-list">
              <Link href="/" className="text">
                Home
              </Link>
              <i className="icon icon-arrow-right" />
              <Link href="/products" className="text">
                Products
              </Link>
              <i className="icon icon-arrow-right" />
              {product.BodyID && (
                <>
                  <Link
                    href={`/products/${platformName
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="text"
                  >
                    {platformName}
                  </Link>
                  <i className="icon icon-arrow-right" />
                </>
              )}
              <span className="text">{product.ProductName}</span>
            </div>
          </div>
        </div>
      </div>

      <Details6 product={product} />

      <div className="container mb-90">
        <ShopDetailsTab product={product} />
      </div>

      <Footer1 />
    </>
  );
}
