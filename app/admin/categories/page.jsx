"use client";

import { useState, useEffect, useMemo } from "react";
import { getCategoryImageUrl } from "@/lib/assets";

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState("categories");
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [bodies, setBodies] = useState([]);
  const [platformGroups, setPlatformGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    CatName: "",
    CatImage: "",
    MainCatID: "",
    ParentID: 0,
  });
  const [mainCategoryFormData, setMainCategoryFormData] = useState({
    BodyID: "",
    MainCatImage: "",
    MainCatName: "",
  });
  const [categoryImage, setCategoryImage] = useState(null);
  const [mainCategoryImage, setMainCategoryImage] = useState(null);

  // Filters and pagination (categories tab)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBodyId, setFilterBodyId] = useState("");
  const [filterMainCatId, setFilterMainCatId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Filter for main categories tab
  const [filterMainCatBodyId, setFilterMainCatBodyId] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        await Promise.all([
          fetchCategories(),
          fetchMainCategories(),
          fetchBodies(),
          fetchPlatformGroups(),
        ]);
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load data");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      } else {
        throw new Error(data.error || "Failed to fetch categories");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      throw err;
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
      if (response.ok && Array.isArray(data)) {
        setPlatformGroups(data);
      }
    } catch (err) {
      console.error("Error fetching platform groups:", err);
    }
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData((prev) => ({
      ...prev,
      [name]: name === "ParentID" ? parseInt(value, 10) : value,
    }));
  };

  const handleMainCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setMainCategoryFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryImageChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.files && e.target.files[0]) {
      setCategoryImage(e.target.files[0]);
    }
  };

  const handleMainCategoryImageChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.files && e.target.files[0]) {
      setMainCategoryImage(e.target.files[0]);
    }
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      CatName: "",
      CatImage: "",
      MainCatID: "",
      ParentID: 0,
    });
    setCategoryImage(null);
    setEditingItem(null);
    setShowForm(false);
  };

  const resetMainCategoryForm = () => {
    setMainCategoryFormData({
      BodyID: "",
      MainCatImage: "",
      MainCatName: "",
    });
    setMainCategoryImage(null);
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEditCategory = async (category) => {
    try {
      setError("");
      const response = await fetch(`/api/admin/categories/${category.CatID}`);
      const data = await response.json();
      if (response.ok) {
        setEditingItem(category);
        setCategoryFormData({
          CatName: data.category.CatName || "",
          CatImage: data.category.CatImage || "",
          MainCatID: data.category.MainCatID
            ? String(data.category.MainCatID)
            : "",
          ParentID: data.category.ParentID || 0,
        });
        setCategoryImage(null);
        setShowForm(true);
      } else {
        throw new Error(data.error || "Failed to load category");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditMainCategory = async (mainCategory) => {
    try {
      setError("");
      const response = await fetch(
        `/api/admin/maincategories/${mainCategory.MainCatID}`,
      );
      const data = await response.json();
      if (response.ok) {
        const mc = data.mainCategory || {};
        setEditingItem(mainCategory);
        setMainCategoryFormData({
          BodyID: mc.BodyID || mainCategory.BodyID || "",
          MainCatImage: mc.MainCatImage ?? mainCategory.MainCatImage ?? "",
          MainCatName: mc.MainCatName || mainCategory.MainCatName || "",
        });
        setMainCategoryImage(null);
        setShowForm(true);
      } else {
        throw new Error(data.error || "Failed to load main category");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const submitFormData = new FormData();
      submitFormData.append("CatName", categoryFormData.CatName);
      submitFormData.append("CatImage", categoryFormData.CatImage);
      submitFormData.append("MainCatID", categoryFormData.MainCatID || "0");
      submitFormData.append("ParentID", String(categoryFormData.ParentID || 0));

      if (categoryImage) {
        submitFormData.append("image", categoryImage);
      }

      const url = editingItem
        ? `/api/admin/categories/${editingItem.CatID}`
        : "/api/admin/categories";
      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: submitFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save category");
      }

      setSuccess(
        editingItem
          ? "Category updated successfully!"
          : "Category created successfully!",
      );
      resetCategoryForm();
      await fetchCategories();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMainCategorySubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const submitFormData = new FormData();
      submitFormData.append("BodyID", mainCategoryFormData.BodyID);
      submitFormData.append("MainCatImage", mainCategoryFormData.MainCatImage);
      submitFormData.append("MainCatName", mainCategoryFormData.MainCatName);

      if (mainCategoryImage) {
        submitFormData.append("image", mainCategoryImage);
      }

      const url = editingItem
        ? `/api/admin/maincategories/${editingItem.MainCatID}`
        : "/api/admin/maincategories";
      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: submitFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save main category");
      }

      setSuccess(
        editingItem
          ? "Main category updated successfully!"
          : "Main category created successfully!",
      );
      resetMainCategoryForm();
      await fetchMainCategories();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      setError("");
      const response = await fetch(`/api/admin/categories/${catId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      setSuccess("Category deleted successfully!");
      await fetchCategories();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteMainCategory = async (mainCatId) => {
    if (!confirm("Are you sure you want to delete this main category?")) {
      return;
    }

    try {
      setError("");
      const response = await fetch(`/api/admin/maincategories/${mainCatId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete main category");
      }

      setSuccess("Main category deleted successfully!");
      await fetchMainCategories();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Filtered and paginated categories
  const filteredCategories = useMemo(() => {
    let list = [...categories];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter(
        (c) =>
          (c.CatName && c.CatName.toLowerCase().includes(term)) ||
          (c.MainCatName && c.MainCatName.toLowerCase().includes(term)) ||
          (c.PlatformName && c.PlatformName.toLowerCase().includes(term)),
      );
    }

    if (filterBodyId) {
      const platformIdStr = String(filterBodyId);
      list = list.filter(
        (c) =>
          String(c.PlatformID) === platformIdStr ||
          String(c.BodyID) === platformIdStr,
      );
    }

    if (filterMainCatId) {
      list = list.filter(
        (c) => String(c.MainCatID) === String(filterMainCatId),
      );
    }

    return list;
  }, [categories, searchTerm, filterBodyId, filterMainCatId]);

  const totalFiltered = filteredCategories.length;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredCategories.slice(start, start + perPage);
  }, [filteredCategories, currentPage, perPage]);

  const totalPages = Math.ceil(totalFiltered / perPage) || 1;
  const hasActiveFilters = searchTerm.trim() || filterBodyId || filterMainCatId;

  const clearFilters = () => {
    setSearchTerm("");
    setFilterBodyId("");
    setFilterMainCatId("");
    setCurrentPage(1);
  };

  const clearMainCatFilters = () => {
    setFilterMainCatBodyId("");
  };

  // Filtered main categories
  const filteredMainCategories = useMemo(() => {
    if (!filterMainCatBodyId) return mainCategories;
    return mainCategories.filter(
      (mc) => String(mc.BodyID) === String(filterMainCatBodyId),
    );
  }, [mainCategories, filterMainCatBodyId]);

  const hasMainCatFilters = !!filterMainCatBodyId;

  // Platforms grouped by platform group, sorted A-Z
  const bodiesGroupedForSelect = useMemo(() => {
    const groupMap = new Map();
    const groupById = new Map(
      (platformGroups || []).map((g) => [String(g.id), g]),
    );
    bodies.forEach((b) => {
      const gid = String(b.platform_group_id ?? b.BodyCatID ?? 0);
      if (!groupMap.has(gid)) {
        const group = groupById.get(gid);
        groupMap.set(gid, {
          id: gid,
          name: group?.name || (gid === "0" ? "Other" : `Group ${gid}`),
          platforms: [],
        });
      }
      groupMap.get(gid).platforms.push(b);
    });
    const groups = Array.from(groupMap.values());
    groups.forEach((g) => {
      g.platforms.sort((a, b) =>
        (a.Name || "").localeCompare(b.Name || "", undefined, {
          sensitivity: "base",
        }),
      );
    });
    groups.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
    return groups;
  }, [bodies, platformGroups]);

  // Main categories filtered by body for dropdown
  const mainCategoriesForForm = useMemo(() => {
    if (!filterBodyId) return mainCategories;
    return mainCategories.filter(
      (mc) => String(mc.BodyID) === String(filterBodyId),
    );
  }, [mainCategories, filterBodyId]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-categories-page">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Category Management</h1>
          <p className="text-muted small mb-0">
            Manage categories and main categories. Use filters to find specific
            items.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-3 align-items-center">
          <div className="d-flex gap-2" role="group">
            <button
              type="button"
              className={`btn btn-sm ${
                activeTab === "categories"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              } rounded-pill`}
              onClick={() => {
                setActiveTab("categories");
                resetCategoryForm();
              }}
            >
              Categories
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                activeTab === "maincategories"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              } rounded-pill`}
              onClick={() => {
                setActiveTab("maincategories");
                resetMainCategoryForm();
              }}
            >
              Main Categories
            </button>
          </div>
          <button
            className="btn btn-primary rounded-pill px-4"
            onClick={() => {
              if (activeTab === "categories") {
                resetCategoryForm();
              } else {
                resetMainCategoryForm();
              }
              setShowForm(true);
            }}
          >
            + Add New{" "}
            {activeTab === "categories" ? "Category" : "Main Category"}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      {activeTab === "categories" && (
        <>
          {showForm && (
            <div className="card border-0 shadow-sm rounded-3 mb-4 overflow-hidden">
              <div className="card-body p-4">
                <h2 className="h4 fw-bold mb-4">
                  {editingItem ? "Edit Category" : "Add New Category"}
                </h2>
                <form
                  onSubmit={handleCategorySubmit}
                  className="admin-category-form"
                >
                  <div className="admin-form-group">
                    <label>Category Name *</label>
                    <input
                      type="text"
                      name="CatName"
                      className="form-control"
                      value={categoryFormData.CatName}
                      onChange={handleCategoryInputChange}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Category Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageChange}
                      className="form-control"
                    />
                    {categoryFormData.CatImage &&
                      categoryFormData.CatImage !== "0" &&
                      !categoryImage && (
                        <div className="mt-2">
                          <img
                            src={getCategoryImageUrl(categoryFormData.CatImage)}
                            alt="Current category image"
                            style={{ maxWidth: "200px", maxHeight: "200px" }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="admin-form-group">
                        <label>Main Category *</label>
                        <select
                          name="MainCatID"
                          className="form-select"
                          value={categoryFormData.MainCatID}
                          onChange={handleCategoryInputChange}
                          required
                        >
                          <option value="">Select Main Category</option>
                          {mainCategories.map((mc) => (
                            <option key={mc.MainCatID} value={mc.MainCatID}>
                              {mc.MainCatName}{" "}
                              {mc.PlatformName ? `(${mc.PlatformName})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="admin-form-group">
                        <label>Parent Category</label>
                        <select
                          name="ParentID"
                          className="form-select"
                          value={categoryFormData.ParentID}
                          onChange={handleCategoryInputChange}
                        >
                          <option value={0}>None</option>
                          {categories
                            .filter(
                              (c) =>
                                c.CatID !== editingItem?.CatID &&
                                categoryFormData.MainCatID &&
                                String(c.MainCatID) ===
                                  String(categoryFormData.MainCatID),
                            )
                            .map((c) => (
                              <option key={c.CatID} value={c.CatID}>
                                {c.CatName}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="admin-form-actions mt-3">
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill px-4"
                    >
                      {editingItem ? "Update Category" : "Create Category"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill px-4 ms-2"
                      onClick={resetCategoryForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {!showForm && (
            <>
              {/* Filters */}
              <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-body p-4">
                  <div className="row g-2 align-items-end flex-wrap">
                    <div className="col-auto">
                      <label
                        htmlFor="filter-cat-search"
                        className="form-label small mb-0"
                      >
                        Search
                      </label>
                      <input
                        id="filter-cat-search"
                        type="text"
                        className="form-control form-control-sm admin-filter-input"
                        placeholder="Category name or platform..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        style={{ minWidth: "180px" }}
                      />
                    </div>
                    <div className="col-auto">
                      <label
                        htmlFor="filter-cat-platform"
                        className="form-label small mb-0"
                      >
                        Platform
                      </label>
                      <select
                        id="filter-cat-platform"
                        className="form-select form-select-sm admin-filter-input"
                        value={filterBodyId}
                        onChange={(e) => {
                          setFilterBodyId(e.target.value);
                          if (!e.target.value) setFilterMainCatId("");
                          setCurrentPage(1);
                        }}
                        style={{ minWidth: "180px" }}
                      >
                        <option value="">All Platforms</option>
                        {bodiesGroupedForSelect.map((group) => (
                          <optgroup key={group.id} label={group.name}>
                            {group.platforms.map((b) => (
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
                        htmlFor="filter-cat-main"
                        className="form-label small mb-0"
                      >
                        Main Category
                      </label>
                      <select
                        id="filter-cat-main"
                        className="form-select form-select-sm admin-filter-input"
                        value={filterMainCatId}
                        onChange={(e) => {
                          setFilterMainCatId(e.target.value);
                          setCurrentPage(1);
                        }}
                        style={{ minWidth: "180px" }}
                      >
                        <option value="">All Main Categories</option>
                        {mainCategories
                          .filter(
                            (mc) =>
                              !filterBodyId ||
                              String(mc.BodyID) === String(filterBodyId),
                          )
                          .map((mc) => (
                            <option key={mc.MainCatID} value={mc.MainCatID}>
                              {mc.MainCatName}{" "}
                              {mc.PlatformName ? `(${mc.PlatformName})` : ""}
                            </option>
                          ))}
                      </select>
                    </div>
                    {hasActiveFilters && (
                      <div className="col-auto">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary rounded-pill"
                          onClick={clearFilters}
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* List */}
              <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      <span className="admin-products-count">
                        {totalFiltered} categor
                        {totalFiltered !== 1 ? "ies" : "y"}
                      </span>
                      {totalFiltered > 0 && (
                        <span className="text-muted small">
                          Showing{" "}
                          {Math.min(
                            (currentPage - 1) * perPage + 1,
                            totalFiltered,
                          )}
                          –{Math.min(currentPage * perPage, totalFiltered)} of{" "}
                          {totalFiltered}
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
                    {totalFiltered > perPage && (
                      <nav
                        aria-label="Category pagination"
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
                            const pages = [];
                            if (totalPages <= 5) {
                              for (let i = 1; i <= totalPages; i++)
                                pages.push(i);
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
                                <li
                                  key={`el-${i}`}
                                  className="page-item disabled"
                                >
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
                              currentPage >= totalPages ? "disabled" : ""
                            }`}
                          >
                            <button
                              type="button"
                              className="page-link"
                              onClick={() =>
                                setCurrentPage((p) =>
                                  Math.min(totalPages, p + 1),
                                )
                              }
                              disabled={currentPage >= totalPages}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    )}
                  </div>
                  <div className="admin-table-wrap table-responsive">
                    <table className="admin-table table">
                      <thead>
                        <tr>
                          <th>Category Name</th>
                          <th>Main Category</th>
                          <th>Platform</th>
                          <th className="d-none d-md-table-cell">Image</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCategories.length === 0 ? (
                          <tr>
                            <td
                              colSpan="5"
                              className="text-center py-4 text-muted"
                            >
                              No categories found
                            </td>
                          </tr>
                        ) : (
                          paginatedCategories.map((category) => (
                            <tr key={category.CatID}>
                              <td className="fw-semibold">
                                {category.CatName}
                              </td>
                              <td>{category.MainCatName || "—"}</td>
                              <td>
                                {category.PlatformName
                                  ? category.PlatformStartYear &&
                                    category.PlatformEndYear
                                    ? category.PlatformStartYear ===
                                      category.PlatformEndYear
                                      ? `${category.PlatformStartYear} ${category.PlatformName}`
                                      : `${category.PlatformStartYear}-${category.PlatformEndYear} ${category.PlatformName}`
                                    : category.PlatformName
                                  : "—"}
                              </td>
                              <td className="d-none d-md-table-cell">
                                {category.CatImage &&
                                category.CatImage !== "0" ? (
                                  <img
                                    src={getCategoryImageUrl(category.CatImage)}
                                    alt={category.CatName}
                                    style={{
                                      maxWidth: "50px",
                                      maxHeight: "50px",
                                      objectFit: "contain",
                                    }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = "none";
                                      const fallback =
                                        e.target.nextElementSibling;
                                      if (fallback)
                                        fallback.classList.remove(
                                          "visually-hidden",
                                        );
                                    }}
                                  />
                                ) : null}
                                <span
                                  className={
                                    category.CatImage &&
                                    category.CatImage !== "0"
                                      ? "visually-hidden"
                                      : ""
                                  }
                                >
                                  —
                                </span>
                              </td>
                              <td>
                                <div className="d-flex flex-wrap gap-1">
                                  <button
                                    className="btn btn-sm btn-outline-primary rounded-pill"
                                    onClick={() => handleEditCategory(category)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger rounded-pill"
                                    onClick={() =>
                                      handleDeleteCategory(category.CatID)
                                    }
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {activeTab === "maincategories" && (
        <>
          {showForm && (
            <div className="card border-0 shadow-sm rounded-3 mb-4 overflow-hidden">
              <div className="card-body p-4">
                <h2 className="h4 fw-bold mb-4">
                  {editingItem ? "Edit Main Category" : "Add New Main Category"}
                </h2>
                <form
                  onSubmit={handleMainCategorySubmit}
                  className="admin-maincategory-form"
                >
                  <div className="admin-form-group">
                    <label>Main Category Name *</label>
                    <input
                      type="text"
                      name="MainCatName"
                      className="form-control"
                      value={mainCategoryFormData.MainCatName}
                      onChange={handleMainCategoryInputChange}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Main Category Image (Banner)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainCategoryImageChange}
                      onClick={(e) => e.stopPropagation()}
                      className="form-control"
                    />
                    <p className="text-muted small mt-1 mb-0">
                      Select a file to replace. The image uploads when you click
                      Save.
                    </p>
                    {((mainCategoryFormData.MainCatImage &&
                      mainCategoryFormData.MainCatImage !== "0") ||
                      (editingItem?.MainCatImage &&
                        editingItem.MainCatImage !== "0")) &&
                      !mainCategoryImage && (
                        <div className="mt-2">
                          <img
                            src={getCategoryImageUrl(
                              mainCategoryFormData.MainCatImage ||
                                editingItem?.MainCatImage,
                            )}
                            alt="Current main category image"
                            style={{ maxWidth: "200px", maxHeight: "200px" }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                            }}
                          />
                          <p className="text-muted small mt-1 mb-0">
                            Current image (from storage). Upload a new file to
                            replace.
                          </p>
                        </div>
                      )}
                  </div>
                  <div className="admin-form-group">
                    <label>Platform (Body) *</label>
                    <select
                      name="BodyID"
                      className="form-select"
                      value={mainCategoryFormData.BodyID}
                      onChange={handleMainCategoryInputChange}
                      required
                    >
                      <option value="">Select Platform</option>
                      {bodiesGroupedForSelect.map((group) => (
                        <optgroup key={group.id} label={group.name}>
                          {group.platforms.map((body) => (
                            <option key={body.BodyID} value={body.BodyID}>
                              {body.StartYear}-{body.EndYear} {body.Name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-actions mt-3">
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill px-4"
                    >
                      {editingItem
                        ? "Update Main Category"
                        : "Create Main Category"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill px-4 ms-2"
                      onClick={resetMainCategoryForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {!showForm && (
            <>
              {/* Platform filter for main categories */}
              <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-body p-4">
                  <div className="row g-2 align-items-end flex-wrap">
                    <div className="col-auto">
                      <label
                        htmlFor="filter-maincat-platform"
                        className="form-label small mb-0"
                      >
                        Platform
                      </label>
                      <select
                        id="filter-maincat-platform"
                        className="form-select form-select-sm admin-filter-input"
                        value={filterMainCatBodyId}
                        onChange={(e) => setFilterMainCatBodyId(e.target.value)}
                        style={{ minWidth: "180px" }}
                      >
                        <option value="">All Platforms</option>
                        {bodiesGroupedForSelect.map((group) => (
                          <optgroup key={group.id} label={group.name}>
                            {group.platforms.map((b) => (
                              <option key={b.BodyID} value={b.BodyID}>
                                {b.StartYear}-{b.EndYear} {b.Name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    {hasMainCatFilters && (
                      <div className="col-auto">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary rounded-pill"
                          onClick={clearMainCatFilters}
                        >
                          Clear filter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="card-body p-4">
                  <div className="admin-table-wrap table-responsive">
                    <table className="admin-table table">
                      <thead>
                        <tr>
                          <th>Main Category Name</th>
                          <th>Platform</th>
                          <th className="d-none d-md-table-cell">Image</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMainCategories.length === 0 ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="text-center py-4 text-muted"
                            >
                              No main categories found
                            </td>
                          </tr>
                        ) : (
                          filteredMainCategories.map((mainCategory) => (
                            <tr key={mainCategory.MainCatID}>
                              <td className="fw-semibold">
                                {mainCategory.MainCatName}
                              </td>
                              <td>
                                {mainCategory.PlatformName
                                  ? mainCategory.PlatformStartYear &&
                                    mainCategory.PlatformEndYear
                                    ? mainCategory.PlatformStartYear ===
                                      mainCategory.PlatformEndYear
                                      ? `${mainCategory.PlatformStartYear} ${mainCategory.PlatformName}`
                                      : `${mainCategory.PlatformStartYear}-${mainCategory.PlatformEndYear} ${mainCategory.PlatformName}`
                                    : mainCategory.PlatformName
                                  : "—"}
                              </td>
                              <td className="d-none d-md-table-cell">
                                {mainCategory.MainCatImage &&
                                mainCategory.MainCatImage !== "0" ? (
                                  <img
                                    src={getCategoryImageUrl(
                                      mainCategory.MainCatImage,
                                    )}
                                    alt={mainCategory.MainCatName}
                                    style={{
                                      maxWidth: "50px",
                                      maxHeight: "50px",
                                      objectFit: "contain",
                                    }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td>
                                <div className="d-flex flex-wrap gap-1">
                                  <button
                                    className="btn btn-sm btn-outline-primary rounded-pill"
                                    onClick={() =>
                                      handleEditMainCategory(mainCategory)
                                    }
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger rounded-pill"
                                    onClick={() =>
                                      handleDeleteMainCategory(
                                        mainCategory.MainCatID,
                                      )
                                    }
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
