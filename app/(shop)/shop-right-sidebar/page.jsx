import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Topbar1 from "@/components/header/Topbar1";
import ShopSidebarRight from "@/components/shop/ShopSidebarRight";
import React from "react";

// Make this page dynamic to avoid build errors with undefined data
export const dynamic = "force-dynamic";

export const metadata = {
  title:
    "Shop Right Sidebar | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Topbar1 /> <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="row">
            <div className="col-12">
              <div className="heading text-center">New Arrival</div>
              <p className="text-center text-2 text_black-2 mt_5">
                Shop through our latest selection of Fashion
              </p>
            </div>
          </div>
        </div>
      </div>
      <ShopSidebarRight />
      <Footer1 />
    </>
  );
}
