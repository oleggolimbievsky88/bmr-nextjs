import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Detaila20 from "@/components/shopDetails/Detaila20";
import Products from "@/components/shopDetails/Products";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Product Details | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "View detailed information about our performance suspension and chassis parts",
};

export default function ProductFrequentlyBoughtTogether2() {
  return (
    <>
      <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Product Details</div>
          <div className="tf-breadcrumb">
            <div className="container">
              <div className="tf-breadcrumb-item">
                <Link href="/">Home</Link>
                <span className="icon-arrow-right"></span>
                <Link href="/shop">Shop</Link>
                <span className="icon-arrow-right"></span>
                <Link href="/shop-filter-sidebar">Categories</Link>
                <span className="icon-arrow-right"></span>
                <Link href="/product-frequently-bought-together-2">Product Details</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Detaila20 />
      <ShopDetailsTab />
      <Products />
      <RecentProducts />
      <Footer1 />
    </>
  );
}
