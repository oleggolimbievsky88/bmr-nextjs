"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ShopSidebarleft from "./ShopSidebarleft";
import { ProductCard } from "../shopCards/ProductCard";
import ProductCardList from "../shopCards/ProductCardList";

export default function ProductGrid({
  platformName,
  products = [],
  allproducts = [],
  selectedCategory = null,
  selectedSubCategory = null,
  showCategories = true,
  gridItems = 4,
}) {
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [colorsMap, setColorsMap] = useState({});

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
          `/api/categories?platform=${encodeURIComponent(platformName)}`,
        );
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setCategories(data.categories || []);
        setMainCategories(data.mainCategories || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [platformName, showCategories]);

  // Fetch colors list and build colorsMap
  useEffect(() => {
    async function fetchColors() {
      try {
        const res = await fetch("/api/colors");
        if (!res.ok) throw new Error("Failed to fetch colors");
        const data = await res.json();
        // data.colors should be an array of { ColorID, ColorName, ColorImg }
        const map = Object.fromEntries(
          (data.colors || []).map((c) => [String(c.ColorID), c]),
        );
        setColorsMap(map);
      } catch (err) {
        // fallback: empty map
        setColorsMap({});
      }
    }
    fetchColors();
  }, []);

  if (loading && showCategories)
    return <div className="text-center p-4">Loading...</div>;
  if (error)
    return <div className="text-center text-danger p-4">Error: {error}</div>;

  function getColClass(gridItems) {
    switch (gridItems) {
      case 1:
        return "col-12";
      case 2:
        return "col-6";
      case 3:
        return "col-6 col-md-4";
      case 4:
        return "col-6 col-md-4 col-lg-3";
      default:
        return "col-6 col-md-4 col-lg-3";
    }
  }

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
                  selectedMainCategory === category.id ? null : category.id,
                )
              }
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Categories Grid (commented out for now) */}
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

      {/* Product Count */}
      {/* <div
        style={{
          width: "fit-content",
          margin: "0  auto",
          fontSize: "17px",
          marginBottom: "24px",
        }}
      >
        {allproducts.length} product(s) found
      </div> */}

      {/* Products Grid (list or grid) */}
      {allproducts && allproducts.length > 0 ? (
        gridItems == 1 ? (
          <div className="grid-layout" data-grid="grid-list">
            {allproducts.map((elm, i) => (
              <ProductCardList product={elm} colorsMap={colorsMap} key={i} />
            ))}
          </div>
        ) : (
          <div
            className="grid-layout wrapper-shop"
            data-grid={`grid-${gridItems}`}
          >
            {allproducts.map((elm, i) => (
              <ProductCard product={elm} colorsMap={colorsMap} key={i} />
            ))}
          </div>
        )
      ) : (
        <div className="text-center p-4">
          No items found {platformName ? `for ${platformName}` : ""}
        </div>
      )}
    </div>
  );
}
