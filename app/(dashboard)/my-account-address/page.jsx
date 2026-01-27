import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import AccountAddress from "@/components/othersPages/dashboard/AccountAddress";
import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import React from "react";

export const metadata = {
  title:
    "My Account Address | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">My Account Address</div>
        </div>
      </div>
      <section className="flat-spacing-11">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <DashboardNav />
            </div>
            <div className="col-lg-9">
              <AccountAddress />
            </div>
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
