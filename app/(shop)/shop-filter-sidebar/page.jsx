import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import FilterSidebar from "@/components/shop/FilterSidebar";

import React from "react";

export const metadata = {
  title: "Shop Filter Sidebar | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">New Arrival</div>
          <p className="text-center text-2 text_black-2 mt_5">
            Shop through our latest selection of Fashion
          </p>
        </div>
      </div>
      <FilterSidebar />
      <Footer1 />
    </>
  );
}
