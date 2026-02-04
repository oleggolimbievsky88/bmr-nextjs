"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function SearchInput({ initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [grouped, setGrouped] = useState({
    products: [],
    categories: [],
    vehicles: [],
    brands: [],
    platforms: [],
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const router = useRouter();

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

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Click outside handler to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showSuggestions]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSuggestions) return;

      const allItems = [
        ...(grouped.products || []),
        ...(grouped.platforms || []),
        ...(grouped.categories || []),
        ...(grouped.vehicles || []),
        ...(grouped.brands || []),
      ];

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < allItems.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        const selectedItem = allItems[selectedIndex];
        // Determine type based on which array it came from
        let type = "product";
        if (grouped.platforms?.includes(selectedItem)) type = "platform";
        else if (grouped.categories?.includes(selectedItem)) type = "category";
        else if (grouped.vehicles?.includes(selectedItem)) type = "vehicle";
        else if (grouped.brands?.includes(selectedItem)) type = "brand";
        handleSuggestionClick(selectedItem, type);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSuggestions, selectedIndex, grouped]);

  const handleSearch = async (searchQuery = query) => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      params.set("q", searchQuery.trim());
      router.push(`/homes/home-search?${params.toString()}`);
      setShowSuggestions(false);
    }
  };

  // Debounced search function
  const fetchSuggestions = useCallback(async (searchValue) => {
    if (!searchValue || searchValue.trim().length < 2) {
      setGrouped({
        products: [],
        categories: [],
        vehicles: [],
        brands: [],
        platforms: [],
      });
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchValue.trim())}`
      );
      const data = await results.json();
      setGrouped(
        data || {
          products: [],
          categories: [],
          vehicles: [],
          brands: [],
          platforms: [],
        }
      );
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setGrouped({
        products: [],
        categories: [],
        vehicles: [],
        brands: [],
        platforms: [],
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce API calls - wait 300ms after user stops typing
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
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

    // platform: navigate to platform page
    if (type === "platform" && item?.slug) {
      router.push(`/products/${item.slug}`);
      setShowSuggestions(false);
      return;
    }

    // category: navigate to category page if we have the URL components
    if (type === "category" && item?.CatName) {
      if (
        item.PlatformSlug &&
        item.MainCatSlug &&
        (item.CatSlug || item.CatName)
      ) {
        const categorySlug =
          item.CatSlug || item.CatName.toLowerCase().replace(/\s+/g, "-");
        router.push(
          `/products/${item.PlatformSlug}/${item.MainCatSlug}/${categorySlug}`
        );
      } else {
        setQuery(item.CatName);
        handleSearch(item.CatName);
      }
      setShowSuggestions(false);
      return;
    }

    // vehicle: search with vehicle info
    if (type === "vehicle") {
      const vehicleQuery = `${item.Make} ${item.Model}`;
      setQuery(vehicleQuery);
      handleSearch(vehicleQuery);
      setShowSuggestions(false);
      return;
    }

    // brand: search by brand name
    if (type === "brand" && item?.ManName) {
      setQuery(item.ManName);
      handleSearch(item.ManName);
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
    setShowSuggestions(false);
  };

  return (
    <div className="search-input-container" ref={containerRef}>
      <form onSubmit={handleFormSubmit} className="search-input-wrapper">
        <div className="search-input-inner">
          <input
            ref={inputRef}
            type="text"
            className="form-control search-input-field"
            placeholder="Search by part #, product name, year & vehicle (e.g. 2015 Mustang)"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (Object.values(grouped).some((arr) => arr && arr.length > 0)) {
                setShowSuggestions(true);
              } else if (query.trim().length >= 2) {
                fetchSuggestions(query);
              }
            }}
            autoComplete="off"
            suppressHydrationWarning
          />
          {isLoading && (
            <div className="search-loading-indicator">
              <i className="icon icon-spinner icon-spin"></i>
            </div>
          )}
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
          <div className="search-suggestions modern-autocomplete">
            {/* Platforms - Show first if available */}
            {grouped.platforms?.length ? (
              <div className="suggestion-group">
                <div className="suggestion-group-header">
                  <i className="icon icon-car"></i> Platforms
                </div>
                {grouped.platforms.map((platform, idx) => {
                  const itemIndex = idx;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <div
                      key={`platform-${platform.BodyID}`}
                      className={`suggestion-item ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSuggestionClick(platform, "platform");
                      }}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                    >
                      <div className="suggestion-content">
                        <div className="fw-bold">{platform.Name}</div>
                        {platform.StartYear && platform.EndYear && (
                          <div className="text-muted small">
                            {platform.StartYear}-{platform.EndYear}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Products - Left-aligned like Categories */}
            {grouped.products?.length ? (
              <div className="suggestion-group">
                <div className="suggestion-group-header">
                  <i className="icon icon-bag"></i> Products
                </div>
                {grouped.products.map((p, idx) => {
                  const itemIndex = (grouped.platforms?.length || 0) + idx;
                  const isSelected = selectedIndex === itemIndex;
                  const price = parseFloat(p.Price) || 0;

                  // Build platform with years string
                  let platformWithYears = "";
                  if (p.PlatformName) {
                    const years = [];
                    if (p.PlatformStartYear && p.PlatformStartYear !== "0") {
                      years.push(p.PlatformStartYear);
                    }
                    if (p.PlatformEndYear && p.PlatformEndYear !== "0") {
                      years.push(p.PlatformEndYear);
                    }
                    if (years.length > 0) {
                      platformWithYears = `${years.join("-")} ${
                        p.PlatformName
                      }`;
                    } else {
                      platformWithYears = p.PlatformName;
                    }
                  }

                  return (
                    <div
                      key={`p-${p.ProductID}`}
                      className={`suggestion-item product-item ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSuggestionClick(p, "product");
                      }}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                    >
                      <div className="suggestion-content">
                        <div className="fw-bold suggestion-title">
                          {p.ProductName}
                        </div>
                        <div className="text-muted small suggestion-part">
                          Part #: {p.PartNumber}
                        </div>
                        {platformWithYears && (
                          <div className="small suggestion-platform">
                            {platformWithYears}
                          </div>
                        )}
                        {price > 0 && (
                          <div className="suggestion-price">
                            ${price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Categories */}
            {grouped.categories?.length ? (
              <div className="suggestion-group">
                <div className="suggestion-group-header">
                  <i className="icon icon-grid"></i> Categories
                </div>
                {grouped.categories.map((c, idx) => {
                  const itemIndex =
                    (grouped.platforms?.length || 0) +
                    (grouped.products?.length || 0) +
                    idx;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <div
                      key={`c-${c.CatID}`}
                      className={`suggestion-item ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSuggestionClick(c, "category");
                      }}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                    >
                      <div className="suggestion-content">
                        <div className="fw-bold">{c.CatName}</div>
                        <div
                          className="small"
                          style={{ color: "#cc0000", fontWeight: "600" }}
                        >
                          {getCategoryPlatformLabel(c)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Vehicles */}
            {grouped.vehicles?.length ? (
              <div className="suggestion-group">
                <div className="suggestion-group-header">
                  <i className="icon icon-car"></i> Vehicles
                </div>
                {grouped.vehicles.map((v, idx) => {
                  const itemIndex =
                    (grouped.platforms?.length || 0) +
                    (grouped.products?.length || 0) +
                    (grouped.categories?.length || 0) +
                    idx;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <div
                      key={`v-${v.VehicleID}`}
                      className={`suggestion-item ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSuggestionClick(v, "vehicle");
                      }}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                    >
                      <div className="suggestion-content">
                        <div className="fw-bold">
                          {v.Make} {v.Model}
                        </div>
                        <div className="text-muted small">
                          {v.StartYear}-{v.EndYear}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Brands */}
            {grouped.brands?.length ? (
              <div className="suggestion-group">
                <div className="suggestion-group-header">
                  <i className="icon icon-tag"></i> Brands
                </div>
                {grouped.brands.map((m, idx) => {
                  const itemIndex =
                    (grouped.platforms?.length || 0) +
                    (grouped.products?.length || 0) +
                    (grouped.categories?.length || 0) +
                    (grouped.vehicles?.length || 0) +
                    idx;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <div
                      key={`m-${m.ManID}`}
                      className={`suggestion-item ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSuggestionClick(m, "brand");
                      }}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                    >
                      <div className="suggestion-content">
                        <div className="fw-bold">{m.ManName}</div>
                        <div className="text-muted small">Brand</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        )}
    </div>
  );
}
