import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Brands from "@/components/othersPages/brands/Brands";
import React from "react";

export const metadata = {
  title: "Brands | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Header2 />
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Brands</div>
        </div>
      </div>

      <Brands />
      <Footer1 />
    </>
  );
}
