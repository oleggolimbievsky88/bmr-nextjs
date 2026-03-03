"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AdminAttributeCategoryAttributesPage() {
  const params = useParams();
  const id = params?.id;
  const [attributeCategory, setAttributeCategory] = useState(null);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    slug: "",
    label: "",
    type: "text",
    options: "",
    sort_order: 0,
  });
  const [manualOptions, setManualOptions] = useState("");
  const [useProductColors, setUseProductColors] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [catRes, attrsRes] = await Promise.all([
          fetch(`/api/admin/attribute-categories/${id}`),
          fetch(`/api/admin/category-attributes?attributeCategoryId=${id}`),
        ]);
        if (!catRes.ok) {
          const d = await catRes.json().catch(() => ({}));
          throw new Error(d.error || "Failed to load attribute category");
        }
        if (!attrsRes.ok) {
          const d = await attrsRes.json().catch(() => ({}));
          throw new Error(d.error || "Failed to load attributes");
        }
        const catData = await catRes.json();
        const attrsData = await attrsRes.json();
        if (isMounted) {
          setAttributeCategory(catData.attributeCategory || null);
          setCategoryAttributes(attrsData.categoryAttributes || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
  }, [id]);

  const resetForm = () => {
    setFormData({
      slug: "",
      label: "",
      type: "text",
      options: "",
      sort_order: 0,
    });
    setManualOptions("");
    setUseProductColors(false);
    setEditingItem(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "options") {
      setManualOptions(value);
    }
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "sort_order"
          ? value === ""
            ? 0
            : parseInt(value, 10)
          : value,
    }));
    if (name === "label" && !editingItem) {
      const slug = value
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleUseProductColorsChange = (e) => {
    const checked = e.target.checked;
    setUseProductColors(checked);
    setFormData((prev) => ({
      ...prev,
      options: checked ? "__product_colors__" : manualOptions,
    }));
  };

  const handleEdit = (attr) => {
    const optionsValue = attr.options != null ? String(attr.options) : "";
    const usingProductColors = optionsValue.trim() === "__product_colors__";
    setEditingItem(attr);
    setFormData({
      slug: attr.slug || "",
      label: attr.label || "",
      type: attr.type || "text",
      options: optionsValue,
      sort_order: attr.sort_order != null ? attr.sort_order : 0,
    });
    setManualOptions(usingProductColors ? "" : optionsValue);
    setUseProductColors(usingProductColors);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const payload = {
        attribute_category_id: Number(id),
        slug: formData.slug.trim(),
        label: formData.label.trim(),
        type: formData.type,
        options:
          formData.type === "select" || formData.type === "multiselect"
            ? (formData.options || "").trim() || null
            : null,
        sort_order: formData.sort_order,
      };
      if (!payload.slug || !payload.label) {
        setError("Slug and label are required");
        return;
      }
      const url = editingItem
        ? `/api/admin/category-attributes/${editingItem.id}`
        : "/api/admin/category-attributes";
      const method = editingItem ? "PUT" : "POST";
      const body = editingItem
        ? {
            slug: payload.slug,
            label: payload.label,
            type: payload.type,
            options: payload.options,
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
      setSuccess(editingItem ? "Attribute updated." : "Attribute added.");
      resetForm();
      const attrsRes = await fetch(
        `/api/admin/category-attributes?attributeCategoryId=${id}`,
      );
      const attrsData = await attrsRes.json();
      setCategoryAttributes(attrsData.categoryAttributes || []);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (attrId) => {
    if (!confirm("Delete this attribute?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/category-attributes/${attrId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }
      setCategoryAttributes((prev) => prev.filter((a) => a.id !== attrId));
      setSuccess("Attribute deleted.");
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

  if (!attributeCategory) {
    return (
      <div className="py-4">
        <div className="alert alert-danger">
          Attribute category not found.
          <Link href="/admin/attribute-categories" className="alert-link ms-2">
            Back to attribute categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-attribute-category-attributes py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <Link
            href="/admin/attribute-categories"
            className="text-muted small text-decoration-none mb-2 d-inline-block"
          >
            ← Back to attribute categories
          </Link>
          <h1 className="h3 fw-bold mb-1">
            Attributes for {attributeCategory.name}
          </h1>
          <p className="text-muted small mb-0">
            Add or edit attribute definitions for this attribute set. These will
            appear on the product form when this attribute set is selected.
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
          + Add attribute
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
              {editingItem ? "Edit attribute" : "Add attribute"}
            </h2>
            <form onSubmit={handleSubmit} className="admin-category-form">
              <div className="row">
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Label *</label>
                    <input
                      type="text"
                      name="label"
                      className="form-control"
                      value={formData.label}
                      onChange={handleInputChange}
                      required
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
                      placeholder="e.g. control_arm_style"
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Type</label>
                    <select
                      name="type"
                      className="form-select"
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      <option value="text">Text</option>
                      <option value="boolean">Boolean (Yes/No)</option>
                      <option value="select">Select (single)</option>
                      <option value="multiselect">
                        Multiselect (multiple)
                      </option>
                    </select>
                    <small className="text-muted d-block mt-1">
                      Text = one-line input; Boolean = Yes/No; Select =
                      dropdown; Multiselect = multiple choices (e.g. colors).
                    </small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label>Sort order</label>
                    <input
                      type="number"
                      name="sort_order"
                      className="form-control"
                      value={formData.sort_order}
                      onChange={handleInputChange}
                      min={0}
                    />
                  </div>
                </div>
              </div>
              {(formData.type === "select" ||
                formData.type === "multiselect") && (
                <div className="row mt-2">
                  <div className="col-12">
                    <div className="admin-form-group">
                      <label>Options</label>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="useProductColors"
                          checked={useProductColors}
                          onChange={handleUseProductColorsChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="useProductColors"
                        >
                          Use product color list
                        </label>
                      </div>
                      <textarea
                        name="options"
                        className="form-control font-monospace"
                        rows={4}
                        value={useProductColors ? "" : manualOptions}
                        onChange={handleInputChange}
                        placeholder="One option per line, or comma-separated."
                        disabled={useProductColors}
                      />
                      <small className="text-muted d-block mt-1">
                        One per line or comma-separated. Use the checkbox to
                        pull the product color list.
                      </small>
                    </div>
                  </div>
                </div>
              )}
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
          {categoryAttributes.length === 0 ? (
            <p className="text-muted mb-0">
              No attributes yet. Click &quot;Add attribute&quot; to create one.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table table">
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Slug</th>
                    <th>Type</th>
                    <th>Sort</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryAttributes.map((attr) => (
                    <tr key={attr.id}>
                      <td className="fw-semibold">{attr.label}</td>
                      <td>
                        <code>{attr.slug}</code>
                      </td>
                      <td>{attr.type}</td>
                      <td>{attr.sort_order}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary rounded-pill"
                            onClick={() => handleEdit(attr)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-pill"
                            onClick={() => handleDelete(attr.id)}
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
