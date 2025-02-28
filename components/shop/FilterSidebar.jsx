"use client";
import { layouts } from "@/data/shop";
import ProductGrid from "./ProductGrid";
import { useState, useEffect } from "react";

import SidebarFilter from "./SidebarFilter";

import Pagination from "../common/Pagination";
import Sorting from "./Sorting";

export default function FilterSidebar({ categories = [] }) {
  const [gridItems, setGridItems] = useState(3);
  const [products, setProducts] = useState([]);
  const [finalSorted, setFinalSorted] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    
    try {
      const response = await fetch(`/api/subcategories?mainCategoryId=${category.MainCatID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sub-categories');
      }
      const fetchedSubCategories = await response.json();
      setSubCategories(fetchedSubCategories);
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
      setSubCategories([]);
    }
  };

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
  };

  return (
    <>
      <section className="flat-spacing-1">
        <div className="container">
          <div className="tf-shop-control grid-3 align-items-center">
            <div />
            <ul className="tf-control-layout d-flex justify-content-center">
              {layouts.map((layout, index) => (
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
            </ul>
            <div className="tf-control-sorting d-flex justify-content-end">
              <div className="tf-dropdown-sort" data-bs-toggle="dropdown">
                <Sorting setFinalSorted={setFinalSorted} products={products} />
              </div>
            </div>
          </div>
          <div className="tf-row-flex">
            <div className="tf-sidebar-shop">
              <div className="tf-sidebar-widget">
                <h3 className="title-widget">Main Categories</h3>
                <div className="list-categories">
                  {categories.map((category) => (
                    <div 
                      key={category.MainCatID} 
                      className={`category-item ${selectedCategory?.MainCatID === category.MainCatID ? 'active' : ''}`}
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category.MainCatName}
                      {category.PlatformName && (
                        <span className="platform-name">
                          ({category.PlatformName})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {subCategories.length > 0 && (
                <div className="tf-sidebar-widget">
                  <h3 className="title-widget">Sub Categories</h3>
                  <div className="list-categories">
                    {subCategories.map((subCategory) => (
                      <div 
                        key={subCategory.CatID} 
                        className={`category-item ${selectedSubCategory?.CatID === subCategory.CatID ? 'active' : ''}`}
                        onClick={() => handleSubCategorySelect(subCategory)}
                      >
                        {subCategory.CatName}
                        <span className="product-count">
                          ({subCategory.ProductCount} products)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <SidebarFilter 
                setProducts={setProducts} 
                selectedCategory={selectedCategory}
                selectedSubCategory={selectedSubCategory}
              />
            </div>
            <div className="tf-shop-content wrapper-control-shop">
              <div className="meta-filter-shop">
                {selectedCategory && (
                  <h2>
                    {selectedCategory.MainCatName} 
                    {selectedCategory.PlatformName && ` - ${selectedCategory.PlatformName}`}
                    {selectedSubCategory && ` > ${selectedSubCategory.CatName}`}
                  </h2>
                )}
              </div>
              <ProductGrid allproducts={finalSorted} gridItems={gridItems} />
              {/* pagination */}{" "}
              {finalSorted.length ? (
                <ul className="tf-pagination-wrap tf-pagination-list tf-pagination-btn">
                  <Pagination />
                </ul>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </section>
      <div className="btn-sidebar-mobile start-0">
        <a
          href="#sidebarmobile"
          data-bs-toggle="offcanvas"
          aria-controls="offcanvasLeft"
        >
          <button className="type-hover">
            <i className="icon-open" />
            <span className="fw-5">Open sidebar</span>
          </button>
        </a>
      </div>
    </>
  );
}
