import Footer2 from "@/components/footers/Footer2";
import Header2 from "@/components/headers/Header";
import Topbar2 from "@/components/headers/Topbar2";
import Products from "@/components/homes/home-search/Products";
import React from "react";

export const metadata = {
  title: "Home Search | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Topbar2 />
      <Header2 />
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Search</div>
        </div>
      </div>
      <Products />
      <Footer2 />
    </>
  );
}
