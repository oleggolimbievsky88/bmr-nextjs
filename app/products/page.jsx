// For App Router: /app/products/page.js
"use client";
import { useEffect, useState } from "react";
import ProductCard19 from "@/components/shopCards/ProductCard19";
import ProductSkeleton from "@/components/ui/ProductSkeleton";
import ShopFilter from "@/components/shop/ShopFilter";
import Sorting from "@/components/shop/Sorting";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortedProducts, setSortedProducts] = useState([]);

  // Fetch products from the API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        setProducts(data);
        setSortedProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="container">
      <div className="row g-4">
        {/* Left Sidebar - Filters */}
        <div className="col-lg-3">
          <div className="shop-sidebar">
            <ShopFilter setProducts={setSortedProducts} products={products} />
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9">
          {/* Top Bar - Sorting and View Options */}
          <div className="shop-top-bar">
            <div className="row align-items-center">
              <div className="col-lg-12">
                <Sorting
                  products={products}
                  setFinalSorted={setSortedProducts}
                />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="row g-4">
            {loading ? (
              <ProductSkeleton count={12} />
            ) : error ? (
              <div className="col-12">
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-info" role="alert">
                  No products found matching your criteria.
                </div>
              </div>
            ) : (
              sortedProducts.map((product) => (
                <div key={product.ProductID} className="col-sm-6 col-xl-4">
                  <ProductCard19 product={product} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
