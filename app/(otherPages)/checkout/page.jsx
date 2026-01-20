import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
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
      <Topbar4 />
      <Header18 showVehicleSearch={false} />
      <PageHeader title="CHECKOUT" />
      <Checkout />
      <Footer1 />
    </>
  );
}
