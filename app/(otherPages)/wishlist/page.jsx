import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import VehicleSearch from "@/components/common/VehicleSearch";

import Wishlist from "@/components/othersPages/Wishlist";
import React from "react";

export const metadata = {
  title:
    "Wishlist | BMR Suspension - Performance Racing Suspension & Chassis Parts",
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
      <div className="tf-page-title ">
        <div className="container-full">
          <div className="heading text-center">Your wishlist</div>
        </div>
      </div>
      <div className="container vehicle-search-mobile">
        <VehicleSearch />
      </div>

      <Wishlist />

      <Footer1 />
    </>
  );
}
