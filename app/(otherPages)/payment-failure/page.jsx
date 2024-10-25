import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import PaymentFailure from "@/components/othersPages/PaymentFailure";
import React from "react";

export const metadata = {
  title: "Payment Failure | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Payment Failure</div>
        </div>
      </div>

      <PaymentFailure />
      <Footer1 />
    </>
  );
}
