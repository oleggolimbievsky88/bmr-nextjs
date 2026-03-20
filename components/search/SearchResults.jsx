"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/shopCards/ProductCard";

export default function SearchResults({
  groupedResults = {},
  searchQuery = "",
}) {
  const { products = [], categories = [] } = groupedResults;

  const router = useRouter();
  const [colorsMap, setColorsMap] = useState({});
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [searchValue, setSearchValue] = useState(searchQuery || "");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

  useEffect(() => {
    setSearchValue(searchQuery || "");
    setActiveTab("all");
    setSortBy("relevance");
    setShowAllProducts(false);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchColors() {
      try {
        const res = await fetch("/api/colors");
        if (!res.ok) throw new Error("Failed to fetch colors");
        const data = await res.json();
        const map = Object.fromEntries(
          (data.colors || []).map((c) => [String(c.ColorID), c]),
        );
        setColorsMap(map);
      } catch (err) {
        setColorsMap({});
      }
    }
    fetchColors();
  }, []);

  const totalResultsFound = products.length + categories.length;

  const sortedProducts = useMemo(() => {
    const items = [...products];

    switch (sortBy) {
      case "price-low":
        return items.sort(
          (a, b) => Number(a?.Price || 0) - Number(b?.Price || 0),
        );
      case "price-high":
        return items.sort(
          (a, b) => Number(b?.Price || 0) - Number(a?.Price || 0),
        );
      case "name":
        return items.sort((a, b) =>
          String(a?.ProductName || "").localeCompare(
            String(b?.ProductName || ""),
          ),
        );
      default:
        return items;
    }
  }, [products, sortBy]);

  const PRODUCT_INITIAL_LIMIT = 12;
  const displayedProducts = showAllProducts
    ? sortedProducts
    : sortedProducts.slice(0, PRODUCT_INITIAL_LIMIT);
  const hasMoreProducts = sortedProducts.length > PRODUCT_INITIAL_LIMIT;

  const sanitizeSlug = (slug) => {
    if (!slug) return "";
    return slug
      .toLowerCase()
      .replace(/[""]/g, "")
      .replace(/['']/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const getCategoryPlatformLabel = (category) => {
    if (!category) return "Platform";

    const { PlatformStartYear, PlatformEndYear, PlatformName } = category;
    const cleanStart =
      PlatformStartYear && PlatformStartYear !== "0" ? PlatformStartYear : "";
    const cleanEnd =
      PlatformEndYear && PlatformEndYear !== "0" ? PlatformEndYear : "";

    let yearSegment = "";
    if (cleanStart && cleanEnd && cleanStart !== cleanEnd) {
      yearSegment = `${cleanStart} - ${cleanEnd}`;
    } else if (cleanStart && cleanEnd && cleanStart === cleanEnd) {
      yearSegment = cleanStart;
    } else if (cleanStart) {
      yearSegment = cleanStart;
    } else if (cleanEnd) {
      yearSegment = cleanEnd;
    }

    const label = [yearSegment, PlatformName].filter(Boolean).join(" ").trim();
    return label || "Platform";
  };

  const getCategoryUrl = (category) => {
    if (!category) return "/homes/home-search";

    const { PlatformSlug, MainCatSlug, CatSlug, CatName, BodyID } = category;

    if (PlatformSlug && MainCatSlug && (CatSlug || CatName)) {
      const categorySlug = CatSlug
        ? sanitizeSlug(CatSlug)
        : sanitizeSlug(CatName);
      return `/products/${PlatformSlug}/${MainCatSlug}/${categorySlug}`;
    }

    if (BodyID && CatName) {
      return `/homes/home-search?q=${encodeURIComponent(CatName)}`;
    }

    return "/homes/home-search";
  };

  const productCount = products.length;
  const categoryCount = categories.length;
  const queryText = (searchQuery || "").trim();

  const showProducts = activeTab === "all" || activeTab === "products";
  const showCategories = activeTab === "all" || activeTab === "categories";

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = (searchValue || "").trim();

    if (!q) {
      router.push("/homes/home-search");
      return;
    }

    router.push(`/homes/home-search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="search-results-page container-fluid px-4 px-xl-5 search-results-container">
      <div className="search-results-shell">
        <section className="search-results-hero" aria-label="Search results">
          <nav className="search-results-breadcrumb" aria-label="Breadcrumb">
            <div className="search-results-breadcrumb-list">
              <Link href="/" className="search-results-breadcrumb-link">
                Home
              </Link>
              <i
                className="icon icon-arrow-right search-results-breadcrumb-sep"
                aria-hidden="true"
              />
              <span
                className="search-results-breadcrumb-current"
                aria-current="page"
              >
                Search
              </span>
            </div>
          </nav>

          <div className="search-results-hero-inner">
            <div className="search-results-hero-kicker">Search Results</div>

            <h1 className="search-results-hero-title">
              {queryText ? (
                <>
                  Results for{" "}
                  <span className="search-results-hero-query">
                    &quot;{queryText}&quot;
                  </span>
                </>
              ) : (
                "Search Results"
              )}
            </h1>

            <div className="search-results-hero-meta">
              <div className="search-results-hero-meta-main">
                {totalResultsFound} result
                {totalResultsFound === 1 ? "" : "s"} found
              </div>
              <div className="search-results-hero-meta-breakdown">
                {productCount} products • {categoryCount} categories
              </div>
            </div>
          </div>
        </section>

        <div className="search-results-toolbar-wrap">
          <div className="search-results-toolbar">
            <form
              className="search-results-toolbar-search"
              onSubmit={handleSearchSubmit}
            >
              <div className="search-results-toolbar-search-field">
                <input
                  type="search"
                  name="q"
                  className="home-search-page-query-input"
                  placeholder="Search by part #, product, or category..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="search"
                  suppressHydrationWarning
                />
                <button
                  type="submit"
                  className="btn btn-danger search-results-toolbar-search-btn"
                >
                  <i
                    className="bi bi-search search-results-toolbar-search-btn-icon d-md-none"
                    aria-hidden="true"
                  />
                  <span className="search-results-toolbar-search-btn-text">
                    Search
                  </span>
                </button>
              </div>
            </form>

            <div className="search-results-toolbar-controls">
              <div
                className="search-results-chip-group"
                role="group"
                aria-label="Result filters"
              >
                <button
                  type="button"
                  className={
                    "search-results-chip" +
                    (activeTab === "all" ? " is-active" : "")
                  }
                  onClick={() => setActiveTab("all")}
                >
                  All
                </button>

                <button
                  type="button"
                  className={
                    "search-results-chip" +
                    (activeTab === "products" ? " is-active" : "")
                  }
                  onClick={() => setActiveTab("products")}
                >
                  Products
                </button>

                <button
                  type="button"
                  className={
                    "search-results-chip" +
                    (activeTab === "categories" ? " is-active" : "")
                  }
                  onClick={() => setActiveTab("categories")}
                >
                  Categories
                </button>
              </div>

              <div className="search-results-sort">
                <label
                  className="search-results-sort-label"
                  htmlFor="searchSort"
                >
                  Sort
                </label>
                <select
                  id="searchSort"
                  className="form-select search-results-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  autoComplete="off"
                  suppressHydrationWarning
                >
                  <option value="relevance">Best match</option>
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="search-results-content">
          {totalResultsFound === 0 ? (
            <div className="search-results-empty">
              <div className="search-results-empty-icon">
                <i className="bi bi-search" aria-hidden="true" />
              </div>
              <h2 className="search-results-empty-title">No results found</h2>
              <p className="search-results-empty-text">
                Try another part number, product name, or category.
              </p>
            </div>
          ) : (
            <>
              {showProducts && productCount > 0 && (
                <section className="search-results-section search-results-products-section">
                  <div className="search-results-section-header">
                    <div>
                      <div className="search-results-section-eyebrow">
                        Products
                      </div>
                      <h2 className="search-results-section-title">
                        {productCount} matching item
                        {productCount === 1 ? "" : "s"}
                      </h2>
                    </div>
                  </div>

                  <div className="row g-3 g-lg-4 search-results-products-row">
                    {displayedProducts.map((product) => (
                      <div
                        key={product.ProductID}
                        className="col-12 col-sm-6 col-lg-4 col-xl-3"
                      >
                        <div className="search-results-product-card-wrap h-100">
                          <ProductCard
                            product={product}
                            colorsMap={colorsMap}
                            cardClassName="search-result-product-card"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {hasMoreProducts && !showAllProducts && (
                    <div className="search-results-view-more">
                      <button
                        type="button"
                        onClick={() => setShowAllProducts(true)}
                        className="view-more-btn"
                      >
                        View more
                        <i
                          className="icon icon-arrow-down"
                          style={{ fontSize: "18px" }}
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  )}
                </section>
              )}

              {showCategories && categoryCount > 0 && (
                <section className="search-results-section search-results-categories-section">
                  <div className="search-results-section-header">
                    <div>
                      <div className="search-results-section-eyebrow">
                        Related categories
                      </div>
                      <h2 className="search-results-section-title">
                        {categoryCount} suggestion
                        {categoryCount === 1 ? "" : "s"}
                      </h2>
                    </div>
                  </div>

                  <div className="search-results-categories-grid">
                    {categories.map((category) => (
                      <Link
                        key={category.CatID}
                        href={getCategoryUrl(category)}
                        className="search-category-suggestion-card"
                      >
                        <div className="search-category-suggestion-icon">
                          <i
                            className="bi bi-grid-3x3-gap-fill"
                            aria-hidden="true"
                          />
                        </div>

                        <div className="search-category-suggestion-body">
                          <div className="search-category-suggestion-title">
                            {category.CatName}
                          </div>
                          <div className="search-category-suggestion-sub">
                            {getCategoryPlatformLabel(category)}
                          </div>
                        </div>

                        <i
                          className="bi bi-arrow-right search-category-suggestion-arrow"
                          aria-hidden="true"
                        />
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
