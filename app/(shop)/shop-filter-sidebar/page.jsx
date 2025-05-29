import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import FilterSidebar from "@/components/shop/FilterSidebar";

import React from "react";

export const metadata = {
  title:
    "Shop Categories | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "Browse our performance suspension and chassis parts categories",
};

export default function ShopFilterSidebar({ searchParams }) {
  // You can get the platform from searchParams, params, or set a default
  const platform = searchParams?.platform || "";

  return (
    <>
      <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Our Categories</div>
          <p className="text-center text-2 text_black-2 mt_5">
            Explore our performance parts by category
          </p>
        </div>
      </div>
      <FilterSidebar platform={platform} />
      <Footer1 />
    </>
  );
}
