"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminAttributeCategoriesPage() {
  const [attributeCategories, setAttributeCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sort_order: 0,
  });

  const fetchList = async () => {
    try {
      setError("");
      const res = await fetch("/api/admin/attribute-categories");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load attribute categories");
      }
      const data = await res.json();
      setAttributeCategories(data.attributeCategories || []);
    } catch (err) {
      setError(err.message);
      setAttributeCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const resetForm = () => {
    setFormData({ name: "", slug: "", sort_order: 0 });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "sort_order"
          ? value === ""
            ? 0
            : parseInt(value, 10)
          : value,
    }));
    if (name === "name" && !editingItem) {
      const slug = value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      slug: item.slug || "",
      sort_order: item.sort_order != null ? item.sort_order : 0,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const payload = {
        name: formData.name.trim(),
        slug: (formData.slug || formData.name)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-"),
        sort_order: formData.sort_order,
      };
      if (!payload.name) {
        setError("Name is required");
        return;
      }
      const url = editingItem
        ? `/api/admin/attribute-categories/${editingItem.id}`
        : "/api/admin/attribute-categories";
      const method = editingItem ? "PUT" : "POST";
      const body = editingItem
        ? {
            name: payload.name,
            slug: payload.slug,
            sort_order: payload.sort_order,
          }
        : payload;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSuccess(
        editingItem
          ? "Attribute category updated."
          : "Attribute category created.",
      );
      resetForm();
      await fetchList();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (itemId) => {
    if (
      !confirm(
        "Delete this attribute category? Attributes under it will no longer be assignable.",
      )
    )
      return;
    setError("");
    try {
      const res = await fetch(`/api/admin/attribute-categories/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }
      setAttributeCategories((prev) => prev.filter((a) => a.id !== itemId));
      setSuccess("Attribute category deleted.");
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
    <div className="admin-attribute-categories py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Attribute categories</h1>
          <p className="text-muted small mb-0">
            Manage attribute sets (e.g. Control Arms, Sway Bars). Each set has
            its own list of attributes. Assign an attribute set to products on
            the product form.
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
          + Add attribute category
        </button>
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

      {showForm && (
        <div className="card border-0 shadow-sm rounded-3 mb-4 overflow-hidden">
          <div className="card-body p-4">
            <h2 className="h4 fw-bold mb-4">
              {editingItem
                ? "Edit attribute category"
                : "Add attribute category"}
            </h2>
            <form onSubmit={handleSubmit} className="admin-category-form">
              <div className="row">
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Control Arms"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Slug *</label>
                    <input
                      type="text"
                      name="slug"
                      className="form-control"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. control-arms"
                    />
                  </div>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Sort order</label>
                <input
                  type="number"
                  name="sort_order"
                  className="form-control"
                  value={formData.sort_order}
                  onChange={handleInputChange}
                  min={0}
                  style={{ maxWidth: "120px" }}
                />
              </div>
              <div className="admin-form-actions mt-3">
                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4"
                >
                  {editingItem ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4 ms-2"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-body p-4">
          {attributeCategories.length === 0 ? (
            <p className="text-muted mb-0">
              No attribute categories yet. Click &quot;Add attribute
              category&quot; to create one (e.g. Control Arms, Sway Bars).
            </p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Attributes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attributeCategories.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-semibold">{item.name}</td>
                      <td>
                        <code>{item.slug}</code>
                      </td>
                      <td>{item.attributeCount ?? 0}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          <Link
                            href={`/admin/attribute-categories/${item.id}`}
                            className="btn btn-sm btn-outline-primary rounded-pill"
                          >
                            Manage attributes
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary rounded-pill"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-pill"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
