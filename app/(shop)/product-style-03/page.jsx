import Footer1 from "@/components/footers/Footer";
import Header2 from "@/components/headers/Header";
import Topbar1 from "@/components/headers/Topbar1";

import ProductStyle3 from "@/components/shop/ProductStyle3";
import React from "react";

export const metadata = {
  title: "Product Style 3 | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Topbar1 />
      <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">New Arrival</div>
          <p className="text-center text-2 text_black-2 mt_5">
            Shop through our latest selection of Fashion
          </p>
        </div>
      </div>
      <ProductStyle3 />
      <Footer1 />
    </>
  );
}
