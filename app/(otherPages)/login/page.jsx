import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import Topbar4 from "@/components/header/Topbar4";
import VehicleSearch from "@/components/common/VehicleSearch";
import Login from "@/components/othersPages/Login";
import React from "react";

export const metadata = {
  title: "Login | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Topbar4 />
      <Header18 />
      <div className="vehicle-search-desktop-wrapper">
        <div className="container vehicle-search-desktop">
          <VehicleSearch />
        </div>
      </div>
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Log in</div>
        </div>
      </div>
      <div className="container vehicle-search-mobile">
        <VehicleSearch />
      </div>
      <Login />
      <Footer1 />
    </>
  );
}
