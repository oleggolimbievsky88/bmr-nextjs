import Footer1 from "@/components/footers/Footer";
import Header2 from "@/components/headers/Header";
import ShopDefault from "@/components/shop/ShopDefault";
import React from "react";

export const metadata = {
  title: "Shop Women | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Shop Women</div>
          <p className="text-center text-2 text_black-2 mt_5">
            Shop through our latest selection of Fashion
          </p>
        </div>
      </div>
      <ShopDefault />
      <Footer1 />
    </>
  );
}
