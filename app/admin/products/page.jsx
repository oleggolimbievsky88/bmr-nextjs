"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getProductImageUrl, getInstallUrl } from "@/lib/assets";
import { showToast } from "@/utlis/showToast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [bodies, setBodies] = useState([]);
  const [platformGroups, setPlatformGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]); // Categories for selected platform (product form)
  const [filterCategories, setFilterCategories] = useState([]); // Categories for filter dropdown (scoped + grouped when platform selected)
  const [mainCategories, setMainCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [productOptions, setProductOptions] = useState({
    colors: [],
    hardware: [],
    hardwarePacks: [],
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
  const [newProductsDays, setNewProductsDays] = useState(90);
  const [newProductsDaysInput, setNewProductsDaysInput] = useState("90");
  const [newProductsDaysSaving, setNewProductsDaysSaving] = useState(false);
  const [filterNoImage, setFilterNoImage] = useState(false);
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [filterLowMargin, setFilterLowMargin] = useState(false);
  const [filterHardwarePacks, setFilterHardwarePacks] = useState(false);
  const [filterMultipleBoxes, setFilterMultipleBoxes] = useState(false);
  const [filterPackage, setFilterPackage] = useState(false);
  const [filterNoManufacturer, setFilterNoManufacturer] = useState(false);
  const [instructionsPdfFile, setInstructionsPdfFile] = useState(null);
  const [instructionsDelete, setInstructionsDelete] = useState(false);
  const [categoriesByPlatform, setCategoriesByPlatform] = useState({});
  const [formData, setFormData] = useState({
    PartNumber: "",
    ProductName: "",
    Description: "",
    Retail: "",
    Price: "",
    ImageSmall: "",
    Qty: 0,
    BodyID: "",
    BodyIDs: [],
    CatID: "",
    categoryByPlatform: {},
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
  const [imageSizeWarning, setImageSizeWarning] = useState(null);

  // Image size limits (to avoid "payload too large" errors)
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB per image
  const MAX_TOTAL_IMAGES_SIZE = 8 * 1024 * 1024; // 8MB total

  // Helper function to get correct image URL (env-configured)
  const getImageUrl = (imagePath) => getProductImageUrl(imagePath);

  // Default manufacturer: BMR Suspension
  const getBmrManufacturerId = () => {
    const bmr = manufacturers.find(
      (m) =>
        m.ManName &&
        (m.ManName.toLowerCase().includes("bmr suspension") ||
          m.ManName === "BMR Suspension"),
    );
    return bmr ? String(bmr.ManID) : "";
  };

  useEffect(() => {
    fetchProducts();
    fetchBodies();
    fetchPlatformGroups();
    fetchCategories();
    fetchMainCategories();
    fetchManufacturers();
    fetchProductOptions();
  }, []);

  useEffect(() => {
    const fetchNewProductsDays = async () => {
      try {
        const res = await fetch("/api/admin/settings/new-products-days");
        const data = await res.json();
        if (res.ok && typeof data.days === "number") {
          setNewProductsDays(data.days);
          setNewProductsDaysInput(String(data.days));
        }
      } catch (err) {
        console.error("Error fetching new products days:", err);
      }
    };
    fetchNewProductsDays();
  }, []);

  const fetchProductOptions = async () => {
    try {
      const res = await fetch("/api/admin/product-options");
      const data = await res.json();
      if (res.ok) {
        setProductOptions({
          colors: data.colors || [],
          hardware: data.hardware || [],
          hardwarePacks: data.hardwarePacks || [],
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

  const saveNewProductsDays = async () => {
    const days = parseInt(newProductsDaysInput, 10);
    if (!Number.isFinite(days) || days < 1 || days > 9999) {
      showToast("Enter a number between 1 and 9999", "error");
      return;
    }
    setNewProductsDaysSaving(true);
    try {
      const res = await fetch("/api/admin/settings/new-products-days", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save");
      }
      setNewProductsDays(data.days);
      setNewProductsDaysInput(String(data.days));
      showToast("New products display days saved.", "success");
    } catch (err) {
      showToast(err.message || "Failed to save", "error");
    } finally {
      setNewProductsDaysSaving(false);
    }
  };

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

  const fetchPlatformGroups = async () => {
    try {
      const response = await fetch("/api/admin/platform-groups");
      const data = await response.json();
      if (response.ok) {
        setPlatformGroups(
          Array.isArray(data) ? data : data.groups || data.platformGroups || [],
        );
      }
    } catch (err) {
      console.error("Error fetching platform groups:", err);
    }
  };

  // Group platforms by platform group for the product form (with "Other" for ungrouped)
  const bodiesByGroup = useMemo(() => {
    const groups = [...(platformGroups || [])].sort(
      (a, b) =>
        (a.position ?? 0) - (b.position ?? 0) || (a.id ?? 0) - (b.id ?? 0),
    );
    const result = [];
    for (const g of groups) {
      const list = (bodies || []).filter(
        (b) => (b.platform_group_id ?? b.BodyCatID ?? 0) == g.id,
      );
      if (list.length) result.push({ group: g, bodies: list });
    }
    const uncat = (bodies || []).filter(
      (b) =>
        !groups.some((g) => (b.platform_group_id ?? b.BodyCatID ?? 0) == g.id),
    );
    if (uncat.length) {
      result.push({ group: { id: null, name: "Other" }, bodies: uncat });
    }
    return result;
  }, [bodies, platformGroups]);

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

  // Group categories by main category for dropdowns (like platform groups)
  const groupCategoriesByMain = (categories) => {
    if (!Array.isArray(categories) || categories.length === 0) return [];
    const byMain = {};
    for (const c of categories) {
      const id = c.MainCatID ?? 0;
      const name = c.MainCatName || "Other";
      if (!byMain[id]) byMain[id] = { group: { id, name }, categories: [] };
      byMain[id].categories.push(c);
    }
    return Object.values(byMain).sort((a, b) =>
      (a.group.name || "").localeCompare(b.group.name || ""),
    );
  };

  // When selected platforms (BodyIDs) change: fetch categories for each platform for per-platform category dropdowns
  useEffect(() => {
    const bodyIds = formData.BodyIDs || [];
    if (bodyIds.length === 0) {
      setCategoriesByPlatform({});
      return;
    }
    let cancelled = false;
    const load = async () => {
      const next = {};
      for (const bodyId of bodyIds) {
        try {
          const res = await fetch(`/api/admin/categories/by-body/${bodyId}`);
          const data = await res.json();
          if (cancelled) return;
          next[String(bodyId)] = data.categories || [];
        } catch {
          if (!cancelled) next[String(bodyId)] = [];
        }
      }
      if (!cancelled) setCategoriesByPlatform(next);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [formData.BodyIDs?.length ? formData.BodyIDs.join(",") : ""]);

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

  // Warn when image/file sizes exceed limits
  useEffect(() => {
    const files = [
      ...(mainImage ? [mainImage] : []),
      ...additionalImages,
      ...(instructionsPdfFile && instructionsPdfFile.size > 0
        ? [instructionsPdfFile]
        : []),
    ];
    if (files.length === 0) {
      setImageSizeWarning(null);
      return;
    }
    const imageFiles = [...(mainImage ? [mainImage] : []), ...additionalImages];
    const total = files.reduce((sum, f) => sum + (f?.size || 0), 0);
    const oversized = imageFiles.filter((f) => f?.size > MAX_IMAGE_SIZE);
    const parts = [];
    if (oversized.length > 0) {
      const names = oversized.map((f) => f.name).join(", ");
      parts.push(
        `${oversized.length} image(s) exceed 2MB each: ${names}. Consider compressing them.`,
      );
    }
    if (total > MAX_TOTAL_IMAGES_SIZE) {
      parts.push(
        `Total size ${(total / 1024 / 1024).toFixed(1)}MB exceeds 8MB limit. Upload may fail.`,
      );
    }
    setImageSizeWarning(parts.length > 0 ? parts.join(" ") : null);
  }, [mainImage, additionalImages, instructionsPdfFile]);

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

    // If BodyID changes (legacy single select), fetch categories and sync BodyIDs
    if (name === "BodyID") {
      fetchCategoriesByBody(value);
      newFormData.CatID = "";
      newFormData.BodyIDs = value ? [String(value)] : [];
    }

    setFormData(newFormData);
  };

  const handlePlatformToggle = (bodyId) => {
    const id = String(bodyId);
    const current = Array.isArray(formData.BodyIDs) ? formData.BodyIDs : [];
    const next = current.includes(id)
      ? current.filter((b) => b !== id)
      : [...current, id].sort((a, b) => Number(a) - Number(b));
    const prevFirst = current[0];
    const newFirst = next[0];
    setFormData((prev) => {
      const nextCatByPlat = { ...(prev.categoryByPlatform || {}) };
      if (!next.includes(id)) delete nextCatByPlat[id];
      const nextCatID =
        newFirst && nextCatByPlat[newFirst] != null
          ? nextCatByPlat[newFirst]
          : prev.CatID;
      return {
        ...prev,
        BodyIDs: next,
        BodyID: newFirst || "",
        CatID: next.length === 1 ? nextCatID : (nextCatByPlat[newFirst] ?? ""),
        categoryByPlatform: nextCatByPlat,
      };
    });
    if (newFirst && newFirst !== prevFirst) {
      fetchCategoriesByBody(newFirst);
    }
  };

  const handleCategoryForPlatform = (bodyId, catId) => {
    const id = String(bodyId);
    setFormData((prev) => {
      const nextCatByPlat = { ...(prev.categoryByPlatform || {}), [id]: catId };
      const bodyIds = prev.BodyIDs || [];
      const firstId = bodyIds[0];
      const nextCatID =
        firstId === id ? catId : (nextCatByPlat[firstId] ?? prev.CatID);
      return {
        ...prev,
        categoryByPlatform: nextCatByPlat,
        CatID: bodyIds.length === 1 ? nextCatID : prev.CatID,
      };
    });
  };

  const handleMainImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMainImage(e.target.files[0]);
    }
  };

  const MAX_ADDITIONAL_IMAGES = 6;

  const handleAdditionalImagesChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAdditionalImages((prev) => {
        const combined = [...prev, ...newFiles];
        return combined.slice(0, MAX_ADDITIONAL_IMAGES);
      });
      e.target.value = "";
    }
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
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
      BodyIDs: [],
      CatID: "",
      categoryByPlatform: {},
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
      ManID: getBmrManufacturerId(),
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
    setImageSizeWarning(null);
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
        const bodyIds = Array.isArray(data.product.BodyIDs)
          ? data.product.BodyIDs.map(String)
          : data.product.BodyID
            ? [String(data.product.BodyID)]
            : [];
        const bodyId = bodyIds[0] || data.product.BodyID || "";
        const categoryByPlatform = data.product.categoryByPlatform || {};
        const catId =
          bodyId && categoryByPlatform[bodyId] != null
            ? categoryByPlatform[bodyId]
            : data.product.CatID || "";

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
          BodyIDs: bodyIds,
          CatID: catId,
          categoryByPlatform,
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

    if (imageSizeWarning) {
      const files = [
        ...(mainImage ? [mainImage] : []),
        ...additionalImages,
        ...(instructionsPdfFile && instructionsPdfFile.size > 0
          ? [instructionsPdfFile]
          : []),
      ];
      const total = files.reduce((sum, f) => sum + (f?.size || 0), 0);
      if (total > MAX_TOTAL_IMAGES_SIZE) {
        setError(
          `Total upload size ${(total / 1024 / 1024).toFixed(1)}MB exceeds 8MB limit. Compress images or reduce file sizes before saving.`,
        );
        showToast(
          "Files too large. Compress or reduce before saving.",
          "error",
        );
        return;
      }
    }

    const bodyIds = formData.BodyIDs || [];
    if (bodyIds.length === 0) {
      setError("Select at least one platform.");
      showToast("Select at least one platform.", "error");
      return;
    }

    const categoryByPlatform = { ...(formData.categoryByPlatform || {}) };
    if (bodyIds.length === 1 && formData.CatID) {
      categoryByPlatform[bodyIds[0]] = formData.CatID;
    }
    const missing = bodyIds.filter(
      (bid) => !categoryByPlatform[bid] || categoryByPlatform[bid] === "",
    );
    if (missing.length > 0) {
      setError("Select a category for each selected platform.");
      showToast("Select a category for each selected platform.", "error");
      return;
    }

    try {
      const submitFormData = new FormData();

      // Add all form fields (BodyIDs and categoryByPlatform sent separately as JSON)
      Object.keys(formData).forEach((key) => {
        if (key === "BodyIDs" || key === "categoryByPlatform") return;
        const val = formData[key];
        submitFormData.append(
          key,
          val === undefined || val === null ? "" : val,
        );
      });
      submitFormData.append("BodyIDs", JSON.stringify(bodyIds));
      submitFormData.append("BodyID", bodyIds[0] || "");
      submitFormData.append(
        "categoryByPlatform",
        JSON.stringify(categoryByPlatform),
      );

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

      let data;
      const responseText = await response.text();
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseErr) {
        console.error("Product save: response is not valid JSON", {
          status: response.status,
          statusText: response.statusText,
          preview: responseText.substring(0, 200),
        });
        throw new Error(
          `Server returned invalid response (${response.status}). This often means a server error, timeout, or payload limit. Check the browser console and server logs for details.`,
        );
      }

      if (!response.ok) {
        let msg =
          data.error && data.details
            ? `${data.error}: ${data.details}`
            : data.error || "Failed to save product";
        if (data.hint) msg += ` ${data.hint}`;
        throw new Error(msg);
      }

      showToast(
        editingProduct
          ? "Product updated successfully!"
          : "Product created successfully!",
        "success",
      );
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
      showToast(err.message, "error");
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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Product Management</h1>
          <p className="text-muted small mb-0">
            Add, edit, and manage products. Use filters to find specific
            products.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary rounded-pill px-4"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          <div className="row g-2 align-items-center mb-3 pb-3 border-bottom">
            <div className="col-auto admin-new-products-days">
              <label
                htmlFor="new-products-days"
                className="form-label admin-new-products-days-label mb-0"
              >
                New products display
              </label>
              <div className="d-flex align-items-center gap-2 admin-new-products-days-controls">
                <input
                  id="new-products-days"
                  type="number"
                  min={1}
                  max={9999}
                  className="form-control form-control-sm admin-new-products-days-input"
                  style={{ width: "80px" }}
                  value={newProductsDaysInput}
                  onChange={(e) => setNewProductsDaysInput(e.target.value)}
                />
                <span className="admin-new-products-days-suffix">days</span>
                <button
                  type="button"
                  className="btn btn-sm btn-primary admin-new-products-days-save"
                  onClick={saveNewProductsDays}
                  disabled={
                    newProductsDaysSaving ||
                    parseInt(newProductsDaysInput, 10) === newProductsDays
                  }
                >
                  {newProductsDaysSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
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
                Platform
              </label>
              <select
                id="filter-vehicle"
                className="form-select form-select-sm admin-filter-input"
                value={filterBodyId}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterBodyId(val);
                  if (!val) setFilterCategoryId("");
                }}
                style={{ minWidth: "180px" }}
              >
                <option value="">All Platforms</option>
                {bodiesByGroup.map(({ group, bodies: groupBodies }) => (
                  <optgroup key={group.id ?? "other"} label={group.name}>
                    {groupBodies.map((b) => (
                      <option key={b.BodyID} value={b.BodyID}>
                        {b.StartYear}-{b.EndYear} {b.Name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="col-auto">
              <label
                htmlFor="filter-category"
                className="form-label small mb-0"
              >
                Category
              </label>
              <select
                id="filter-category"
                className="form-select form-select-sm admin-filter-input"
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                disabled={!filterBodyId}
                style={{ minWidth: "160px" }}
              >
                <option value="">
                  {filterBodyId ? "All Categories" : "Select platform first"}
                </option>
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
                <option value="onsite">
                  On site (&lt;{newProductsDays} days)
                </option>
              </select>
            </div>
            <div className="col-auto d-flex gap-2">
              <button
                type="button"
                onClick={applyFilters}
                className="btn btn-sm btn-primary rounded-pill"
              >
                Apply filters
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-sm btn-outline-secondary rounded-pill"
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
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="card border-0 shadow-sm rounded-3 mb-4 overflow-hidden">
          <div className="card-body p-4">
            <h2 className="h3 fw-bold mb-4">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="admin-product-form">
              {/* Basic Information */}
              <div className="admin-form-section rounded-3 border-0 shadow-sm">
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
                    rows="16"
                    style={{ minHeight: "320px" }}
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
                      <label>
                        Quantity
                        {formData.BlemProduct === 1 && (
                          <span className="text-muted ms-1 small">
                            (Scratch &amp; Dent: limits availability)
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        name="Qty"
                        min="0"
                        className="form-control"
                        value={formData.Qty}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="admin-form-section rounded-3 border-0 shadow-sm">
                <h3 className="admin-form-section-title">Images</h3>
                <p className="text-muted small mb-3">
                  Main image plus up to 6 additional images. Select multiple at
                  once or add more in separate selections. Images save when you
                  create or update the product.
                </p>
                {imageSizeWarning && (
                  <div
                    className="alert alert-warning mb-3 py-2 px-3 d-flex align-items-start gap-2"
                    role="alert"
                  >
                    <span className="flex-shrink-0" aria-hidden="true">
                      ⚠
                    </span>
                    <span className="small">{imageSizeWarning}</span>
                  </div>
                )}
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                      <div className="card-body p-4">
                        <label className="form-label fw-semibold">
                          Main Image
                        </label>
                        <p className="text-muted small mb-2">
                          Always red if product comes in both red and black
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                          className="form-control form-control-sm mb-2"
                        />
                        {(mainImage ||
                          (formData.ImageLarge &&
                            formData.ImageLarge !== "0" &&
                            !mainImage)) && (
                          <div className="mt-2">
                            {mainImage ? (
                              <img
                                src={URL.createObjectURL(mainImage)}
                                alt="Selected"
                                className="img-fluid rounded"
                                style={{
                                  maxWidth: "200px",
                                  maxHeight: "200px",
                                  objectFit: "contain",
                                }}
                              />
                            ) : (
                              <img
                                src={getImageUrl(formData.ImageLarge)}
                                alt="Current main"
                                className="img-fluid rounded"
                                style={{
                                  maxWidth: "200px",
                                  maxHeight: "200px",
                                  objectFit: "contain",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                      <div className="card-body p-4">
                        <label className="form-label fw-semibold">
                          Additional Images (up to 6)
                        </label>
                        <p className="text-muted small mb-2">
                          Select multiple at once or add more in separate
                          selections. {additionalImages.length}/6 selected.
                        </p>
                        {additionalImages.length < MAX_ADDITIONAL_IMAGES && (
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleAdditionalImagesChange}
                            className="form-control form-control-sm mb-3"
                          />
                        )}
                        <div className="d-flex flex-wrap gap-2 align-items-start">
                          {additionalImages.length > 0
                            ? additionalImages.map((file, idx) => (
                                <div
                                  key={idx}
                                  className="position-relative d-inline-block"
                                >
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Additional ${idx + 1}`}
                                    className="rounded border"
                                    style={{
                                      maxWidth: "80px",
                                      maxHeight: "80px",
                                      objectFit: "contain",
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle rounded-circle p-0"
                                    style={{
                                      width: "22px",
                                      height: "22px",
                                      fontSize: "14px",
                                      lineHeight: "1",
                                    }}
                                    onClick={() => removeAdditionalImage(idx)}
                                    aria-label={`Remove image ${idx + 1}`}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))
                            : formData.Images &&
                              formData.Images !== "0" &&
                              formData.Images.split(",")
                                .filter(
                                  (img) =>
                                    img && img.trim() !== "" && img !== "0",
                                )
                                .map((img, idx) => {
                                  const imgSrc = img.trim();
                                  return (
                                    <img
                                      key={idx}
                                      src={getImageUrl(imgSrc)}
                                      alt={`Additional ${idx + 1}`}
                                      className="rounded border"
                                      style={{
                                        maxWidth: "80px",
                                        maxHeight: "80px",
                                        objectFit: "contain",
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                  );
                                })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {(mainImage || additionalImages.length > 0) &&
                  editingProduct && (
                    <div className="mt-3">
                      <button
                        type="button"
                        className="btn btn-primary rounded-pill px-4"
                        onClick={() => {
                          document
                            .querySelector(".admin-product-form")
                            ?.requestSubmit();
                        }}
                      >
                        Upload images &amp; save
                      </button>
                    </div>
                  )}
                {!editingProduct &&
                  (mainImage || additionalImages.length > 0) && (
                    <p className="text-success small mt-2 mb-0">
                      Images will be saved when you click &quot;Create
                      Product&quot; below.
                    </p>
                  )}
              </div>

              {/* Category & Platform */}
              <div className="admin-form-section rounded-3 border-0 shadow-sm">
                <h3 className="admin-form-section-title">
                  Category & Platform
                </h3>
                <div className="row">
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label>Platforms (Body) *</label>
                      <p className="small text-muted mb-2">
                        Select one or more platforms this part number fits.
                      </p>
                      <div
                        className="border rounded p-3 bg-light"
                        style={{ maxHeight: "320px", overflowY: "auto" }}
                      >
                        {bodiesByGroup.length === 0 ? (
                          <span className="text-muted small">
                            No platforms loaded.
                          </span>
                        ) : (
                          bodiesByGroup.map(
                            ({ group, bodies: groupBodies }) => (
                              <div key={group.id ?? "other"} className="mb-3">
                                <div
                                  className="fw-semibold small text-uppercase border-bottom pb-1 mb-2 text-dark"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  {group.name}
                                </div>
                                {groupBodies.map((body) => {
                                  const id = String(body.BodyID);
                                  const checked = (
                                    formData.BodyIDs || []
                                  ).includes(id);
                                  return (
                                    <div
                                      key={body.BodyID}
                                      className="form-check"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`platform-${body.BodyID}`}
                                        className="form-check-input"
                                        checked={checked}
                                        onChange={() =>
                                          handlePlatformToggle(body.BodyID)
                                        }
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor={`platform-${body.BodyID}`}
                                      >
                                        {body.StartYear}-{body.EndYear}{" "}
                                        {body.Name}
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            ),
                          )
                        )}
                      </div>
                      {(formData.BodyIDs || []).length === 0 && (
                        <small className="text-danger">
                          Select at least one platform
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      {(formData.BodyIDs || []).length > 1 ? (
                        <>
                          <label>Category per platform *</label>
                          <p className="small text-muted mb-2">
                            Select a category for each selected platform.
                          </p>
                          <div className="border rounded p-3 bg-light">
                            {(formData.BodyIDs || []).map((bid) => {
                              const body = bodies.find(
                                (b) => String(b.BodyID) === String(bid),
                              );
                              const platformLabel = body
                                ? `${body.StartYear}-${body.EndYear} ${body.Name}`
                                : `Platform ${bid}`;
                              const cats = categoriesByPlatform[bid] || [];
                              const value =
                                (formData.categoryByPlatform || {})[bid] || "";
                              return (
                                <div key={bid} className="mb-3">
                                  <label
                                    className="form-label small mb-1"
                                    htmlFor={`cat-platform-${bid}`}
                                  >
                                    {platformLabel}
                                  </label>
                                  <select
                                    id={`cat-platform-${bid}`}
                                    className="form-select form-select-sm"
                                    value={value}
                                    onChange={(e) =>
                                      handleCategoryForPlatform(
                                        bid,
                                        e.target.value,
                                      )
                                    }
                                    required
                                  >
                                    <option value="">Select category</option>
                                    {groupCategoriesByMain(cats).map(
                                      ({ group, categories: groupCats }) => (
                                        <optgroup
                                          key={group.id}
                                          label={group.name}
                                        >
                                          {groupCats.map((cat) => (
                                            <option
                                              key={cat.CatID}
                                              value={cat.CatID}
                                            >
                                              {cat.CatName}
                                            </option>
                                          ))}
                                        </optgroup>
                                      ),
                                    )}
                                  </select>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <>
                          <label>Category *</label>
                          <select
                            name="CatID"
                            className="form-select"
                            value={formData.CatID}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleInputChange(e);
                              const firstId = (formData.BodyIDs || [])[0];
                              if (firstId)
                                handleCategoryForPlatform(firstId, val);
                            }}
                            required
                            disabled={(formData.BodyIDs || []).length === 0}
                          >
                            <option value="">
                              {(formData.BodyIDs || []).length > 0
                                ? "Select Category"
                                : "Select Platform First"}
                            </option>
                            {groupCategoriesByMain(availableCategories).map(
                              ({ group, categories: groupCats }) => (
                                <optgroup key={group.id} label={group.name}>
                                  {groupCats.map((cat) => (
                                    <option key={cat.CatID} value={cat.CatID}>
                                      {cat.CatName}
                                    </option>
                                  ))}
                                </optgroup>
                              ),
                            )}
                          </select>
                          {(formData.BodyIDs || []).length === 0 && (
                            <small className="text-muted">
                              Please select at least one platform first
                            </small>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-3">
                    <div className="admin-form-group">
                      <label>Start Application Year</label>
                      <input
                        type="text"
                        name="StartAppYear"
                        className="form-control"
                        placeholder="e.g. 2008"
                        value={formData.StartAppYear}
                        onChange={handleInputChange}
                      />
                      <small className="text-muted">
                        Leave blank to use platform years
                      </small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="admin-form-group">
                      <label>End Application Year</label>
                      <input
                        type="text"
                        name="EndAppYear"
                        className="form-control"
                        placeholder="e.g. 2010"
                        value={formData.EndAppYear}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
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
                </div>
              </div>

              {/* Dimensions & Weight */}
              <div className="admin-form-section rounded-3 border-0 shadow-sm">
                <h3 className="admin-form-section-title">
                  Dimensions & Weight
                </h3>
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
              <div className="admin-form-section rounded-3 border-0 shadow-sm">
                <h3 className="admin-form-section-title">Options</h3>
                <div className="row">
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label>Color (hold Ctrl/Cmd to select multiple)</label>
                      <select
                        name="Color"
                        multiple
                        className="form-select"
                        size={Math.min(
                          Math.max(productOptions.colors.length, 8),
                          20,
                        )}
                        style={{ minHeight: "200px" }}
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
                      <label>
                        Hardware Packs (hold Ctrl/Cmd to select multiple)
                      </label>
                      <select
                        name="hardwarepacks"
                        multiple
                        className="form-select"
                        size={Math.min(
                          Math.max(productOptions.hardwarePacks.length, 8),
                          20,
                        )}
                        style={{ minHeight: "200px" }}
                        value={
                          formData.hardwarepacks
                            ? formData.hardwarepacks
                                .split(",")
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
                          setFormData({ ...formData, hardwarepacks: v });
                        }}
                      >
                        {productOptions.hardwarePacks.map((p) => (
                          <option key={p.ProductID} value={String(p.ProductID)}>
                            {p.PartNumber} – {p.ProductName}
                            {p.Price && p.Price !== "0" ? ` ($${p.Price})` : ""}
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">
                        Products from catalog where hardwarepack is checked
                      </small>
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
                  <div className="col-md-4 col-lg-3">
                    <div className="admin-form-group">
                      <label>Domestic Handling</label>
                      <input
                        type="text"
                        name="domhandling"
                        className="form-control form-control-sm"
                        value={formData.domhandling}
                        onChange={handleInputChange}
                        style={{ maxWidth: "120px" }}
                      />
                      <p className="text-muted small mt-1 mb-0">
                        Extra shipping charge for lower 48 states. Most products
                        ship free; a few large/heavy items charge shipping—this
                        field is for those.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="admin-form-section rounded-3 border-0 shadow-sm">
                <h3 className="admin-form-section-title">
                  Additional Information
                </h3>
                <div className="admin-form-group">
                  <label>Features</label>
                  <textarea
                    name="Features"
                    className="form-control"
                    rows="16"
                    style={{ minHeight: "320px" }}
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
                      New file: {instructionsPdfFile.name} (will replace
                      existing on save)
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
                  <div className="col-md-6">
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
                  <div className="col-md-6">
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
                </div>
              </div>

              {/* Flags */}
              <div className="admin-form-section rounded-3 border-0 shadow-sm">
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
                      <label className="form-check-label">
                        Featured Product
                      </label>
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

              {/* Display on site — modern toggle above save */}
              <div className="admin-form-section admin-display-toggle-section rounded-3 border-0 shadow-sm">
                <div className="admin-form-group d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <label className="admin-display-toggle-label mb-0">
                    Display on site
                  </label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.Display === 1}
                    aria-label="Display product on site"
                    className={`admin-toggle-switch ${formData.Display === 1 ? "admin-toggle-switch-on" : ""}`}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        Display: formData.Display === 1 ? 0 : 1,
                      })
                    }
                  >
                    <span className="admin-toggle-switch-thumb" />
                  </button>
                </div>
              </div>

              <div className="admin-form-actions">
                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4"
                >
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="card-body p-4">
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
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
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
                          ) : product.ImageSmall &&
                            product.ImageSmall !== "0" ? (
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
                            className="btn btn-sm btn-outline-primary rounded-pill me-1"
                            onClick={() => handleEdit(product)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill"
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
        </div>
      )}
    </div>
  );
}
