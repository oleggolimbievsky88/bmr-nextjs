"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import { layouts, sortingOptions } from "@/data/shop";
import ProductGrid from "./ProductGrid";
import Pagination from "../common/Pagination";
import Sorting from "./Sorting";
import ShopLoadmoreOnScroll from "./ShopLoadmoreOnScroll";
// import { products1 } from "@/data/products";

export default function ShopSidebarleft({
  products,
  categories,
  mainCategories,
  isMainCategory,
  platform,
  selectedMainCatId,
  selectedCatId,
  selectedMainCatSlug = null,
}) {
  const [gridItems, setGridItems] = useState(3);
  const [finalSorted, setFinalSorted] = useState([]);

  // Determine what to show in the sidebar and main content
  const sidebarMainCategories = mainCategories;
  const sidebarCategories = isMainCategory ? [] : categories;

  return (
    <>
      <section className="flat-spacing-1">
        <div className="container">
          <div className="tf-shop-control grid-3 align-items-center">
            <div className="tf-control-filter"></div>
            {/* <ul className="tf-control-layout d-flex justify-content-center">
              {layouts.slice(0, 4).map((layout, index) => (
                <li
                  key={index}
                  className={`tf-view-layout-switch ${layout.className} ${
                    gridItems == layout.dataValueGrid ? "active" : ""
                  }`}
                  onClick={() => setGridItems(layout.dataValueGrid)}
                >
                  <div className="item">
                    <span className={`icon ${layout.iconClass}`} />
                  </div>
                </li>
              ))}
            </ul> */}
            {/* <span></span>
            <div className="tf-control-sorting d-flex justify-content-end">
              <div className="tf-dropdown-sort" data-bs-toggle="dropdown">
                <Sorting setFinalSorted={setFinalSorted} products={products} />
              </div>
            </div> */}
          </div>
          <div className="tf-row-flex">
            <Sidebar
              mainCategories={sidebarMainCategories}
              categories={sidebarCategories}
              products={products}
              selectedMainCatId={isMainCategory ? selectedMainCatId : null}
              selectedCatId={!isMainCategory ? selectedCatId : null}
              platform={platform}
              isMainCategory={isMainCategory}
              selectedMainCatSlug={selectedMainCatSlug}
            />
            <div className="tf-shop-content">
              {/* <ProductGrid products={finalSorted} gridItems={gridItems} /> */}
              <ShopLoadmoreOnScroll
                platform={platform?.slug || platform} // Use .slug if platform is an object, or platform if it's already a string
                mainCategory={selectedMainCatSlug ? selectedMainCatSlug : null}
                categories={[]}
              />
              {/* {finalSorted.length ? (
                <ul className="tf-pagination-wrap tf-pagination-list">
                  <Pagination />
                </ul>
              ) : (
                ""
              )} */}
            </div>
          </div>
        </div>
      </section>
      {/* <div className="btn-sidebar-style2">
        <button
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarmobile"
          aria-controls="offcanvas"
        >
          <i className="icon icon-sidebar-2" />
        </button>
      </div> */}
    </>
  );
}
