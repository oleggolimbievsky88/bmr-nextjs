/**
 * Component for loading more products on scroll.
 * Shows a grid of products and a filter sidebar.
 * Uses the same layout as the main category page but with the category name in the title.
 */
"use client";
import { useEffect, useRef, useState } from "react";
import ProductGrid from "./ProductGrid";
import { useShopGridItems } from "@/hooks/useShopGridItems";
import ProductListToolbar from "./ProductListToolbar";

const PAGE_SIZE = 8;

export default function ShopLoadmoreOnScroll({
  platform,
  mainCategory,
  category,
  includeDescendants = false,
  products: initialProducts = [],
  applicationYear = null,
  attributeFilters = {},
  sort = "default",
  onSortChange,
  onOpenFilters,
}) {
  const [allproducts, setAllproducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [gridItems, setGridItems] = useShopGridItems(4);
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
      if (category) params.append("category", category);
      if (includeDescendants) params.set("includeDescendants", "true");
      if (applicationYear) params.append("year", String(applicationYear));
      if (sort) params.set("sort", sort);
      Object.keys(attributeFilters || {}).forEach((slug) => {
        const values = attributeFilters[slug];
        if (values && values.length)
          params.set(`attr_${slug}`, values.join(","));
      });

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
      // No initial products: fetch when we have platform (main-category page or platform-only page)
      if (platform) {
        setAllproducts([]);
        setPage(1);
        setLoaded(false);
        fetchProducts(1);
      }
    }
    // eslint-disable-next-line
  }, [
    initialProducts,
    platform,
    mainCategory,
    category,
    attributeFilters,
    sort,
  ]);

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
          <div className="wrapper-control-shop">
            <div className="meta-filter-shop" />
            <ProductListToolbar
              total={allproducts.length}
              sortValue={sort}
              onSortChange={onSortChange}
              onOpenFilters={onOpenFilters}
              gridItems={gridItems}
              onGridChange={setGridItems}
            />
            <ProductGrid allproducts={allproducts} gridItems={gridItems} />
            <div ref={sentinelRef} style={{ height: 1 }} />
            {loading && <div className="text-center">Loading...</div>}
          </div>
        </div>
      </section>
    </>
  );
}
