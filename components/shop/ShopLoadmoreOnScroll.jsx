"use client";
import { useEffect, useRef, useState } from "react";
import ProductGrid from "./ProductGrid";
import ShopFilter from "./ShopFilter";
import Sorting from "./Sorting";
import { layouts } from "@/data/shop";

const PAGE_SIZE = 12;

export default function ShopLoadmoreOnScroll({
  platform,
  mainCategory,
  category,
}) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [gridItems, setGridItems] = useState(4);
  const [finalSorted, setFinalSorted] = useState([]);
  const sentinelRef = useRef(null);

  // Fetch products with optional filters
  const fetchProducts = async (pageNum) => {
    if (loading || loaded) return; // Prevent duplicate fetches
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: PAGE_SIZE,
      });
      if (platform) params.append("platform", platform);
      if (mainCategory) params.append("mainCategory", mainCategory);
      if (category) params.append("category", category);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      const newProducts = data.products || [];
      if (newProducts.length === 0 || newProducts.length < PAGE_SIZE)
        setLoaded(true);
      if (newProducts.length > 0) {
        setProducts((prev) => [...prev, ...newProducts]);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  // This effect runs whenever the platform, mainCategory, or category props change.
  // It resets the products list, page number, and loaded state to their initial values,
  // then fetches the first page of products with the new filters.
  useEffect(() => {
    setProducts([]); // Clear the current list of products
    setPage(1); // Reset the page number to 1
    setLoaded(false); // Indicate that not all products have been loaded yet
    fetchProducts(1); // Fetch the first page of products with the new filters
  }, [platform, mainCategory, category]);

  // Infinite scroll observer
  useEffect(() => {
    if (loaded) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && !loaded) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => {
      if (sentinelRef.current) observer.unobserve(sentinelRef.current);
    };
  }, [loaded, loading]);

  // Fetch next page when page changes
  useEffect(() => {
    if (page === 1) return;
    fetchProducts(page);
  }, [page]);

  return (
    <>
      <section className="flat-spacing-2">
        <div className="container">
          <div className="tf-shop-control grid-3 align-items-center">
            <div className="tf-control-filter">
              <a
                href="#filterShop"
                data-bs-toggle="offcanvas"
                aria-controls="offcanvasLeft"
                className="tf-btn-filter"
              >
                <span className="icon icon-filter" />
                <span className="text">Filter</span>
              </a>
            </div>
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
          <div className="wrapper-control-shop">
            <div className="meta-filter-shop" />
            <ProductGrid
              allproducts={finalSorted.length ? finalSorted : products}
              gridItems={gridItems}
            />
            {(finalSorted.length ? finalSorted : products).length > 0 && (
              <div ref={sentinelRef} style={{ height: 1 }} />
            )}
            {loading && <div className="text-center">Loading...</div>}
            {!loading && products.length === 0 && (
              <div className="text-center">No Items found</div>
            )}
            {loaded && products.length > 0 && (
              <div className="text-center">No more products</div>
            )}
            {/* pagination */}
            <div className="tf-pagination-wrap view-more-button text-center tf-pagination-btn"></div>
          </div>
        </div>
      </section>
      <ShopFilter products={products} setProducts={setProducts} />
    </>
  );
}
