"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/shopCards/ProductCard";

export default function SearchResults({
  groupedResults = {},
  searchQuery = "",
}) {
  const {
    products = [],
    categories = [],
    vehicles = [],
    brands = [],
  } = groupedResults;

  const [colorsMap, setColorsMap] = useState({});
  const [showAllProducts, setShowAllProducts] = useState(false);

  // Fetch colors list and build colorsMap
  useEffect(() => {
    async function fetchColors() {
      try {
        const res = await fetch("/api/colors");
        if (!res.ok) throw new Error("Failed to fetch colors");
        const data = await res.json();
        // data.colors should be an array of { ColorID, ColorName, ColorImg, ColorImgLarge }
        const map = Object.fromEntries(
          (data.colors || []).map((c) => [String(c.ColorID), c])
        );
        setColorsMap(map);
      } catch (err) {
        // fallback: empty map
        setColorsMap({});
      }
    }
    fetchColors();
  }, []);

  // Limit products to 8 initially
  const displayedProducts = showAllProducts ? products : products.slice(0, 8);
  const hasMoreProducts = products.length > 8;

  const totalResults =
    products.length + categories.length + vehicles.length + brands.length;

  if (totalResults === 0) {
    return (
      <section className="flat-spacing-2">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="text-center py-5">
                <h3>No results found</h3>
                <p className="text-muted">
                  Try adjusting your search terms or browse our categories
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing-2">
      <div className="container">
        {/* Products Section */}
        {products.length > 0 && (
          <div className="mb-5">
            <div className="flat-title">
              <span
                className="title wow fadeInUp home-title"
                data-wow-delay="0s"
              >
                <span style={{ color: "var(--primary)" }}>- </span>
                Products ({products.length})
                <span style={{ color: "var(--primary)" }}> -</span>
              </span>
            </div>
            <div className="grid-layout wrapper-shop" data-grid="grid-4">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.ProductID}
                  product={product}
                  colorsMap={colorsMap}
                />
              ))}
            </div>
            {hasMoreProducts && !showAllProducts && (
              <div className="text-center mt-4">
                <button
                  onClick={() => setShowAllProducts(true)}
                  className="btn btn-outline-primary"
                  style={{
                    borderColor: "var(--primary)",
                    color: "var(--primary)",
                    padding: "10px 30px",
                    fontSize: "16px",
                    fontWeight: "500",
                    borderRadius: "5px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  View More
                  <i
                    className="icon icon-arrow-down"
                    style={{ fontSize: "18px" }}
                  ></i>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Categories Section */}
        {categories.length > 0 && (
          <div className="mb-5">
            <div className="flat-title">
              <span
                className="title wow fadeInUp home-title"
                data-wow-delay="0s"
              >
                Categories ({categories.length})
              </span>
            </div>
            <div className="row">
              {categories.map((category) => (
                <div
                  key={category.CatID}
                  className="col-lg-3 col-md-4 col-sm-6 col-12 mb-3"
                >
                  <Link
                    href={`/homes/home-search?q=${encodeURIComponent(
                      category.CatName
                    )}`}
                    className="card h-100 text-decoration-none search-result-card"
                    style={{
                      borderRadius: "15px",
                      border: "2px solid #e9ecef",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--primary)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(204, 0, 0, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e9ecef";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.1)";
                    }}
                  >
                    <div className="card-body" style={{ padding: "1.5rem" }}>
                      <h5
                        className="card-title"
                        style={{ color: "#000", marginBottom: "0.5rem" }}
                      >
                        {category.CatName}
                      </h5>
                      <p
                        className="text-muted small mb-0"
                        style={{ color: "var(--primary)", fontWeight: "500" }}
                      >
                        Category
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vehicles Section */}
        {vehicles.length > 0 && (
          <div className="mb-5">
            <div className="flat-title">
              <span
                className="title wow fadeInUp home-title"
                data-wow-delay="0s"
              >
                Vehicles ({vehicles.length})
              </span>
            </div>
            <div className="row">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.VehicleID}
                  className="col-lg-3 col-md-4 col-sm-6 col-12 mb-3"
                >
                  <Link
                    href={`/homes/home-search?q=${encodeURIComponent(
                      vehicle.Make + " " + vehicle.Model
                    )}`}
                    className="card h-100 text-decoration-none search-result-card"
                    style={{
                      borderRadius: "15px",
                      border: "2px solid #e9ecef",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--primary)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(204, 0, 0, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e9ecef";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.1)";
                    }}
                  >
                    <div className="card-body" style={{ padding: "1.5rem" }}>
                      <h5
                        className="card-title"
                        style={{ color: "#000", marginBottom: "0.5rem" }}
                      >
                        {vehicle.Make} {vehicle.Model}
                      </h5>
                      <p
                        className="text-muted small mb-0"
                        style={{ color: "var(--primary)", fontWeight: "500" }}
                      >
                        {vehicle.StartYear}-{vehicle.EndYear}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brands Section */}
        {brands.length > 0 && (
          <div className="mb-5">
            <div className="flat-title">
              <span
                className="title wow fadeInUp home-title"
                data-wow-delay="0s"
              >
                Brands ({brands.length})
              </span>
            </div>
            <div className="row">
              {brands.map((brand) => (
                <div
                  key={brand.ManID}
                  className="col-lg-3 col-md-4 col-sm-6 col-12 mb-3"
                >
                  <Link
                    href={`/homes/home-search?q=${encodeURIComponent(
                      brand.ManName
                    )}`}
                    className="card h-100 text-decoration-none"
                  >
                    <div className="card-body">
                      <h5 className="card-title">{brand.ManName}</h5>
                      <p className="text-muted small mb-0">Brand</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
