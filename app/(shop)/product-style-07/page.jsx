import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import ProductStyle7 from "@/components/shop/ProductStyle7";
import React from "react";

export const metadata = {
  title:
    "Product Style 7 | BMR Suspension - Performance Racing Suspension & Chassis Parts",
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
      <ProductStyle7 />
      <Footer1 />
    </>
  );
}
