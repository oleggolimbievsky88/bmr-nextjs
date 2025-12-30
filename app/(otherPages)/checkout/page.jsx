import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import VehicleSearch from "@/components/common/VehicleSearch";
import Checkout from "@/components/othersPages/Checkout";
import React from "react";

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

export const metadata = {
  title:
    "Checkout | BMR Suspension - Performance Racing Suspension & Chassis Parts",
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

      <Checkout />
      <div className="container vehicle-search-mobile">
        <VehicleSearch />
      </div>
      <Footer1 />
    </>
  );
}
