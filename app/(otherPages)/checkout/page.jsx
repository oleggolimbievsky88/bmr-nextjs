import Footer1 from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import Checkout from "@/components/othersPages/Checkout";
import React, { Suspense } from "react";

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
      <Header showVehicleSearch={false} />
      <PageHeader title="CHECKOUT" />
      <Suspense
        fallback={<div className="text-center py-5">Loading checkout...</div>}
      >
        <Checkout />
      </Suspense>
      <Footer1 />
    </>
  );
}
