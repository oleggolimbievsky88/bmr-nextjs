"use client";

import { useEffect, useMemo, useState } from "react";

function normalizeName(value) {
  const name = String(value ?? "").trim();
  return name && name !== "0" ? name : "";
}

export default function AdminManufacturersPage() {
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchList = async () => {
    try {
      setError("");
      const res = await fetch("/api/admin/manufacturers");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load manufacturers");
      }
      const data = await res.json();
      setManufacturers(data.manufacturers || []);
    } catch (err) {
      setError(err.message);
      setManufacturers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const resetForm = () => {
    setFormData({ name: "" });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    setFormData({ name: value });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: normalizeName(item?.ManName) });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const name = normalizeName(formData.name);
    if (!name) {
      setError("Manufacturer name is required");
      return;
    }

    setSaving(true);
    try {
      const url = editingItem
        ? `/api/admin/manufacturers/${editingItem.ManID}`
        : "/api/admin/manufacturers";
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSuccess(
        editingItem ? "Manufacturer updated." : "Manufacturer created.",
      );
      resetForm();
      await fetchList();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm("Delete this manufacturer?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/manufacturers/${item.ManID}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setManufacturers((prev) => prev.filter((m) => m.ManID !== item.ManID));
      setSuccess("Manufacturer deleted.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredManufacturers = useMemo(() => {
    const list = !searchTerm.trim()
      ? manufacturers
      : manufacturers.filter((m) =>
          normalizeName(m.ManName)
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase()),
        );
    return [...list].sort((a, b) => {
      const aName = normalizeName(a.ManName).toLowerCase();
      const bName = normalizeName(b.ManName).toLowerCase();
      if (aName === bName) return (b.ManID || 0) - (a.ManID || 0);
      return aName.localeCompare(bName);
    });
  }, [manufacturers, searchTerm]);

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
    <div className="admin-manufacturers py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Manufacturers</h1>
          <p className="text-muted small mb-0">
            Manage manufacturer names stored in the <code>mans</code> table.
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
          + Add manufacturer
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
              {editingItem ? "Edit manufacturer" : "Add manufacturer"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Manufacturer name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. BMR Suspension"
                />
              </div>
              <div className="admin-form-actions mt-3">
                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : editingItem
                      ? "Update manufacturer"
                      : "Create manufacturer"}
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
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span className="admin-products-count">
                {filteredManufacturers.length} manufacturer
                {filteredManufacturers.length !== 1 ? "s" : ""}
              </span>
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="manufacturer-search" className="small mb-0">
                  Search
                </label>
                <input
                  id="manufacturer-search"
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ minWidth: "180px" }}
                />
              </div>
            </div>
            {searchTerm && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </button>
            )}
          </div>
          {filteredManufacturers.length === 0 ? (
            <p className="text-muted mb-0">
              No manufacturers found. Click &quot;Add manufacturer&quot; to
              create one.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredManufacturers.map((item) => (
                    <tr key={item.ManID}>
                      <td>{item.ManID}</td>
                      <td className="fw-semibold">
                        {normalizeName(item.ManName) || "—"}
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
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
                            onClick={() => handleDelete(item)}
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
