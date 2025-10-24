import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Topbar2 from "@/components/header/Topbar2";
import ShopDefault from "@/components/shop/ShopDefault";

import React from "react";

export const metadata = {
  title: "Home Search || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};

//get search results from the database
async function getSearchResults() {
  // This would typically fetch search results from your API
  // For now, return empty array
  return [];
}

export default async function page() {
  const searchResults = await getSearchResults();
  return (
    <>
      <Topbar2 />
      <Header2 />
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Search</div>
        </div>
      </div>
      <ShopDefault />
      <Footer1 />
    </>
  );
}
