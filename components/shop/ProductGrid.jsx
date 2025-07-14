"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ShopSidebarleft from "./ShopSidebarleft";

export default function ProductGrid({
  platformName,
  products = [],
  allproducts = [],
  selectedCategory = null,
  selectedSubCategory = null,
  showCategories = true,
}) {
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!platformName || !showCategories) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/categories?platform=${encodeURIComponent(platformName)}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        console.log("Fetched Data:", data); // Debug log

        if (data.error) {
          throw new Error(data.error);
        }

        setCategories(data.categories || []);
        setMainCategories(data.mainCategories || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [platformName, showCategories]);

  // Show loading state only when fetching categories
  if (loading && showCategories)
    return <div className="text-center p-4">Loading...</div>;
  if (error)
    return <div className="text-center text-danger p-4">Error: {error}</div>;

  return (
    <div className="container-fluid">
      {/* Main Categories Section */}
      {showCategories && mainCategories.length > 0 && (
        <div className="filter-buttons d-flex justify-content-center gap-3 mb-4">
          {mainCategories.map((category) => (
            <button
              key={category.id}
              className={`btn ${
                selectedMainCategory === category.id
                  ? "btn-danger"
                  : "btn-outline-danger"
              }`}
              onClick={() =>
                setSelectedMainCategory(
                  selectedMainCategory === category.id ? null : category.id
                )
              }
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Categories Grid */}
      {/* showCategories && categories.length > 0 && (
        <div className="row g-4 justify-content-center mt-4">
          {categories
            .filter(
              (cat) =>
                !selectedMainCategory ||
                cat.mainCategoryId === selectedMainCategory
            )
            .map((category) => (
              <div key={category.id} className="col-md-3">
                <Link
                  href={`/platform/${platformName}/${category.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="text-decoration-none"
                >
                  <div className="card category-card h-100">
                    {category.CatImage && (
                      <img
                        src={`https://www.bmrsuspension.com/siteart/categories/LLK1861R_1024.jpg`}
                        alt={category.name}
                        className="card-img-top"
                      />
                    )}
                    <div className="card-body text-center">
                      <h5 className="card-title">{category.name}</h5>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
        </div>
      ) */}

      {/* Products Grid */}

      {products && products.length > 0 && (
        <div className="row g-4 mt-4">
          {products.map((product) => (
            <div key={product.ProductID} className="col-6 col-md-4 col-lg-3">
              <div className="card h-100 product-card">
                <Link
                  href={`/product/${product.ProductID}`}
                  className="text-decoration-none"
                >
                  <div
                    className="position-relative"
                    style={{ height: "200px" }}
                  >
                    <Image
                      src={
                        product.ImageSmall
                          ? `https://bmrsuspension.com/siteart/products/${product.ImageSmall}`
                          : "https://bmrsuspension.com/siteart/products/noimage.jpg"
                      }
                      alt={product.ProductName}
                      fill
                      className="card-img-top p-2"
                      style={{ objectFit: "contain" }}
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      unoptimized={true}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://bmrsuspension.com/siteart/products/noimage.jpg";
                      }}
                    />
                  </div>
                  <div className="card-body">
                    <h3
                      className="h6 mb-2 product-title"
                      style={{ minHeight: "2.5rem" }}
                    >
                      {product.ProductName}
                    </h3>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-danger">
                        ${parseFloat(product.Price).toFixed(2)}
                      </span>
                      <small className="text-muted">
                        Part #: {product.PartNumber}
                      </small>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {!loading && !error && !categories.length && !products?.length && (
        <div className="text-center p-4">
          No items found {platformName ? `for ${platformName}` : ""}
        </div>
      )}
    </div>
  );
}
