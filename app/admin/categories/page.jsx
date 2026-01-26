"use client";

import { useState, useEffect } from "react";

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState("categories"); // 'categories' or 'maincategories'
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [bodies, setBodies] = useState([]);
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

  useEffect(() => {
    fetchCategories();
    fetchMainCategories();
    fetchBodies();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
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

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData((prev) => ({
      ...prev,
      [name]: name === "ParentID" ? parseInt(value) : value,
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
    if (e.target.files && e.target.files[0]) {
      setCategoryImage(e.target.files[0]);
    }
  };

  const handleMainCategoryImageChange = (e) => {
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
      const response = await fetch(`/api/admin/categories/${category.CatID}`);
      const data = await response.json();
      if (response.ok) {
        setEditingItem(category);
        setCategoryFormData({
          CatName: data.category.CatName || "",
          CatImage: data.category.CatImage || "",
          MainCatID: data.category.MainCatID || "",
          ParentID: data.category.ParentID || 0,
        });
        setCategoryImage(null);
        setShowForm(true);
      }
    } catch (err) {
      setError("Failed to load category: " + err.message);
    }
  };

  const handleEditMainCategory = async (mainCategory) => {
    try {
      const response = await fetch(
        `/api/admin/maincategories/${mainCategory.MainCatID}`,
      );
      const data = await response.json();
      if (response.ok) {
        setEditingItem(mainCategory);
        setMainCategoryFormData({
          BodyID: data.mainCategory.BodyID || "",
          MainCatImage: data.mainCategory.MainCatImage || "",
          MainCatName: data.mainCategory.MainCatName || "",
        });
        setMainCategoryImage(null);
        setShowForm(true);
      }
    } catch (err) {
      setError("Failed to load main category: " + err.message);
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
      submitFormData.append("MainCatID", categoryFormData.MainCatID);
      submitFormData.append("ParentID", categoryFormData.ParentID.toString());

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
      fetchCategories();

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
      fetchMainCategories();

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
      const response = await fetch(`/api/admin/categories/${catId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      setSuccess("Category deleted successfully!");
      fetchCategories();
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
      const response = await fetch(`/api/admin/maincategories/${mainCatId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete main category");
      }

      setSuccess("Main category deleted successfully!");
      fetchMainCategories();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

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
      <div className="admin-page-header">
        <h1 className="admin-page-title">Category Management</h1>
        <div className="admin-toolbar">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${activeTab === "categories" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => {
                setActiveTab("categories");
                resetCategoryForm();
              }}
            >
              Categories
            </button>
            <button
              type="button"
              className={`btn ${activeTab === "maincategories" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => {
                setActiveTab("maincategories");
                resetMainCategoryForm();
              }}
            >
              Main Categories
            </button>
          </div>
          <button
            className="admin-btn-primary ms-3"
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

      {error && <div className="admin-alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {activeTab === "categories" && (
        <>
          {showForm && (
            <div className="admin-card">
              <h2 className="mb-4">
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
                          src={`https://bmrsuspension.com/siteart/categories/${categoryFormData.CatImage}`}
                          alt="Current category image"
                          style={{ maxWidth: "200px", maxHeight: "200px" }}
                        />
                      </div>
                    )}
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label>Main Category ID</label>
                      <input
                        type="text"
                        name="MainCatID"
                        className="form-control"
                        value={categoryFormData.MainCatID}
                        onChange={handleCategoryInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label>Parent ID</label>
                      <input
                        type="number"
                        name="ParentID"
                        className="form-control"
                        value={categoryFormData.ParentID}
                        onChange={handleCategoryInputChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="admin-btn-primary">
                    {editingItem ? "Update Category" : "Create Category"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={resetCategoryForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {!showForm && (
            <div className="admin-card">
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Category Name</th>
                      <th>Main Category</th>
                      <th>Platform</th>
                      <th>Image</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          No categories found
                        </td>
                      </tr>
                    ) : (
                      categories.map((category) => (
                        <tr key={category.CatID}>
                          <td>{category.CatID}</td>
                          <td>{category.CatName}</td>
                          <td>{category.MainCatName || "-"}</td>
                          <td>{category.PlatformName || "-"}</td>
                          <td>
                            {category.CatImage && category.CatImage !== "0" ? (
                              <img
                                src={`https://bmrsuspension.com/siteart/categories/${category.CatImage}`}
                                alt={category.CatName}
                                style={{ maxWidth: "50px", maxHeight: "50px" }}
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            <button
                              className="admin-btn-secondary me-2"
                              onClick={() => handleEditCategory(category)}
                            >
                              Edit
                            </button>
                            <button
                              className="admin-btn-danger"
                              onClick={() =>
                                handleDeleteCategory(category.CatID)
                              }
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
        </>
      )}

      {activeTab === "maincategories" && (
        <>
          {showForm && (
            <div className="admin-card">
              <h2 className="mb-4">
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
                  <label>Main Category Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainCategoryImageChange}
                    className="form-control"
                  />
                  {mainCategoryFormData.MainCatImage &&
                    mainCategoryFormData.MainCatImage !== "0" &&
                    !mainCategoryImage && (
                      <div className="mt-2">
                        <img
                          src={`https://bmrsuspension.com/siteart/categories/${mainCategoryFormData.MainCatImage}`}
                          alt="Current main category image"
                          style={{ maxWidth: "200px", maxHeight: "200px" }}
                        />
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
                    {bodies.map((body) => (
                      <option key={body.BodyID} value={body.BodyID}>
                        {body.StartYear}-{body.EndYear} {body.Name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="admin-btn-primary">
                    {editingItem
                      ? "Update Main Category"
                      : "Create Main Category"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={resetMainCategoryForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {!showForm && (
            <div className="admin-card">
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Main Category Name</th>
                      <th>Platform</th>
                      <th>Image</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mainCategories.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          No main categories found
                        </td>
                      </tr>
                    ) : (
                      mainCategories.map((mainCategory) => (
                        <tr key={mainCategory.MainCatID}>
                          <td>{mainCategory.MainCatID}</td>
                          <td>{mainCategory.MainCatName}</td>
                          <td>{mainCategory.PlatformName || "-"}</td>
                          <td>
                            {mainCategory.MainCatImage &&
                            mainCategory.MainCatImage !== "0" ? (
                              <img
                                src={`https://bmrsuspension.com/siteart/categories/${mainCategory.MainCatImage}`}
                                alt={mainCategory.MainCatName}
                                style={{ maxWidth: "50px", maxHeight: "50px" }}
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            <button
                              className="admin-btn-secondary me-2"
                              onClick={() =>
                                handleEditMainCategory(mainCategory)
                              }
                            >
                              Edit
                            </button>
                            <button
                              className="admin-btn-danger"
                              onClick={() =>
                                handleDeleteMainCategory(mainCategory.MainCatID)
                              }
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
        </>
      )}
    </div>
  );
}
