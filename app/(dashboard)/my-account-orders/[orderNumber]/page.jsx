"use client";

import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import DashboardNav from "@/components/othersPages/dashboard/DashboardNav";
import OrderDetail from "@/components/othersPages/dashboard/OrderDetail";
import React from "react";

export default function OrderDetailPage({ params }) {
  const { orderNumber } = React.use(params);
  return (
    <>
      <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Order Details</div>
        </div>
      </div>
      <section className="flat-spacing-11">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <DashboardNav />
            </div>
            <div className="col-lg-9">
              <OrderDetail orderNumber={orderNumber} />
            </div>
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
