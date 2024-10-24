import Testimonials from "@/components/common/Testimonials";
import Footer1 from "@/components/footers/Footer";
import Header2 from "@/components/headers/Header";
import Cart from "@/components/othersPages/Cart";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import React from "react";

export const metadata = {
  title: "View Cart | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Shopping Cart</div>
        </div>
      </div>

      <Cart />
      <Testimonials />
      <RecentProducts />
      <Footer1 />
    </>
  );
}
