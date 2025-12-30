// // import Testimonials from "@/components/common/Testimonials";
import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import VehicleSearch from "@/components/common/VehicleSearch";
import Cart from "@/components/othersPages/Cart";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import CartCount from "@/components/common/CartCount";
import React from "react";

export const dynamic = "force-dynamic";

export const metadata = {
  title:
    "View Cart | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default function page() {
  return (
    <>
      <Header2 />
      <div className="vehicle-search-desktop-wrapper">
        <div className="container vehicle-search-desktop">
          <VehicleSearch />
        </div>
      </div>
      <div className="tf-page-title" style={{ paddingBottom: "0px" }}>
        <div className="container-full">
          <div className="Impact-Heading text-center">
            Your Cart (<CartCount />)
          </div>
        </div>
      </div>
      <div className="container vehicle-search-mobile">
        <VehicleSearch />
      </div>

      <Cart />
      {/* <Testimonials /> */}
      <RecentProducts />
      <Footer1 />
    </>
  );
}
