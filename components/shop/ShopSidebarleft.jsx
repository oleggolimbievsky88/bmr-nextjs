"use client";
import Sidebar from "./Sidebar";
import ShopLoadmoreOnScroll from "./ShopLoadmoreOnScroll";

export default function ShopSidebarleft({
  products,
  categories,
  mainCategories,
  isMainCategory,
  platform,
  selectedMainCatId,
  selectedCatId,
  selectedMainCatSlug = null,
  selectedCatSlug = null,
  onCategorySelect,
  applicationYear = null,
}) {
  // Determine what to show in the sidebar and main content
  const sidebarMainCategories = mainCategories;
  const sidebarCategories = isMainCategory ? [] : categories;
  return (
    <>
      <section className="flat-spacing-1">
        <div className="container">
          <div className="tf-shop-control grid-3 align-items-center">
            <div className="tf-control-filter"></div>
          </div>
          <div className="tf-row-flex">
            <Sidebar
              mainCategories={sidebarMainCategories}
              categories={sidebarCategories}
              products={products}
              selectedMainCatId={isMainCategory ? selectedMainCatId : null}
              selectedCatId={selectedCatId}
              platform={platform}
              isMainCategory={isMainCategory}
              selectedMainCatSlug={selectedMainCatSlug}
              selectedCatSlug={selectedCatSlug}
              onCategorySelect={onCategorySelect}
            />
            <div className="tf-shop-content">
              <ShopLoadmoreOnScroll
                platform={platform?.slug || platform}
                mainCategory={selectedMainCatSlug ? selectedMainCatSlug : null}
                categories={[]}
                products={products}
                applicationYear={applicationYear}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
