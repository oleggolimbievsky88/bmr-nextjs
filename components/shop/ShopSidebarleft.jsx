"use client";
import Sidebar from "./Sidebar";
import ShopLoadmoreOnScroll from "./ShopLoadmoreOnScroll";

export default function ShopSidebarleft({
  products,
  categories,
  productTypeCategories = null,
  mainCategories,
  isMainCategory,
  platform,
  selectedMainCatId,
  selectedCatId,
  selectedMainCatSlug = null,
  selectedCatSlug = null,
  onCategorySelect,
  applicationYear = null,
  attributeFilterOptions = [],
  selectedAttributeFilters = {},
  onAttributeFilterChange,
  categorySlug = null,
  includeDescendants = false,
}) {
  // Determine what to show in the sidebar and main content
  const sidebarMainCategories = mainCategories;
  const sidebarCategories = isMainCategory ? [] : categories;
  // Use productTypeCategories for Product Types section when provided (keeps list visible when a type is selected)
  const sidebarProductTypes =
    productTypeCategories != null && productTypeCategories.length > 0
      ? productTypeCategories
      : sidebarCategories;
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
              productTypeCategories={sidebarProductTypes}
              products={products}
              selectedMainCatId={isMainCategory ? selectedMainCatId : null}
              selectedCatId={selectedCatId}
              platform={platform}
              isMainCategory={isMainCategory}
              selectedMainCatSlug={selectedMainCatSlug}
              selectedCatSlug={selectedCatSlug}
              onCategorySelect={onCategorySelect}
              attributeFilterOptions={attributeFilterOptions}
              selectedAttributeFilters={selectedAttributeFilters}
              onAttributeFilterChange={onAttributeFilterChange}
            />
            <div className="tf-shop-content">
              <ShopLoadmoreOnScroll
                platform={platform?.slug || platform}
                mainCategory={selectedMainCatSlug ? selectedMainCatSlug : null}
                category={categorySlug}
                includeDescendants={includeDescendants}
                categories={[]}
                products={products}
                applicationYear={applicationYear}
                attributeFilters={selectedAttributeFilters}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
