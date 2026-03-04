/**
 * Sidebar component for the product page.
 * Shows the main categories, sub-categories, and products for the selected category.
 * Uses the same layout as the main category page but with the category name in the title.
 */
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
  platformSlug: platformSlugProp = null,
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
  sort = "default",
  onSortChange,
  filtersOpen = false,
  setFiltersOpen = () => {},
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
        <div className="container m-0 p-0">
          <div className="tf-row-flex">
            <div className={`bm-offcanvas ${filtersOpen ? "is-open" : ""}`}>
              <div
                className="bm-offcanvas__backdrop d-lg-none"
                onClick={() => setFiltersOpen(false)}
              />
              <div className="bm-offcanvas__panel">
                <div className="bm-offcanvas__header d-lg-none">
                  <div className="bm-offcanvas__title">Filters</div>
                  <button
                    className="bm-btn"
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <Sidebar
                  mainCategories={sidebarMainCategories}
                  categories={sidebarCategories}
                  productTypeCategories={sidebarProductTypes}
                  products={products}
                  selectedMainCatId={isMainCategory ? selectedMainCatId : null}
                  selectedCatId={selectedCatId}
                  platform={platform}
                  platformSlug={platformSlugProp}
                  isMainCategory={isMainCategory}
                  selectedMainCatSlug={selectedMainCatSlug}
                  selectedCatSlug={selectedCatSlug}
                  onCategorySelect={onCategorySelect}
                  attributeFilterOptions={attributeFilterOptions}
                  selectedAttributeFilters={selectedAttributeFilters}
                  onAttributeFilterChange={onAttributeFilterChange}
                />
              </div>
            </div>
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
                sort={sort}
                onSortChange={onSortChange}
                onOpenFilters={() => setFiltersOpen(true)}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
