"use client";
import { useEffect, useRef, useState } from "react";
import ProductGrid from "./ProductGrid";
import ShopFilter from "./ShopFilter";
import Sorting from "./Sorting";
import { layouts } from "@/data/shop";
import { useShopGridItems } from "@/hooks/useShopGridItems";

const PAGE_SIZE = 8;

export default function ShopLoadmoreOnScroll({
  platform,
  mainCategory,
  category,
  products: initialProducts = [],
  applicationYear = null,
}) {
  const [allproducts, setAllproducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [gridItems, setGridItems] = useShopGridItems(4);
  const [finalSorted, setFinalSorted] = useState([]);
  const sentinelRef = useRef(null);

  // Fetch products with optional filters
  const fetchProducts = async (pageNum) => {
    if (loaded) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: PAGE_SIZE,
      });
      if (platform) params.append("platform", platform);
      if (mainCategory) params.append("mainCategory", mainCategory);
      if (category) params.append("catid", category); // use category as catid for now
      if (applicationYear) params.append("year", String(applicationYear));

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      const products = data.products || [];
      if (products.length === 0 || products.length < PAGE_SIZE) setLoaded(true);
      if (products.length > 0) {
        setAllproducts((prev) => [
          ...prev,
          ...products.filter(
            (p) => !prev.some((existing) => existing.ProductID === p.ProductID),
          ),
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      // Use the products passed from parent
      setAllproducts(initialProducts);
      // If we have exactly PAGE_SIZE or more products initially, there might be more to load
      // Only mark as loaded if we have fewer than PAGE_SIZE products
      if (initialProducts.length < PAGE_SIZE) {
        setLoaded(true);
      } else {
        // Start from the next page based on how many products we already have
        const nextPageNum = Math.floor(initialProducts.length / PAGE_SIZE) + 1;
        setPage(nextPageNum);
        setLoaded(false);
      }
    } else {
      // Only fetch if we don't have initial products and have specific filters
      if (platform && (mainCategory || category)) {
        setAllproducts([]);
        setPage(1);
        setLoaded(false);
        fetchProducts(1);
      } else if (platform && !mainCategory && !category) {
        // Platform-only page without initial products - don't auto-fetch
        setAllproducts([]);
        setLoaded(true);
      }
    }
    // eslint-disable-next-line
  }, [initialProducts, platform, mainCategory, category]);

  // Infinite scroll observer
  useEffect(() => {
    if (loaded) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && !loaded) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
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
    // eslint-disable-next-line
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
                className="tf-btn-filter d-block d-md-none"
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
                    gridItems === layout.dataValueGrid ? "active" : ""
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
                <Sorting
                  setFinalSorted={setFinalSorted}
                  products={allproducts}
                />
              </div>
            </div>
          </div>
          <div className="wrapper-control-shop">
            <div className="meta-filter-shop" />
            <ProductGrid
              allproducts={finalSorted.length ? finalSorted : allproducts}
              gridItems={gridItems}
            />
            <div ref={sentinelRef} style={{ height: 1 }} />
            {loading && <div className="text-center">Loading...</div>}
          </div>
        </div>
      </section>
      <ShopFilter products={allproducts} setProducts={setAllproducts} />
    </>
  );
}
