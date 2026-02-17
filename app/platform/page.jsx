import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import ShopDefault from "@/components/shop/ShopDefault";
import Subcollections from "@/components/shop/Subcollections";
import React from "react";

export const metadata = {
  title:
    "Product Collection Sub | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">2024 Mustang</div>
          <p className="text-center text-2 text_black-2 mt_5">
            Shop through our latest selection of Suspension & Chassis Parts
          </p>
        </div>
      </div>
      <Subcollections />
      <ShopDefault />
      <Footer1 />
    </>
  );
}
