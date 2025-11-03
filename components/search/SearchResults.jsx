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
    platforms = [],
    vehicles = [],
    brands = [],
    pages = [],
  } = groupedResults;

  const [colorsMap, setColorsMap] = useState({});

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

  const totalResults =
    products.length +
    categories.length +
    platforms.length +
    vehicles.length +
    brands.length +
    pages.length;

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
                Products ({products.length})
              </span>
            </div>
            <div className="grid-layout wrapper-shop" data-grid="grid-4">
              {products.map((product) => (
                <ProductCard
                  key={product.ProductID}
                  product={product}
                  colorsMap={colorsMap}
                />
              ))}
            </div>
          </div>
        )}

        {/* Categories Section */}
        {categories.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-4">
              Categories{" "}
              <span className="text-muted">({categories.length})</span>
            </h3>
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
                    className="card h-100 text-decoration-none"
                  >
                    <div className="card-body">
                      <h5 className="card-title">{category.CatName}</h5>
                      <p className="text-muted small mb-0">Category</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platforms Section */}
        {platforms.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-4">
              Platforms <span className="text-muted">({platforms.length})</span>
            </h3>
            <div className="row">
              {platforms.map((platform) => (
                <div
                  key={platform.BodyID}
                  className="col-lg-3 col-md-4 col-sm-6 col-12 mb-3"
                >
                  <Link
                    href={`/products/${
                      platform.slug ||
                      platform.Name.toLowerCase().replace(/\s+/g, "-")
                    }`}
                    className="card h-100 text-decoration-none"
                  >
                    <div className="card-body">
                      <h5 className="card-title">{platform.Name}</h5>
                      <p className="text-muted small mb-0">
                        {platform.StartYear}-{platform.EndYear}
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
            <h3 className="mb-4">
              Vehicles <span className="text-muted">({vehicles.length})</span>
            </h3>
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
                    className="card h-100 text-decoration-none"
                  >
                    <div className="card-body">
                      <h5 className="card-title">
                        {vehicle.Make} {vehicle.Model}
                      </h5>
                      <p className="text-muted small mb-0">
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
            <h3 className="mb-4">
              Brands <span className="text-muted">({brands.length})</span>
            </h3>
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

        {/* Pages Section */}
        {pages.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-4">
              Pages <span className="text-muted">({pages.length})</span>
            </h3>
            <div className="row">
              {pages.map((page) => (
                <div
                  key={page.MetaTagID}
                  className="col-lg-3 col-md-4 col-sm-6 col-12 mb-3"
                >
                  <Link
                    href={
                      page.Page && page.Page !== "0"
                        ? page.Page.startsWith("/")
                          ? page.Page
                          : `/${page.Page}`
                        : "#"
                    }
                    className="card h-100 text-decoration-none"
                  >
                    <div className="card-body">
                      <h5 className="card-title">{page.Title}</h5>
                      <p className="text-muted small mb-0">{page.Page}</p>
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
