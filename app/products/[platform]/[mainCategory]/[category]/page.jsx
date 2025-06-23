import FilterSidebar from "@/components/shop/FilterSidebar";
import Topbar1 from "@/components/header/Topbar1";
import React from "react";

export const metadata = {
  title: "Shop Filter Sidebar || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page({ params }) {
  const { platform, mainCategory, category } = params;
  return (
    <>
      <Topbar1 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">
            {mainCategory} - {category}
          </div>
        </div>
      </div>
      {/* <FilterSidebar /> */}
      <ShopSidebarleft
        platform={platformInfo}
        isMainCategory={true}
        products={featuredProducts}
        setProducts={featuredProducts}
        categories={categories}
        mainCategories={mainCategories}
        selectedMainCatId={null}
        selectedCatId={null}
      />
    </>
  );
}
