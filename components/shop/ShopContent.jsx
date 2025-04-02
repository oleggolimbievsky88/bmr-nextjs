"use client";

import { useState } from "react";
import Sidebar from "@/components/shop/ShopSidebarleft";
import { layouts } from "@/data/shop";
import ProductGrid from "@/components/shop/ProductGrid";
import Pagination from "@/components/common/Pagination";
import Sorting from "@/components/shop/Sorting";

export default function ShopContent({
  initialProducts,
  categories,
  brands,
  platforms,
}) {
  const [gridItems, setGridItems] = useState(3);
  const [products, setProducts] = useState(initialProducts);
  const [finalSorted, setFinalSorted] = useState(initialProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = finalSorted.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(finalSorted.length / productsPerPage);

  // Handle filter updates from sidebar
  const handleFilterUpdate = async (filters) => {
    try {
      const response = await fetch("/api/products/filter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });
      const data = await response.json();
      setProducts(data);
      setFinalSorted(data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error filtering products:", error);
    }
  };

  return (
    <>
      <div className="tf-shop-control grid-3 align-items-center">
        <div className="tf-control-filter"></div>
        <ul className="tf-control-layout d-flex justify-content-center">
          {layouts.slice(0, 3).map((layout, index) => (
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
        <Sidebar
          categories={categories}
          brands={brands}
          platforms={platforms}
          onFilterUpdate={handleFilterUpdate}
        />
        <div className="tf-shop-content">
          <ProductGrid allproducts={currentProducts} gridItems={gridItems} />
          {finalSorted.length > productsPerPage && (
            <ul className="tf-pagination-wrap tf-pagination-list">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
