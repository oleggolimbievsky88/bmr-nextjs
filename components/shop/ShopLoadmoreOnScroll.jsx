// "use client";
// import { layouts, sortingOptions } from "@/data/shop";
// import ProductGrid from "./ProductGrid";
// import { useEffect, useRef, useState } from "react";
// import { products1 } from "@/data/products";
// import ShopFilter from "./ShopFilter";
// import Sorting from "./Sorting";

// export default function ShopLoadmoreOnScroll() {
//   const [gridItems, setGridItems] = useState(4);
//   const [loading, setLoading] = useState(false);
//   const [loaded, setLoaded] = useState(false);
//   const [allproducts, setAllproducts] = useState([...products1]);
//   const [products, setProducts] = useState([]);
//   const [finalSorted, setFinalSorted] = useState([]);
//   const handleLoad = () => {
//     setLoading(true);
//     setTimeout(() => {
//       setAllproducts((pre) => [...pre, ...products1.slice(0, 12)]);
//       setLoading(false);
//     }, 1000);
//   };

//   const elementRef = useRef(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           handleLoad();
//         }
//       },
//       { threshold: 0.1 } // Trigger when 10% of the element is visible
//     );

//     if (elementRef.current) {
//       observer.observe(elementRef.current);
//     }

//     return () => {
//       if (elementRef.current) {
//         observer.unobserve(elementRef.current);
//       }
//     };
//   }, []);
//   return (
//     <>
//       <section className="flat-spacing-2">
//         <div className="container">
//           <div className="tf-shop-control grid-3 align-items-center">
//             <div className="tf-control-filter">
//               <a
//                 href="#filterShop"
//                 data-bs-toggle="offcanvas"
//                 aria-controls="offcanvasLeft"
//                 className="tf-btn-filter"
//               >
//                 <span className="icon icon-filter" />
//                 <span className="text">Filter</span>
//               </a>
//             </div>
//             <ul className="tf-control-layout d-flex justify-content-center">
//               {layouts.map((layout, index) => (
//                 <li
//                   key={index}
//                   className={`tf-view-layout-switch ${layout.className} ${
//                     gridItems == layout.dataValueGrid ? "active" : ""
//                   }`}
//                   onClick={() => setGridItems(layout.dataValueGrid)}
//                 >
//                   <div className="item">
//                     <span className={`icon ${layout.iconClass}`} />
//                   </div>
//                 </li>
//               ))}
//             </ul>
//             <div className="tf-control-sorting d-flex justify-content-end">
//               <div className="tf-dropdown-sort" data-bs-toggle="dropdown">
//                 <Sorting setFinalSorted={setFinalSorted} products={products} />
//               </div>
//             </div>
//           </div>
//           <div className="wrapper-control-shop">
//             <div className="meta-filter-shop" />
//             <ProductGrid allproducts={finalSorted} gridItems={gridItems} />
//             {/* pagination */}
//             <div className="tf-pagination-wrap view-more-button text-center tf-pagination-btn">
//               {!loaded && (
//                 <button
//                   ref={elementRef}
//                   className={`tf-btn-loading tf-loading-default animate-hover-btn btn-loadmore ${
//                     loading ? "loading" : ""
//                   } `}
//                   onClick={() => handleLoad()}
//                 >
//                   <span className="text">Load more</span>
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>
//       <ShopFilter products={allproducts} setProducts={setProducts} />{" "}
//     </>
//   );
// }

"use client";
import { useEffect, useRef, useState } from "react";
import ProductGrid from "./ProductGrid";
import ShopFilter from "./ShopFilter";
import Sorting from "./Sorting";
import { layouts } from "@/data/shop";

const PAGE_SIZE = 8;

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

  console.log("products", products);
  console.log("page", page);
  console.log("loaded", loaded);
  console.log("loading", loading);
  console.log("gridItems", gridItems);
  console.log("finalSorted", finalSorted);
  console.log("sentinelRef", sentinelRef);

  // Fetch products with optional filters
  const fetchProducts = async (pageNum) => {
    if (loaded) return; // Prevent duplicate fetches
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
      const products = data.products || [];
      if (products.length === 0 || products.length < PAGE_SIZE) setLoaded(true);
      if (products.length > 0) {
        setProducts((prev) => [
          ...prev,
          ...products.filter(
            (p) => !prev.some((existing) => existing.ProductID === p.ProductID)
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
    setProducts([]);
    setPage(1);
    setLoaded(false);
    fetchProducts(1);
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
      <section>
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
              products={finalSorted.length ? finalSorted : products}
              gridItems={gridItems}
            />
            <div ref={sentinelRef} style={{ height: 1 }} />
            {loading && <div className="text-center">Loading...</div>}
            {loaded && <div className="text-center">Products Loaded.</div>}
          </div>
        </div>
      </section>
      <ShopFilter products={products} setProducts={setProducts} />
    </>
  );
}
