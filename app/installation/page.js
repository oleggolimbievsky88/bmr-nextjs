"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar4 from "@/components/header/Topbar4";
import Header18 from "@/components/header/Header18";
import Image from "next/image";
import Link from "next/link";
import { getInstallUrl } from "@/lib/assets";

export default function InstallationPage() {
  const router = useRouter();
  const [partNumber, setPartNumber] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState(null); // 'partNumber' or 'platform'

  // Fetch platforms on mount
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const res = await fetch("/api/platforms-list");
        if (res.ok) {
          const data = await res.json();
          // Filter out platforms that don't start with years (exclude '0', empty, or non-numeric years)
          const filteredPlatforms = (data.platforms || []).filter(
            (platform) => {
              const startYear = platform.startYear || platform.StartYear;
              // Only include platforms with valid start years (numeric and not '0')
              return (
                startYear &&
                startYear !== "0" &&
                startYear !== "" &&
                !isNaN(parseInt(startYear))
              );
            },
          );
          setPlatforms(filteredPlatforms);
        }
      } catch (error) {
        console.error("Error fetching platforms:", error);
      }
    };
    fetchPlatforms();
  }, []);

  // Fetch categories when platform is selected
  useEffect(() => {
    if (selectedPlatform) {
      const fetchCategories = async () => {
        try {
          const res = await fetch(
            `/api/installation/categories?platform=${selectedPlatform}`,
          );
          if (res.ok) {
            const data = await res.json();
            setCategories(data.categories || []);
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      };
      fetchCategories();
      setSelectedCategory(""); // Reset category when platform changes
    } else {
      setCategories([]);
      setSelectedCategory("");
    }
  }, [selectedPlatform]);

  // Handle part number search
  const handlePartNumberSearch = async (e) => {
    e.preventDefault();
    if (!partNumber.trim()) return;

    setLoading(true);
    setSelectedPlatform(""); // Clear platform selection when searching by part number
    setSelectedCategory(""); // Clear category selection
    try {
      const res = await fetch(
        `/api/installation/search?partNumber=${encodeURIComponent(partNumber.trim())}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          setSearchType("partNumber");
        } else {
          setProducts([]);
          setSearchType(null);
        }
      } else {
        setProducts([]);
        setSearchType(null);
      }
    } catch (error) {
      console.error("Error searching for part number:", error);
      setProducts([]);
      setSearchType(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle platform/category search
  const handlePlatformCategorySearch = async () => {
    if (!selectedPlatform) {
      setProducts([]);
      setSearchType(null);
      setPartNumber(""); // Clear part number when searching by platform
      return;
    }

    setLoading(true);
    setPartNumber(""); // Clear part number when searching by platform
    try {
      const res = await fetch(
        `/api/installation/products?platform=${selectedPlatform}${selectedCategory ? `&category=${selectedCategory}` : ""}`,
      );
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setSearchType("platform");
      } else {
        setProducts([]);
        setSearchType(null);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setSearchType(null);
    } finally {
      setLoading(false);
    }
  };

  // Update products list when platform or category changes
  useEffect(() => {
    handlePlatformCategorySearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatform, selectedCategory]);

  return (
    <div>
      <Topbar4 />
      <Header18 showVehicleSearch={false} />

      {/* Hero Section */}
      <section className="installation-hero">
        <div className="installation-hero-bg">
          <div className="installation-hero-overlay"></div>
          <div className="installation-hero-content">
            <div className="container">
              <h1 className="installation-hero-title">
                INSTALLATION
                <br />
                INSTRUCTIONS
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="installation-content-wrapper">
        <div className="container py-5">
          <div className="row">
            <div className="col-12">
              <h2 className="installation-main-heading text-center">
                NEED INSTALL INSTRUCTIONS AND PICS? WE GOT YOU COVERED!
              </h2>
            </div>
          </div>

          <div className="row mb-5">
            {/* Search by Part Number */}
            <div className="col-md-6 mb-4">
              <div className="installation-search-section">
                <h3 className="installation-section-title">
                  Search by Part Number:
                </h3>
                <form onSubmit={handlePartNumberSearch} className="mt-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type here..."
                      value={partNumber}
                      onChange={(e) => setPartNumber(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      className="btn btn-danger"
                      disabled={loading || !partNumber.trim()}
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Search by Platform */}
            <div className="col-md-6 mb-4">
              <div className="installation-search-section">
                <h3 className="installation-section-title">
                  Search by Platform:
                </h3>
                <div className="row mt-3">
                  <div className="col-md-6 mb-2">
                    <select
                      className="form-select"
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Search Platforms...</option>
                      {platforms.map((platform) => (
                        <option
                          key={platform.id || platform.BodyID}
                          value={platform.id || platform.BodyID}
                        >
                          {platform.startYear &&
                          platform.startYear !== "0" &&
                          platform.endYear &&
                          platform.endYear !== "0"
                            ? `${platform.startYear}-${platform.endYear} ${platform.name || platform.Name}`
                            : platform.name || platform.Name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-2">
                    <select
                      className="form-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      disabled={
                        loading || !selectedPlatform || categories.length === 0
                      }
                    >
                      <option value="">Search Categories...</option>
                      {categories.map((category) => (
                        <option
                          key={category.id || category.CatID}
                          value={category.id || category.CatID}
                        >
                          {category.name || category.CatName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products List */}
          {products.length > 0 && (
            <div className="row mb-5">
              <div className="col-12">
                <div className="installation-products-list">
                  <h3 className="installation-list-title mb-4">
                    Installation Instructions Available ({products.length})
                    {searchType === "partNumber" && partNumber && (
                      <span className="text-muted"> for "{partNumber}"</span>
                    )}
                  </h3>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Part Number</th>
                          <th>Product Name</th>
                          <th>Platform</th>
                          <th>Categories</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.ProductID}>
                            <td>
                              <strong>{product.PartNumber}</strong>
                            </td>
                            <td>{product.ProductName}</td>
                            <td>
                              {(() => {
                                // First try to use PlatformName from API (already formatted)
                                if (product.PlatformName) {
                                  return product.PlatformName;
                                }

                                // If not available, try to find from platforms array
                                if (selectedPlatform) {
                                  const platform = platforms.find(
                                    (p) =>
                                      (p.id || p.BodyID) == selectedPlatform,
                                  );
                                  if (platform) {
                                    const yearPart =
                                      platform.startYear &&
                                      platform.startYear !== "0" &&
                                      platform.endYear &&
                                      platform.endYear !== "0"
                                        ? `${platform.startYear}-${platform.endYear} `
                                        : "";
                                    return `${yearPart}${platform.name || platform.Name}`;
                                  }
                                }

                                // If we have years but no name, try to construct from product data
                                if (
                                  product.PlatformStartYear &&
                                  product.PlatformEndYear &&
                                  product.PlatformStartYear !== "0" &&
                                  product.PlatformEndYear !== "0"
                                ) {
                                  // Try to find platform by BodyID from product
                                  if (product.BodyID) {
                                    const platform = platforms.find(
                                      (p) =>
                                        (p.id || p.BodyID) == product.BodyID,
                                    );
                                    if (platform) {
                                      return `${product.PlatformStartYear}-${product.PlatformEndYear} ${platform.name || platform.Name}`;
                                    }
                                  }
                                  return `${product.PlatformStartYear}-${product.PlatformEndYear}`;
                                }

                                return "Unknown Platform";
                              })()}
                            </td>
                            <td>
                              {product.CategoryNames ||
                                product.FullCategoryNames ||
                                "N/A"}
                            </td>
                            <td>
                              <a
                                href={getInstallUrl(product.Instructions)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-danger"
                              >
                                View Instructions
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading &&
            products.length === 0 &&
            (selectedPlatform || partNumber) && (
              <div className="row mb-5">
                <div className="col-12">
                  <div className="alert alert-info text-center">
                    {searchType === "partNumber" && partNumber
                      ? `No installation instructions found for part numbers matching "${partNumber}".`
                      : `No installation instructions found for the selected ${selectedCategory ? "platform and category" : "platform"}.`}
                  </div>
                </div>
              </div>
            )}

          <div className="row">
            {/* YouTube Videos */}
            <div className="col-md-6 mb-4">
              <div className="installation-info-box">
                <h3 className="installation-info-title">
                  View Available Install Videos on YouTube!
                </h3>
                <a
                  href="https://www.youtube.com/@BMRSuspension"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-danger btn-block w-100 mt-3"
                >
                  Visit BMR Suspension on YouTube
                </a>
              </div>
            </div>

            {/* Tech Support */}
            <div className="col-md-6 mb-4">
              <div className="installation-info-box">
                <h3 className="installation-info-title">
                  Still need help? Give our helpful techs a call!
                </h3>
                <p className="installation-support-hours mb-3">
                  Available 8:30-5:30 PM EST Monday-Friday
                </p>
                <a
                  href="tel:8139869302"
                  className="btn btn-danger btn-block w-100"
                >
                  (813)-986-9302
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
