"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProductImageUrl } from "@/lib/assets";

export default function SearchModal() {
  const [query, setQuery] = useState("");
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
  const [quickLinks, setQuickLinks] = useState([]);
  const [quickLinksLoading, setQuickLinksLoading] = useState(true);
  const [newProducts, setNewProducts] = useState([]);
  const [newProductsLoading, setNewProductsLoading] = useState(true);
  const debounceTimerRef = useRef(null);
  const containerRef = useRef(null);
  const router = useRouter();

  // Quick links point to category landing pages (all vehicles), not a single vehicle
  useEffect(() => {
    const links = [
      { name: "Ford", href: "/products/ford" },
      { name: "GM Late Model", href: "/products/gm/late-model" },
      { name: "GM Mid Muscle", href: "/products/gm/mid-muscle" },
      { name: "GM Classic Muscle", href: "/products/gm/classic-muscle" },
      { name: "Mopar", href: "/products/mopar" },
    ];
    setQuickLinks(links);
    setQuickLinksLoading(false);
  }, []);

  // Fetch new products
  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        const response = await fetch(
          "/api/products/new-products?scrachDent=0&limit=8"
        );
        if (!response.ok) throw new Error("Failed to fetch new products");
        const data = await response.json();
        setNewProducts(data || []);
      } catch (err) {
        console.error("Error fetching new products:", err);
        setNewProducts([]);
      } finally {
        setNewProductsLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

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

  const closeModal = () => {
    setShowSuggestions(false);
    // Close the search modal using Bootstrap Offcanvas instance
    try {
      const bootstrap = require("bootstrap");
      const offcanvasElement = document.getElementById("canvasSearch");
      if (offcanvasElement) {
        const offcanvasInstance =
          bootstrap.Offcanvas.getInstance(offcanvasElement);
        if (offcanvasInstance) {
          offcanvasInstance.hide();
        } else {
          // Fallback: create new instance and hide
          const newInstance = new bootstrap.Offcanvas(offcanvasElement);
          newInstance.hide();
        }
      }
    } catch (error) {
      console.error("Error closing search modal:", error);
      // Fallback: direct DOM manipulation
      const offcanvasElement = document.getElementById("canvasSearch");
      if (offcanvasElement) {
        offcanvasElement.classList.remove("show");
        offcanvasElement.setAttribute("aria-hidden", "true");
        offcanvasElement.removeAttribute("aria-modal");
        offcanvasElement.removeAttribute("role");
        offcanvasElement.style.visibility = "hidden";

        // Remove backdrop
        const backdrop = document.querySelector(".offcanvas-backdrop");
        if (backdrop) {
          backdrop.remove();
        }

        // Remove body class
        document.body.classList.remove("offcanvas-backdrop");
      }
    }
  };

  const handleSearch = async (searchQuery = query) => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      params.set("q", searchQuery.trim());
      router.push(`/homes/home-search?${params.toString()}`);
      closeModal();
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
    if (query.trim()) {
      handleSearch();
    }
    return false;
  };

  const handleSuggestionClick = (item, type) => {
    // product: go to product page
    if (type === "product" && item?.ProductID) {
      closeModal();
      // Small delay to ensure modal closes before navigation
      setTimeout(() => {
        router.push(`/product/${item.ProductID}`);
      }, 150);
      return;
    }

    // platform: navigate to platform page
    if (type === "platform" && item?.slug) {
      closeModal();
      setTimeout(() => {
        router.push(`/products/${item.slug}`);
      }, 150);
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
        closeModal();
        setTimeout(() => {
          router.push(
            `/products/${item.PlatformSlug}/${item.MainCatSlug}/${categorySlug}`
          );
        }, 150);
      } else {
        setQuery(item.CatName);
        handleSearch(item.CatName);
      }
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

  const getProductImage = (product) => {
    if (product.ImageSmall && product.ImageSmall !== "0") {
      return getProductImageUrl(product.ImageSmall);
    }
    if (product.ImageLarge && product.ImageLarge !== "0") {
      return getProductImageUrl(product.ImageLarge);
    }
    return "/images/placeholder-product.jpg";
  };

  const formatPlatform = (product) => {
    // PlatformName already includes years from the query
    if (product.PlatformName) {
      return product.PlatformName;
    }
    // Fallback: use YearRange if PlatformName not available
    if (product.YearRange) {
      return product.YearRange;
    }
    return "";
  };

  return (
    <div className="offcanvas offcanvas-end canvas-search" id="canvasSearch">
      <div className="canvas-wrapper" ref={containerRef}>
        <header className="tf-search-head search-header-white">
          <div className="title fw-5">
            Search our site
            <div className="close" onClick={closeModal}>
              <span
                className="icon-close icon-close-popup"
                aria-label="Close"
              />
            </div>
          </div>
          <div className="tf-search-sticky">
            <form onSubmit={handleFormSubmit} className="tf-mini-search-frm">
              <fieldset className="text">
                <input
                  type="text"
                  placeholder="Search"
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (
                      Object.values(grouped).some(
                        (arr) => arr && arr.length > 0
                      )
                    ) {
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
                  type="submit"
                  aria-label="Search"
                  onClick={(e) => {
                    // Prevent any unintended behavior
                    e.stopPropagation();
                  }}
                >
                  <i className="icon-search" />
                </button>
              </fieldset>
            </form>
            {showSuggestions &&
              Object.values(grouped).some((arr) => arr && arr.length > 0) && (
                <div className="mobile-search-suggestions">
                  {grouped.platforms?.length ? (
                    <div className="suggestion-group">
                      <div className="suggestion-group-header">
                        <i className="icon icon-car"></i> Platforms
                      </div>
                      {grouped.platforms.map((platform, idx) => (
                        <div
                          key={`platform-${platform.BodyID || idx}`}
                          className={`suggestion-item ${
                            selectedIndex === idx ? "selected" : ""
                          }`}
                          onClick={() =>
                            handleSuggestionClick(platform, "platform")
                          }
                        >
                          <div className="fw-bold">{platform.Name}</div>
                          {platform.StartYear && platform.EndYear && (
                            <div className="text-muted small">
                              {platform.StartYear}-{platform.EndYear}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {grouped.products?.length ? (
                    <div className="suggestion-group">
                      <div className="suggestion-group-header">
                        <i className="icon icon-bag"></i> Products
                      </div>
                      {grouped.products.map((p, idx) => {
                        const itemIndex =
                          (grouped.platforms?.length || 0) + idx;
                        const price = parseFloat(p.Price) || 0;
                        return (
                          <div
                            key={`p-${p.ProductID || idx}`}
                            className={`suggestion-item ${
                              selectedIndex === itemIndex ? "selected" : ""
                            }`}
                            onClick={() => handleSuggestionClick(p, "product")}
                          >
                            <div className="fw-bold">{p.ProductName}</div>
                            <div className="text-muted small">
                              Part #: {p.PartNumber}
                            </div>
                            {price > 0 && (
                              <div className="small">${price.toFixed(2)}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
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
                        return (
                          <div
                            key={`c-${c.CatID || idx}`}
                            className={`suggestion-item ${
                              selectedIndex === itemIndex ? "selected" : ""
                            }`}
                            onClick={() => handleSuggestionClick(c, "category")}
                          >
                            <div className="fw-bold">{c.CatName}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              )}
          </div>
        </header>
        <div className="canvas-body p-0">
          <div className="tf-search-content">
            <div className="tf-cart-hide-has-results">
              <div className="tf-col-quicklink">
                <div className="tf-quicklink-header">
                  <div className="tf-quicklink-header-content">
                    <i className="icon icon-link"></i>
                    <h3 className="tf-quicklink-title">Quick Links</h3>
                  </div>
                  <div className="tf-quicklink-divider"></div>
                </div>
                <ul className="tf-quicklink-list">
                  {quickLinksLoading ? (
                    <li className="tf-quicklink-item">
                      <span className="tf-quicklink-loading">Loading...</span>
                    </li>
                  ) : (
                    quickLinks.map((link, index) => (
                      <li key={index} className="tf-quicklink-item">
                        <Link
                          href={link.href}
                          className="tf-quicklink-button"
                          onClick={() => {
                            closeModal();
                          }}
                        >
                          <span className="tf-quicklink-text">{link.name}</span>
                          <i className="icon icon-arrow-right tf-quicklink-arrow"></i>
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div className="tf-col-content">
                <div className="tf-inspiration-header">
                  <div className="tf-inspiration-header-content">
                    <i className="icon icon-star"></i>
                    <h3 className="tf-inspiration-title">
                      Need some inspiration?
                    </h3>
                  </div>
                  <div className="tf-inspiration-divider"></div>
                </div>
                <div className="tf-search-hidden-inner">
                  {newProductsLoading ? (
                    <div>Loading...</div>
                  ) : newProducts.length === 0 ? (
                    <div className="text-muted">No products available</div>
                  ) : (
                    newProducts.map((product, index) => {
                      const price = parseFloat(product.Price) || 0;
                      const platform = formatPlatform(product);
                      return (
                        <div
                          className="tf-loop-item"
                          key={product.ProductID || index}
                        >
                          <div className="tf-loop-item-header">
                            <Link
                              href={`/product/${product.ProductID}`}
                              className="tf-loop-item-title"
                              onClick={() => {
                                closeModal();
                              }}
                            >
                              {product.ProductName}
                            </Link>
                          </div>
                          <div className="tf-loop-item-body">
                            <div className="image">
                              <Link
                                href={`/product/${product.ProductID}`}
                                onClick={() => {
                                  closeModal();
                                }}
                              >
                                <Image
                                  alt={product.ProductName || "Product"}
                                  src={getProductImage(product)}
                                  width={150}
                                  height={150}
                                  style={{ objectFit: "contain" }}
                                />
                              </Link>
                            </div>
                            <div className="content">
                              {product.PartNumber && (
                                <div
                                  className="small text-muted"
                                  style={{ marginTop: "0" }}
                                >
                                  Part #: {product.PartNumber}
                                </div>
                              )}
                              {platform && (
                                <div
                                  className="small"
                                  style={{
                                    color: "#cc0000",
                                    fontWeight: "600",
                                    marginTop: "6px",
                                  }}
                                >
                                  {platform}
                                </div>
                              )}
                              {price > 0 && (
                                <div
                                  className="tf-product-info-price"
                                  style={{ marginTop: "10px" }}
                                >
                                  <div className="price fw-6">
                                    ${price.toFixed(2)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
