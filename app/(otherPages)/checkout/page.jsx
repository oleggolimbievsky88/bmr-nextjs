import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Checkout from "@/components/othersPages/Checkout";
import React from "react";

export const metadata = {
  title:
    "Checkout | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Header2 />

      <Checkout />
      <Footer1 />
    </>
  );
}
