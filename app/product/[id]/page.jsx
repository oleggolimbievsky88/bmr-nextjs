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
import { getProductById, getRelatedProducts } from "@/lib/queries";
import pool from "@/lib/db";

export const metadata = {
  title:
    "Shop Details | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default async function ProductDetails({ params, searchParams }) {
  // Await params and searchParams
  const { id } = await params;
  const awaitedSearchParams = await searchParams;
  const color = awaitedSearchParams?.color
    ? String(awaitedSearchParams.color)
    : null;

  console.log("ProductDetailid", id);
  console.log("Color query param:", color);

  // Fetch product details
  const product = await getProductById(id);

  // Fetch related products
  const relatedProducts = await getRelatedProducts(id);

  return (
    <div>
      <Details6
        product={product}
        initialColor={color}
        searchParams={awaitedSearchParams || {}}
      />
      <ShopDetailsTab product={product} />
      {relatedProducts && relatedProducts.length > 0 && (
        <Products products={relatedProducts} />
      )}
    </div>
  );
}
