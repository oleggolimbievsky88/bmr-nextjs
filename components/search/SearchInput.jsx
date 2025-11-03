"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchInput({ initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [grouped, setGrouped] = useState({
    products: [],
    categories: [],
    platforms: [],
    vehicles: [],
    brands: [],
    pages: [],
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Click outside handler to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    }

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showSuggestions]);

  const handleSearch = async (searchQuery = query) => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams(searchParams);
      params.set("q", searchQuery.trim());
      router.push(`/homes/home-search?${params.toString()}`);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length > 2) {
      try {
        const results = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(value)}`
        );
        const data = await results.json();
        setGrouped(data || {});
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setGrouped({
          products: [],
          categories: [],
          platforms: [],
          vehicles: [],
          brands: [],
          pages: [],
        });
      }
    } else {
      setGrouped({
        products: [],
        categories: [],
        platforms: [],
        vehicles: [],
        brands: [],
        pages: [],
      });
      setShowSuggestions(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Form submitted with query:", query);
    if (query.trim()) {
      handleSearch();
    }
    return false;
  };

  const handleSuggestionClick = (item, type) => {
    // product: go to product page
    if (type === "product" && item?.ProductID) {
      router.push(`/product/${item.ProductID}`);
      setShowSuggestions(false);
      return;
    }

    // platform: navigate to platform page using slug
    if (type === "platform" && item?.slug) {
      router.push(`/products/${item.slug}`);
      setShowSuggestions(false);
      return;
    }

    // category: search with category filter (will need to get platform/mainCategory from context later)
    if (type === "category" && item?.CatName) {
      // For now, search by category name - can enhance later to navigate directly
      setQuery(item.CatName);
      handleSearch(item.CatName);
      return;
    }

    // vehicle: search with vehicle info
    if (type === "vehicle") {
      const vehicleQuery = `${item.Make} ${item.Model}`;
      setQuery(vehicleQuery);
      handleSearch(vehicleQuery);
      return;
    }

    // brand: search by brand name
    if (type === "brand" && item?.ManName) {
      setQuery(item.ManName);
      handleSearch(item.ManName);
      return;
    }

    // page: could navigate directly if Page looks like a route
    if (type === "page" && item?.Page && item.Page !== "0") {
      const path = item.Page.startsWith("/") ? item.Page : `/${item.Page}`;
      router.push(path);
      setShowSuggestions(false);
      return;
    }

    // fallback: search by label/name
    const text =
      item?.ProductName ||
      item?.PartNumber ||
      item?.CatName ||
      item?.Name ||
      item?.ManName ||
      item?.Title ||
      query;
    setQuery(text);
    handleSearch(text);
  };

  return (
    <div className="search-input-container" ref={containerRef}>
      <form onSubmit={handleFormSubmit} className="search-input-wrapper">
        <div className="search-input-inner">
          <input
            type="text"
            className="form-control search-input-field"
            placeholder="Search by part # or keyword"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (Object.values(grouped).some((arr) => arr && arr.length > 0)) {
                setShowSuggestions(true);
              }
            }}
            autoComplete="on"
          />
          <button
            className="search-btn-inside"
            type="submit"
            aria-label="Search"
          >
            <i className="icon icon-search"></i>
          </button>
        </div>
      </form>

      {showSuggestions &&
        Object.values(grouped).some((arr) => arr && arr.length > 0) && (
          <div className="search-suggestions">
            {/* Products */}
            {grouped.products?.length ? (
              <div>
                <div className="px-3 py-2 text-uppercase small text-muted">
                  Products
                </div>
                {grouped.products.map((p) => (
                  <div
                    key={`p-${p.ProductID}`}
                    className="suggestion-item"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSuggestionClick(p, "product");
                    }}
                    style={{ cursor: "pointer", pointerEvents: "auto" }}
                  >
                    <div className="fw-bold">{p.ProductName}</div>
                    <div className="text-muted small">
                      Part #: {p.PartNumber}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Categories */}
            {grouped.categories?.length ? (
              <div>
                <div className="px-3 py-2 text-uppercase small text-muted">
                  Categories
                </div>
                {grouped.categories.map((c) => (
                  <div
                    key={`c-${c.CatID}`}
                    className="suggestion-item"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSuggestionClick(c, "category");
                    }}
                  >
                    <div className="fw-bold">{c.CatName}</div>
                    <div className="text-muted small">Sub-category</div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Platforms */}
            {grouped.platforms?.length ? (
              <div>
                <div className="px-3 py-2 text-uppercase small text-muted">
                  Platforms
                </div>
                {grouped.platforms.map((b) => (
                  <div
                    key={`b-${b.BodyID}`}
                    className="suggestion-item"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSuggestionClick(b, "platform");
                    }}
                  >
                    <div className="fw-bold">{b.Name}</div>
                    <div className="text-muted small">
                      {b.StartYear}-{b.EndYear}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Vehicles */}
            {grouped.vehicles?.length ? (
              <div>
                <div className="px-3 py-2 text-uppercase small text-muted">
                  Vehicles
                </div>
                {grouped.vehicles.map((v) => (
                  <div
                    key={`v-${v.VehicleID}`}
                    className="suggestion-item"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSuggestionClick(v, "vehicle");
                    }}
                  >
                    <div className="fw-bold">
                      {v.Make} {v.Model}
                    </div>
                    <div className="text-muted small">
                      {v.StartYear}-{v.EndYear}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Brands */}
            {grouped.brands?.length ? (
              <div>
                <div className="px-3 py-2 text-uppercase small text-muted">
                  Brands
                </div>
                {grouped.brands.map((m) => (
                  <div
                    key={`m-${m.ManID}`}
                    className="suggestion-item"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSuggestionClick(m, "brand");
                    }}
                  >
                    <div className="fw-bold">{m.ManName}</div>
                    <div className="text-muted small">Brand</div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Pages */}
            {grouped.pages?.length ? (
              <div>
                <div className="px-3 py-2 text-uppercase small text-muted">
                  Pages
                </div>
                {grouped.pages.map((pg) => (
                  <div
                    key={`pg-${pg.MetaTagID}`}
                    className="suggestion-item"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSuggestionClick(pg, "page");
                    }}
                  >
                    <div className="fw-bold">{pg.Title}</div>
                    <div className="text-muted small">{pg.Page}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
    </div>
  );
}
