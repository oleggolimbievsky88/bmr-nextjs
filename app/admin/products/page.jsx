"use client";

import { useState, useEffect, useCallback } from "react";
import { getProductImageUrl, getInstallUrl } from "@/lib/assets";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [bodies, setBodies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]); // Categories for selected platform (product form)
  const [filterCategories, setFilterCategories] = useState([]); // Categories for filter dropdown (scoped + grouped when platform selected)
  const [mainCategories, setMainCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [productOptions, setProductOptions] = useState({
    colors: [],
    hardware: [],
    grease: [],
    anglefinder: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("PartNumber");
  const [sortDirection, setSortDirection] = useState("asc");
  const [displayFilter, setDisplayFilter] = useState("all");
  const [filterBodyId, setFilterBodyId] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterManufacturerId, setFilterManufacturerId] = useState("");
  const [filterScratchAndDent, setFilterScratchAndDent] = useState(false);
  const [filterNewProducts, setFilterNewProducts] = useState(""); // "" | "all" | "onsite"
  const [filterNoImage, setFilterNoImage] = useState(false);
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [filterLowMargin, setFilterLowMargin] = useState(false);
  const [filterHardwarePacks, setFilterHardwarePacks] = useState(false);
  const [filterMultipleBoxes, setFilterMultipleBoxes] = useState(false);
  const [filterPackage, setFilterPackage] = useState(false);
  const [filterNoManufacturer, setFilterNoManufacturer] = useState(false);
  const [instructionsPdfFile, setInstructionsPdfFile] = useState(null);
  const [instructionsDelete, setInstructionsDelete] = useState(false);
  const [formData, setFormData] = useState({
    PartNumber: "",
    ProductName: "",
    Description: "",
    Retail: "",
    Price: "",
    ImageSmall: "",
    Qty: 0,
    BodyID: "",
    CatID: "",
    ImageLarge: "",
    Features: "",
    Instructions: "",
    Blength: 0,
    Bheight: 0,
    Bwidth: 0,
    Bweight: 0,
    Color: "",
    Hardware: "",
    Grease: "",
    Images: "",
    NewPart: 0,
    NewPartDate: "",
    PackagePartnumbers: "",
    FreeShipping: "1",
    Display: 1,
    PackagePartnumbersQty: "",
    Package: 0,
    StartAppYear: "",
    EndAppYear: "",
    UsaMade: 1,
    fproduct: 0,
    CrossRef: "",
    ManID: "",
    LowMargin: 0,
    mbox: "",
    flatrate: "",
    AngleFinder: "",
    endproduct: "",
    domhandling: "",
    hardwarepack: 0,
    hardwarepacks: "",
    video: "",
    taxexempt: 0,
    couponexempt: 0,
    BlemProduct: 0,
  });
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);

  // Helper function to get correct image URL (env-configured)
  const getImageUrl = (imagePath) => getProductImageUrl(imagePath);

  useEffect(() => {
    fetchProducts();
    fetchBodies();
    fetchCategories();
    fetchMainCategories();
    fetchManufacturers();
    fetchProductOptions();
  }, []);

  const fetchProductOptions = async () => {
    try {
      const res = await fetch("/api/admin/product-options");
      const data = await res.json();
      if (res.ok) {
        setProductOptions({
          colors: data.colors || [],
          hardware: data.hardware || [],
          grease: data.grease || [],
          anglefinder: data.anglefinder || [],
        });
      }
    } catch (err) {
      console.error("Error fetching product options:", err);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * perPage;
      const params = new URLSearchParams({
        limit: String(perPage),
        offset: String(offset),
        sortColumn,
        sortDirection,
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (displayFilter === "1" || displayFilter === "0") {
        params.set("display", displayFilter);
      }
      if (filterBodyId) params.set("bodyId", filterBodyId);
      if (filterCategoryId) params.set("categoryId", filterCategoryId);
      if (filterManufacturerId)
        params.set("manufacturerId", filterManufacturerId);
      if (filterScratchAndDent) params.set("scratchAndDent", "1");
      if (filterNewProducts) params.set("newProducts", filterNewProducts);
      if (filterNoImage) params.set("noImage", "1");
      if (filterFeatured) params.set("featured", "1");
      if (filterLowMargin) params.set("lowMargin", "1");
      if (filterHardwarePacks) params.set("hardwarePacks", "1");
      if (filterMultipleBoxes) params.set("multipleBoxes", "1");
      if (filterPackage) params.set("package", "1");
      if (filterNoManufacturer) params.set("noManufacturer", "1");
      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      setProducts(data.products || []);
      const tot = typeof data.total === "number" ? data.total : 0;
      setTotal(tot);
      if ((data.products || []).length === 0 && currentPage > 1 && tot > 0) {
        setCurrentPage(1);
      }
      setError("");
    } catch (err) {
      setError(err.message);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    perPage,
    debouncedSearch,
    sortColumn,
    sortDirection,
    displayFilter,
    filterBodyId,
    filterCategoryId,
    filterManufacturerId,
    filterScratchAndDent,
    filterNewProducts,
    filterNoImage,
    filterFeatured,
    filterLowMargin,
    filterHardwarePacks,
    filterMultipleBoxes,
    filterPackage,
    filterNoManufacturer,
  ]);

  const applyFilters = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearch(""); // Immediate clear for instant refetch
    setDisplayFilter("all");
    setFilterBodyId("");
    setFilterCategoryId("");
    setFilterManufacturerId("");
    setFilterScratchAndDent(false);
    setFilterNewProducts(false);
    setFilterNoImage(false);
    setFilterFeatured(false);
    setFilterLowMargin(false);
    setFilterHardwarePacks(false);
    setFilterMultipleBoxes(false);
    setFilterPackage(false);
    setFilterNoManufacturer(false);
    setCurrentPage(1);
  }, []);

  const fetchBodies = async () => {
    try {
      const response = await fetch("/api/admin/bodies");
      const data = await response.json();
      if (response.ok) {
        setBodies(data.bodies || []);
      }
    } catch (err) {
      console.error("Error fetching bodies:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchMainCategories = async () => {
    try {
      const response = await fetch("/api/admin/maincategories");
      const data = await response.json();
      if (response.ok) {
        setMainCategories(data.mainCategories || []);
      }
    } catch (err) {
      console.error("Error fetching main categories:", err);
    }
  };

  const fetchManufacturers = async () => {
    try {
      const response = await fetch("/api/admin/manufacturers");
      const data = await response.json();
      if (response.ok) {
        setManufacturers(data.manufacturers || []);
      }
    } catch (err) {
      console.error("Error fetching manufacturers:", err);
    }
  };

  // Debounce search and reset to page 1 when it changes
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch when pagination, sort, or debounced search changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchCategoriesByBody = async (bodyId) => {
    if (!bodyId) {
      setAvailableCategories([]);
      return [];
    }
    try {
      const response = await fetch(`/api/admin/categories/by-body/${bodyId}`);
      const data = await response.json();
      if (response.ok) {
        const cats = data.categories || [];
        setAvailableCategories(cats);
        return cats;
      }
    } catch (err) {
      console.error("Error fetching categories by body:", err);
      setAvailableCategories([]);
    }
    return [];
  };

  // When platform/vehicle filter changes: fetch scoped categories and clear category if invalid
  useEffect(() => {
    if (filterBodyId) {
      fetch(`/api/admin/categories/by-body/${filterBodyId}`)
        .then((res) => res.json())
        .then((data) => {
          const cats = data.categories || [];
          setFilterCategories(cats);
          setFilterCategoryId((prev) => {
            if (!prev) return prev;
            const valid = cats.some((c) => String(c.CatID) === String(prev));
            return valid ? prev : "";
          });
        })
        .catch(() => setFilterCategories([]));
    } else {
      setFilterCategories(categories);
      setFilterCategoryId((prev) => {
        if (!prev) return prev;
        const valid = categories.some((c) => String(c.CatID) === String(prev));
        return valid ? prev : "";
      });
    }
  }, [filterBodyId, categories]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
            ? 1
            : 0
          : type === "number"
            ? value === ""
              ? 0
              : parseInt(value)
            : value,
    };

    // If BodyID changes, fetch categories for that platform
    if (name === "BodyID") {
      fetchCategoriesByBody(value);
      // Reset CatID when platform changes
      newFormData.CatID = "";
    }

    setFormData(newFormData);
  };

  const handleMainImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMainImage(e.target.files[0]);
    }
  };

  const handleAdditionalImagesChange = (e) => {
    if (e.target.files) {
      setAdditionalImages(Array.from(e.target.files));
    }
  };

  const resetForm = () => {
    setFormData({
      PartNumber: "",
      ProductName: "",
      Description: "",
      Retail: "",
      Price: "",
      ImageSmall: "",
      Qty: 0,
      BodyID: "",
      CatID: "",
      ImageLarge: "",
      Features: "",
      Instructions: "",
      Blength: 0,
      Bheight: 0,
      Bwidth: 0,
      Bweight: 0,
      Color: "",
      Hardware: "",
      Grease: "",
      Images: "",
      NewPart: 0,
      NewPartDate: "",
      PackagePartnumbers: "",
      FreeShipping: "1",
      Display: 1,
      PackagePartnumbersQty: "",
      Package: 0,
      StartAppYear: "",
      EndAppYear: "",
      UsaMade: 1,
      fproduct: 0,
      CrossRef: "",
      ManID: "",
      LowMargin: 0,
      mbox: "",
      flatrate: "",
      AngleFinder: "",
      endproduct: "",
      domhandling: "",
      hardwarepack: 0,
      hardwarepacks: "",
      video: "",
      taxexempt: 0,
      couponexempt: 0,
      BlemProduct: 0,
    });
    setMainImage(null);
    setAdditionalImages([]);
    setInstructionsPdfFile(null);
    setInstructionsDelete(false);
    setEditingProduct(null);
    setAvailableCategories([]);
    setShowForm(false);
  };

  const handleEdit = async (product) => {
    try {
      const response = await fetch(`/api/admin/products/${product.ProductID}`);
      const data = await response.json();
      if (response.ok) {
        setEditingProduct(product);
        const bodyId = data.product.BodyID || "";
        const catId = data.product.CatID || "";

        // Fetch categories for this platform
        if (bodyId) {
          await fetchCategoriesByBody(bodyId);
        }

        setFormData({
          PartNumber: data.product.PartNumber || "",
          ProductName: data.product.ProductName || "",
          Description: data.product.Description || "",
          Retail: data.product.Retail || "",
          Price: data.product.Price || "",
          ImageSmall: data.product.ImageSmall || "",
          Qty: data.product.Qty || 0,
          BodyID: bodyId,
          CatID: catId,
          ImageLarge: data.product.ImageLarge || "",
          Features: data.product.Features || "",
          Instructions: data.product.Instructions || "",
          Blength: data.product.Blength || 0,
          Bheight: data.product.Bheight || 0,
          Bwidth: data.product.Bwidth || 0,
          Bweight: data.product.Bweight || 0,
          Color: data.product.Color || "",
          Hardware:
            data.product.Hardware && data.product.Hardware !== "0"
              ? String(data.product.Hardware)
              : "",
          Grease:
            data.product.Grease && data.product.Grease !== "0"
              ? String(data.product.Grease)
              : "",
          Images: data.product.Images || "",
          NewPart: data.product.NewPart || 0,
          NewPartDate:
            data.product.NewPartDate && data.product.NewPartDate !== "0"
              ? data.product.NewPartDate
              : "",
          PackagePartnumbers: data.product.PackagePartnumbers || "",
          FreeShipping:
            data.product.FreeShipping == 1 || data.product.FreeShipping === "1"
              ? "1"
              : "0",
          Display:
            data.product.Display !== undefined ? data.product.Display : 1,
          PackagePartnumbersQty: data.product.PackagePartnumbersQty || "",
          Package: data.product.Package || 0,
          StartAppYear: data.product.StartAppYear || "",
          EndAppYear: data.product.EndAppYear || "",
          UsaMade:
            data.product.UsaMade !== undefined ? data.product.UsaMade : 1,
          fproduct: data.product.fproduct || 0,
          CrossRef: data.product.CrossRef || "",
          ManID: data.product.ManID || "",
          LowMargin: data.product.LowMargin || 0,
          mbox: data.product.mbox || "",
          flatrate: data.product.flatrate || "",
          AngleFinder:
            data.product.AngleFinder && data.product.AngleFinder !== "0"
              ? String(data.product.AngleFinder)
              : "",
          endproduct: data.product.endproduct || "",
          domhandling: data.product.domhandling || "",
          hardwarepack: data.product.hardwarepack || 0,
          hardwarepacks: data.product.hardwarepacks || "",
          video: data.product.video || "",
          taxexempt: data.product.taxexempt || 0,
          couponexempt: data.product.couponexempt || 0,
          BlemProduct: data.product.BlemProduct || 0,
        });
        setMainImage(null);
        setAdditionalImages([]);
        setInstructionsPdfFile(null);
        setInstructionsDelete(false);
        setShowForm(true);
      }
    } catch (err) {
      setError("Failed to load product: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const submitFormData = new FormData();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        submitFormData.append(key, formData[key]);
      });

      // Add main image if selected
      if (mainImage) {
        submitFormData.append("mainImage", mainImage);
      }

      // Add additional images
      additionalImages.forEach((img) => {
        submitFormData.append("additionalImages", img);
      });

      if (instructionsPdfFile) {
        submitFormData.append("instructionsPdf", instructionsPdfFile);
      }
      if (instructionsDelete) {
        submitFormData.append("instructionsDelete", "1");
      }

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.ProductID}`
        : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: submitFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        const msg =
          data.error && data.details
            ? `${data.error}: ${data.details}`
            : data.error || "Failed to save product";
        throw new Error(msg);
      }

      setSuccess(
        editingProduct
          ? "Product updated successfully!"
          : "Product created successfully!",
      );
      resetForm();
      fetchProducts();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const SortableTh = ({ column, label }) => (
    <th
      role="button"
      tabIndex={0}
      onClick={() => handleSort(column)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSort(column);
        }
      }}
      className="sortable"
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      {label}
      {sortColumn === column && (
        <span className="ms-1" aria-hidden="true">
          {sortDirection === "asc" ? "↑" : "↓"}
        </span>
      )}
    </th>
  );

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete product");
      }

      setSuccess("Product deleted successfully!");
      fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const hasActiveFilters =
    searchTerm ||
    displayFilter !== "all" ||
    filterBodyId ||
    filterCategoryId ||
    filterManufacturerId ||
    filterScratchAndDent ||
    filterNewProducts !== "" ||
    filterNoImage ||
    filterFeatured ||
    filterLowMargin ||
    filterHardwarePacks ||
    filterMultipleBoxes ||
    filterPackage ||
    filterNoManufacturer;

  return (
    <div className="admin-products-page">
      <div className="admin-page-header d-flex flex-wrap align-items-center justify-content-between gap-3">
        <h1 className="admin-page-title mb-0">Product Management</h1>
        <button
          className="admin-btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add New Product
        </button>
      </div>

      {/* Filters - same look as admin orders */}
      <div className="admin-card mb-3">
        <div className="row g-2 align-items-end flex-wrap">
          <div className="col-auto">
            <label htmlFor="filter-part" className="form-label small mb-0">
              Part #
            </label>
            <input
              id="filter-part"
              type="text"
              className="form-control form-control-sm admin-filter-input"
              placeholder="Part number or keyword"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              style={{ minWidth: "160px" }}
            />
          </div>
          <div className="col-auto">
            <label htmlFor="filter-vehicle" className="form-label small mb-0">
              Vehicle
            </label>
            <select
              id="filter-vehicle"
              className="form-select form-select-sm admin-filter-input"
              value={filterBodyId}
              onChange={(e) => setFilterBodyId(e.target.value)}
              style={{ minWidth: "180px" }}
            >
              <option value="">All Vehicles</option>
              {bodies.map((b) => (
                <option key={b.BodyID} value={b.BodyID}>
                  {b.StartYear}-{b.EndYear} {b.Name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-auto">
            <label htmlFor="filter-category" className="form-label small mb-0">
              Category
            </label>
            <select
              id="filter-category"
              className="form-select form-select-sm admin-filter-input"
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              style={{ minWidth: "160px" }}
            >
              <option value="">All Categories</option>
              {(() => {
                const cats = filterCategories;
                if (!cats.length) return null;
                const hasMainCat = cats[0]?.MainCatName != null;
                if (!hasMainCat) {
                  return cats.map((c) => (
                    <option key={c.CatID} value={c.CatID}>
                      {c.CatName}
                    </option>
                  ));
                }
                const groups = {};
                cats.forEach((c) => {
                  const label = filterBodyId
                    ? c.MainCatName || "Other"
                    : `${c.MainCatName || "Other"}${c.PlatformName ? ` (${c.PlatformName})` : ""}`;
                  if (!groups[label]) groups[label] = [];
                  groups[label].push(c);
                });
                return Object.entries(groups)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([label, items]) => (
                    <optgroup key={label} label={label}>
                      {items.map((c) => (
                        <option key={c.CatID} value={c.CatID}>
                          {c.CatName}
                        </option>
                      ))}
                    </optgroup>
                  ));
              })()}
            </select>
          </div>
          <div className="col-auto">
            <label
              htmlFor="filter-manufacturer"
              className="form-label small mb-0"
            >
              Manufacturer
            </label>
            <select
              id="filter-manufacturer"
              className="form-select form-select-sm admin-filter-input"
              value={filterManufacturerId}
              onChange={(e) => setFilterManufacturerId(e.target.value)}
              style={{ minWidth: "160px" }}
            >
              <option value="">All Manufacturers</option>
              {manufacturers.map((m) => (
                <option key={m.ManID} value={m.ManID}>
                  {m.ManName}
                </option>
              ))}
            </select>
          </div>
          <div className="col-auto">
            <label htmlFor="filter-display" className="form-label small mb-0">
              Display
            </label>
            <select
              id="filter-display"
              className="form-select form-select-sm admin-filter-input"
              value={displayFilter}
              onChange={(e) => setDisplayFilter(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="all">All</option>
              <option value="1">Visible only</option>
              <option value="0">Hidden only</option>
            </select>
          </div>
          <div className="col-auto">
            <label
              htmlFor="filter-new-products"
              className="form-label small mb-0"
            >
              New Products
            </label>
            <select
              id="filter-new-products"
              className="form-select form-select-sm admin-filter-input"
              value={filterNewProducts}
              onChange={(e) => setFilterNewProducts(e.target.value)}
              style={{ minWidth: "180px" }}
            >
              <option value="">—</option>
              <option value="all">All (checked)</option>
              <option value="onsite">On site (&lt;90 days)</option>
            </select>
          </div>
          <div className="col-auto d-flex gap-2">
            <button
              type="button"
              onClick={applyFilters}
              className="btn btn-sm btn-primary"
            >
              Apply filters
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-sm btn-outline-secondary"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="row g-2 mt-2 pt-2 border-top">
          <div className="col-12">
            <span className="admin-view-label me-2">Show:</span>
            <div className="d-flex flex-wrap gap-3 align-items-center">
              <label className="form-check form-check-inline mb-0 small">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={filterScratchAndDent}
                  onChange={(e) => setFilterScratchAndDent(e.target.checked)}
                />
                <span className="form-check-label">Scratch and Dent</span>
              </label>
              <label className="form-check form-check-inline mb-0 small">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={filterNoImage}
                  onChange={(e) => setFilterNoImage(e.target.checked)}
                />
                <span className="form-check-label">No Image</span>
              </label>
              <label className="form-check form-check-inline mb-0 small">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={filterFeatured}
                  onChange={(e) => setFilterFeatured(e.target.checked)}
                />
                <span className="form-check-label">Featured</span>
              </label>
              <label className="form-check form-check-inline mb-0 small">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={filterLowMargin}
                  onChange={(e) => setFilterLowMargin(e.target.checked)}
                />
                <span className="form-check-label">Low Margin</span>
              </label>
              <label className="form-check form-check-inline mb-0 small">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={filterHardwarePacks}
                  onChange={(e) => setFilterHardwarePacks(e.target.checked)}
                />
                <span className="form-check-label">Hardware Packs</span>
              </label>
              <label className="form-check form-check-inline mb-0 small">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={filterMultipleBoxes}
                  onChange={(e) => setFilterMultipleBoxes(e.target.checked)}
                />
                <span className="form-check-label">Multiple Boxes</span>
              </label>
              <label className="form-check form-check-inline mb-0 small">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={filterPackage}
                  onChange={(e) => setFilterPackage(e.target.checked)}
                />
                <span className="form-check-label">Packages</span>
              </label>
              <label className="form-check form-check-inline mb-0 small">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={filterNoManufacturer}
                  onChange={(e) => setFilterNoManufacturer(e.target.checked)}
                />
                <span className="form-check-label">No Manufacturer</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="admin-alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="admin-card admin-product-form-card">
          <h2 className="admin-form-title mb-4">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h2>
          <form onSubmit={handleSubmit} className="admin-product-form">
            {/* Basic Information */}
            <div className="admin-form-section">
              <h3 className="admin-form-section-title">Basic Information</h3>
              <div className="row">
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Part Number *</label>
                    <input
                      type="text"
                      name="PartNumber"
                      className="form-control"
                      value={formData.PartNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      name="ProductName"
                      className="form-control"
                      value={formData.ProductName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      name="NewPart"
                      className="form-check-input"
                      checked={formData.NewPart === 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          NewPart: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                    <label className="form-check-label">New Product</label>
                  </div>
                  {formData.NewPart === 1 && (
                    <div
                      className="admin-form-group"
                      style={{ maxWidth: "200px" }}
                    >
                      <label>New Part Date</label>
                      <input
                        type="date"
                        name="NewPartDate"
                        className="form-control"
                        value={formData.NewPartDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  name="Description"
                  className="form-control"
                  rows="12"
                  style={{ minHeight: "200px" }}
                  value={formData.Description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="row">
                <div className="col-md-4">
                  <div className="admin-form-group">
                    <label>Retail Price</label>
                    <input
                      type="text"
                      name="Retail"
                      className="form-control"
                      value={formData.Retail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="admin-form-group">
                    <label>Price *</label>
                    <input
                      type="text"
                      name="Price"
                      className="form-control"
                      value={formData.Price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="admin-form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      name="Qty"
                      className="form-control"
                      value={formData.Qty}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="admin-form-section">
              <h3 className="admin-form-section-title">Images</h3>
              <div className="admin-form-group">
                <label>
                  Main Image (Always Red if product comes in both red and black)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  className="form-control"
                />
                {formData.ImageLarge &&
                  formData.ImageLarge !== "0" &&
                  !mainImage && (
                    <div className="mt-2">
                      <img
                        src={getImageUrl(formData.ImageLarge)}
                        alt="Current main image"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          objectFit: "contain",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
              </div>
              <div className="admin-form-group">
                <label>Additional Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesChange}
                  className="form-control"
                />
                {formData.Images && formData.Images !== "0" && (
                  <div className="mt-2 d-flex flex-wrap gap-2">
                    {formData.Images.split(",")
                      .filter((img) => img && img !== "0")
                      .map((img, idx) => {
                        const imgSrc = img.trim();
                        return (
                          <img
                            key={idx}
                            src={getImageUrl(imgSrc)}
                            alt={`Additional ${idx + 1}`}
                            style={{
                              maxWidth: "150px",
                              maxHeight: "150px",
                              objectFit: "contain",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Category & Platform */}
            <div className="admin-form-section">
              <h3 className="admin-form-section-title">Category & Platform</h3>
              <div className="row">
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Platform (Body) *</label>
                    <select
                      name="BodyID"
                      className="form-select"
                      value={formData.BodyID}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Platform</option>
                      {bodies.map((body) => (
                        <option key={body.BodyID} value={body.BodyID}>
                          {body.StartYear}-{body.EndYear} {body.Name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Category *</label>
                    <select
                      name="CatID"
                      className="form-select"
                      value={formData.CatID}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.BodyID}
                    >
                      <option value="">
                        {formData.BodyID
                          ? "Select Category"
                          : "Select Platform First"}
                      </option>
                      {availableCategories.map((cat) => (
                        <option key={cat.CatID} value={cat.CatID}>
                          {cat.CatName}{" "}
                          {cat.MainCatName ? `(${cat.MainCatName})` : ""}
                        </option>
                      ))}
                    </select>
                    {!formData.BodyID && (
                      <small className="text-muted">
                        Please select a platform first
                      </small>
                    )}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Manufacturer</label>
                    <select
                      name="ManID"
                      className="form-select"
                      value={formData.ManID}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Manufacturer</option>
                      {manufacturers.map((man) => (
                        <option key={man.ManID} value={man.ManID}>
                          {man.ManName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Display</label>
                    <select
                      name="Display"
                      className="form-select"
                      value={formData.Display}
                      onChange={handleInputChange}
                    >
                      <option value={1}>Yes</option>
                      <option value={0}>No</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Dimensions & Weight */}
            <div className="admin-form-section">
              <h3 className="admin-form-section-title">Dimensions & Weight</h3>
              <div className="row">
                <div className="col-md-3">
                  <div className="admin-form-group">
                    <label>Length</label>
                    <input
                      type="number"
                      name="Blength"
                      className="form-control"
                      value={formData.Blength}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="admin-form-group">
                    <label>Height</label>
                    <input
                      type="number"
                      name="Bheight"
                      className="form-control"
                      value={formData.Bheight}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="admin-form-group">
                    <label>Width</label>
                    <input
                      type="number"
                      name="Bwidth"
                      className="form-control"
                      value={formData.Bwidth}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="admin-form-group">
                    <label>Weight</label>
                    <input
                      type="number"
                      name="Bweight"
                      className="form-control"
                      value={formData.Bweight}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="admin-form-section">
              <h3 className="admin-form-section-title">Options</h3>
              <div className="row">
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Color (hold Ctrl/Cmd to select multiple)</label>
                    <select
                      name="Color"
                      multiple
                      className="form-select"
                      value={
                        formData.Color
                          ? formData.Color.split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                          : []
                      }
                      onChange={(e) => {
                        const v = Array.from(
                          e.target.selectedOptions,
                          (o) => o.value,
                        )
                          .filter(Boolean)
                          .join(",");
                        setFormData({ ...formData, Color: v });
                      }}
                    >
                      {productOptions.colors.map((c) => (
                        <option key={c.ColorID} value={String(c.ColorID)}>
                          {c.ColorName}
                          {c.ColorPrice && c.ColorPrice !== "0"
                            ? ` (+$${c.ColorPrice})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Hardware</label>
                    <select
                      name="Hardware"
                      className="form-select"
                      value={formData.Hardware || ""}
                      onChange={handleInputChange}
                    >
                      <option value="">None</option>
                      {productOptions.hardware.map((h) => (
                        <option key={h.HardwareID} value={String(h.HardwareID)}>
                          {h.HardwareName}
                          {h.HardwarePrice && h.HardwarePrice !== "0"
                            ? ` (+$${h.HardwarePrice})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <div className="admin-form-group">
                    <label>Grease</label>
                    <select
                      name="Grease"
                      className="form-select"
                      value={formData.Grease || ""}
                      onChange={handleInputChange}
                    >
                      <option value="">None</option>
                      {productOptions.grease.map((g) => (
                        <option key={g.GreaseID} value={String(g.GreaseID)}>
                          {g.GreaseName}
                          {g.GreasePrice && g.GreasePrice !== "0"
                            ? ` (+$${g.GreasePrice})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="admin-form-group">
                    <label>Angle Finder</label>
                    <select
                      name="AngleFinder"
                      className="form-select"
                      value={formData.AngleFinder || ""}
                      onChange={handleInputChange}
                    >
                      <option value="">None</option>
                      {productOptions.anglefinder.map((a) => (
                        <option key={a.AngleID} value={String(a.AngleID)}>
                          {a.AngleName}
                          {a.AnglePrice && a.AnglePrice !== "0"
                            ? ` (+$${a.AnglePrice})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="admin-form-group">
                    <label>Free Shipping</label>
                    <div className="form-check mt-2">
                      <input
                        type="checkbox"
                        name="FreeShipping"
                        className="form-check-input"
                        checked={
                          formData.FreeShipping === "1" ||
                          formData.FreeShipping === 1
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            FreeShipping: e.target.checked ? "1" : "0",
                          })
                        }
                      />
                      <label className="form-check-label">Yes</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="admin-form-group">
                    <label>Domestic Handling</label>
                    <input
                      type="text"
                      name="domhandling"
                      className="form-control"
                      value={formData.domhandling}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="admin-form-section">
              <h3 className="admin-form-section-title">
                Additional Information
              </h3>
              <div className="admin-form-group">
                <label>Features</label>
                <textarea
                  name="Features"
                  className="form-control"
                  rows="12"
                  style={{ minHeight: "200px" }}
                  value={formData.Features}
                  onChange={handleInputChange}
                />
              </div>
              <div className="admin-form-group">
                <label>Instructions (PDF)</label>
                {formData.Instructions &&
                  formData.Instructions !== "0" &&
                  !instructionsDelete && (
                    <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                      <a
                        href={getInstallUrl(formData.Instructions)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        {formData.Instructions}
                      </a>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => {
                          setFormData({ ...formData, Instructions: "0" });
                          setInstructionsDelete(true);
                          setInstructionsPdfFile(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                {instructionsPdfFile && (
                  <div className="text-muted small mb-2">
                    New file: {instructionsPdfFile.name} (will replace existing
                    on save)
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="form-control"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setInstructionsPdfFile(f || null);
                    if (f) setInstructionsDelete(false);
                    e.target.value = "";
                  }}
                />
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Start Application Year</label>
                    <input
                      type="text"
                      name="StartAppYear"
                      className="form-control"
                      value={formData.StartAppYear}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>End Application Year</label>
                    <input
                      type="text"
                      name="EndAppYear"
                      className="form-control"
                      value={formData.EndAppYear}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Package Part Numbers</label>
                    <input
                      type="text"
                      name="PackagePartnumbers"
                      className="form-control"
                      value={formData.PackagePartnumbers}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Package Part Numbers Qty</label>
                    <input
                      type="text"
                      name="PackagePartnumbersQty"
                      className="form-control"
                      value={formData.PackagePartnumbersQty}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Cross Reference</label>
                    <input
                      type="text"
                      name="CrossRef"
                      className="form-control"
                      value={formData.CrossRef}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Video URL</label>
                    <input
                      type="text"
                      name="video"
                      className="form-control"
                      value={formData.video}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <div className="admin-form-group">
                    <label>M Box</label>
                    <input
                      type="text"
                      name="mbox"
                      className="form-control"
                      value={formData.mbox}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="admin-form-group">
                    <label>Flat Rate</label>
                    <input
                      type="text"
                      name="flatrate"
                      className="form-control"
                      value={formData.flatrate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="admin-form-group">
                    <label>Hardware Packs</label>
                    <input
                      type="text"
                      name="hardwarepacks"
                      className="form-control"
                      value={formData.hardwarepacks}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Flags */}
            <div className="admin-form-section">
              <h3 className="admin-form-section-title">Flags</h3>
              <div className="row">
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="Package"
                      className="form-check-input"
                      checked={formData.Package === 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          Package: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                    <label className="form-check-label">Package</label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="UsaMade"
                      className="form-check-input"
                      checked={formData.UsaMade === 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          UsaMade: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                    <label className="form-check-label">USA Made</label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="fproduct"
                      className="form-check-input"
                      checked={formData.fproduct === 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fproduct: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                    <label className="form-check-label">Featured Product</label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="LowMargin"
                      className="form-check-input"
                      checked={formData.LowMargin === 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          LowMargin: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                    <label className="form-check-label">Low Margin</label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="hardwarepack"
                      className="form-check-input"
                      checked={formData.hardwarepack === 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hardwarepack: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                    <label className="form-check-label">Hardware Pack</label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="taxexempt"
                      className="form-check-input"
                      checked={formData.taxexempt === 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          taxexempt: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                    <label className="form-check-label">Tax Exempt</label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="couponexempt"
                      className="form-check-input"
                      checked={formData.couponexempt === 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          couponexempt: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                    <label className="form-check-label">Coupon Exempt</label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="BlemProduct"
                      className="form-check-input"
                      checked={formData.BlemProduct === 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          BlemProduct: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                    <label className="form-check-label">Scratch & Dent</label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="endproduct"
                      className="form-check-input"
                      checked={formData.endproduct === 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endproduct: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                    <label className="form-check-label">End Product</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-btn-primary">
                {editingProduct ? "Update Product" : "Create Product"}
              </button>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="admin-card">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span className="admin-products-count">
                {total} product{total !== 1 ? "s" : ""}
              </span>
              {total > 0 && (
                <span className="text-muted small">
                  Showing {Math.min((currentPage - 1) * perPage + 1, total)}–
                  {Math.min(currentPage * perPage, total)} of {total}
                </span>
              )}
              <label className="d-flex align-items-center gap-2 mb-0">
                <span className="small">Per page:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>
            </div>
            {total > perPage && (
              <nav
                aria-label="Product pagination"
                className="admin-products-pagination"
              >
                <ul className="pagination pagination-sm mb-0 flex-wrap">
                  <li
                    className={`page-item ${
                      currentPage <= 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                    >
                      Prev
                    </button>
                  </li>
                  {(() => {
                    const totalPages = Math.ceil(total / perPage) || 1;
                    const pages = [];
                    if (totalPages <= 5) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (currentPage > 3) pages.push("…");
                      for (
                        let i = Math.max(2, currentPage - 1);
                        i <= Math.min(totalPages - 1, currentPage + 1);
                        i++
                      ) {
                        if (!pages.includes(i)) pages.push(i);
                      }
                      if (currentPage < totalPages - 2) pages.push("…");
                      if (totalPages > 1) pages.push(totalPages);
                    }
                    return pages.map((p, i) =>
                      p === "…" ? (
                        <li key={`el-${i}`} className="page-item disabled">
                          <span className="page-link">…</span>
                        </li>
                      ) : (
                        <li
                          key={p}
                          className={`page-item ${
                            p === currentPage ? "active" : ""
                          }`}
                        >
                          <button
                            type="button"
                            className="page-link"
                            onClick={() => setCurrentPage(p)}
                          >
                            {p}
                          </button>
                        </li>
                      ),
                    );
                  })()}
                  <li
                    className={`page-item ${
                      currentPage >= Math.ceil(total / perPage)
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(Math.ceil(total / perPage) || 1, p + 1),
                        )
                      }
                      disabled={currentPage >= Math.ceil(total / perPage)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <SortableTh column="PartNumber" label="Part Number" />
                  <SortableTh column="ProductName" label="Product Name" />
                  <SortableTh column="Platform" label="Platform" />
                  <SortableTh column="Price" label="Price" />
                  <SortableTh column="Qty" label="Qty" />
                  <SortableTh column="Display" label="Display" />
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={`${product.ProductID}-${(
                        product.PartNumber || ""
                      ).toString()}`}
                    >
                      <td>
                        {product.ImageLarge && product.ImageLarge !== "0" ? (
                          <img
                            src={getImageUrl(product.ImageLarge)}
                            alt={product.ProductName}
                            style={{
                              maxWidth: "60px",
                              maxHeight: "60px",
                              objectFit: "contain",
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                            }}
                          />
                        ) : product.ImageSmall && product.ImageSmall !== "0" ? (
                          <img
                            src={getImageUrl(product.ImageSmall)}
                            alt={product.ProductName}
                            style={{
                              maxWidth: "60px",
                              maxHeight: "60px",
                              objectFit: "contain",
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-muted">No image</span>
                        )}
                      </td>
                      <td>{product.PartNumber}</td>
                      <td>{product.ProductName}</td>
                      <td>{product.Platform || "—"}</td>
                      <td>${product.Price}</td>
                      <td>{product.Qty}</td>
                      <td>
                        <span
                          className={`admin-status-badge ${
                            product.Display === 1
                              ? "badge-active"
                              : "badge-inactive"
                          }`}
                        >
                          {product.Display === 1 ? "Yes" : "No"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="admin-btn-secondary me-2"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-btn-danger"
                          onClick={() => handleDelete(product.ProductID)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
