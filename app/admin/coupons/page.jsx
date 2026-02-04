"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { showToast } from "@/utlis/showToast";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const formCardRef = useRef(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_cart_amount: "",
    max_discount_amount: "",
    start_date: "",
    end_date: "",
    start_time: "00:00:00",
    end_time: "23:59:59",
    usage_limit: "",
    usage_limit_per_customer: "1",
    free_shipping: false,
    shipping_discount: "",
    is_active: true,
    is_public: true,
    min_products: "1",
  });

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * perPage;
      const params = new URLSearchParams({
        limit: String(perPage),
        offset: String(offset),
      });
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("sortColumn", sortColumn);
      params.set("sortDirection", sortDirection);
      const response = await fetch(`/api/admin/coupons?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch coupons");
      }

      const list = data.coupons || [];
      const tot = typeof data.total === "number" ? data.total : list.length;
      setCoupons(list);
      setTotal(tot);
      if (list.length === 0 && currentPage > 1 && tot > 0) {
        setCurrentPage(1);
      }
      setError("");
    } catch (err) {
      setError(err.message);
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    perPage,
    searchQuery,
    statusFilter,
    sortColumn,
    sortDirection,
  ]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Filter-as-you-type: debounce search input into searchQuery
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      min_cart_amount: "",
      max_discount_amount: "",
      start_date: "",
      end_date: "",
      start_time: "00:00:00",
      end_time: "23:59:59",
      usage_limit: "",
      usage_limit_per_customer: "1",
      free_shipping: false,
      shipping_discount: "",
      is_active: true,
      is_public: true,
      min_products: "1",
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setShowForm(true);
    setFormData({
      code: coupon.code || "",
      name: coupon.name || "",
      description: coupon.description || "",
      discount_type: coupon.discount_type || "percentage",
      discount_value: coupon.discount_value || "",
      min_cart_amount: coupon.min_cart_amount || "",
      max_discount_amount: coupon.max_discount_amount || "",
      start_date: coupon.start_date ? coupon.start_date.split("T")[0] : "",
      end_date: coupon.end_date ? coupon.end_date.split("T")[0] : "",
      start_time: coupon.start_time || "00:00:00",
      end_time: coupon.end_time || "23:59:59",
      usage_limit: coupon.usage_limit || "",
      usage_limit_per_customer: coupon.usage_limit_per_customer || "1",
      free_shipping:
        coupon.free_shipping === 1 || coupon.free_shipping === true,
      shipping_discount: coupon.shipping_discount || "",
      is_active: coupon.is_active === 1 || coupon.is_active === true,
      is_public: coupon.is_public === 1 || coupon.is_public === true,
      min_products: coupon.min_products || "1",
    });
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const submitData = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        min_cart_amount: formData.min_cart_amount
          ? parseFloat(formData.min_cart_amount)
          : 0,
        max_discount_amount: formData.max_discount_amount
          ? parseFloat(formData.max_discount_amount)
          : null,
        usage_limit: formData.usage_limit
          ? parseInt(formData.usage_limit)
          : null,
        usage_limit_per_customer: parseInt(formData.usage_limit_per_customer),
        shipping_discount: formData.shipping_discount
          ? parseFloat(formData.shipping_discount)
          : 0,
        min_products: parseInt(formData.min_products),
      };

      let response;
      if (editingCoupon) {
        response = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        });
      } else {
        response = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save coupon");
      }

      resetForm();
      fetchCoupons();
      showToast(
        editingCoupon
          ? "Coupon updated successfully!"
          : "Coupon created successfully!",
        "success"
      );
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
      console.error("Error saving coupon:", err);
    }
  };

  const handleToggleActive = async (coupon) => {
    const isActive = coupon.is_active === 1 || coupon.is_active === true;
    const newActive = !isActive;
    setTogglingId(coupon.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newActive }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update coupon status");
      }
      await fetchCoupons();
      showToast(newActive ? "Coupon enabled." : "Coupon disabled.", "success");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
      console.error("Error toggling coupon:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (couponId) => {
    if (
      !confirm(
        "Are you sure you want to delete this coupon? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete coupon");
      }

      fetchCoupons();
      showToast("Coupon deleted successfully!", "success");
    } catch (err) {
      showToast(err.message, "error");
      console.error("Error deleting coupon:", err);
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalPages = Math.ceil(total / perPage) || 1;
  const PaginationBlock = () => {
    if (total <= 0) return null;
    return (
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="text-muted small">
            {total} coupon{total !== 1 ? "s" : ""}
          </span>
          <span className="text-muted small">
            Showing {Math.min((currentPage - 1) * perPage + 1, total)}–
            {Math.min(currentPage * perPage, total)} of {total}
          </span>
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
            aria-label="Coupons pagination"
            className="admin-products-pagination"
          >
            <ul className="pagination pagination-sm mb-0 flex-wrap">
              <li className={`page-item ${currentPage <= 1 ? "disabled" : ""}`}>
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
                  )
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
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
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
    );
  };

  if (loading && coupons.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 mb-0">Loading coupons...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Coupons Management</h1>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
            setTimeout(() => {
              formCardRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }, 100);
          }}
          className="admin-btn-primary"
        >
          + Add New Coupon
        </button>
      </div>

      {error && <div className="admin-alert-error">{error}</div>}

      {showForm && (
        <div ref={formCardRef} className="admin-card mb-4">
          <h2 className="h5 fw-6 mb-4">
            {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="admin-form-group">
                  <label>Coupon Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                    placeholder="SAVE20"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="admin-form-group">
                  <label>Coupon Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                    placeholder="Save $20"
                  />
                </div>
              </div>
            </div>
            <div className="admin-form-group mb-3">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-control"
                rows={3}
              />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="admin-form-group">
                  <label>Discount Type *</label>
                  <select
                    name="discount_type"
                    value={formData.discount_type}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="admin-form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    name="discount_value"
                    value={formData.discount_value}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="form-control"
                    placeholder="10 or 20.00"
                  />
                </div>
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="admin-form-group">
                  <label>Minimum Cart Amount</label>
                  <input
                    type="number"
                    name="min_cart_amount"
                    value={formData.min_cart_amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="form-control"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="admin-form-group">
                  <label>Max Discount Amount</label>
                  <input
                    type="number"
                    name="max_discount_amount"
                    value={formData.max_discount_amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="form-control"
                    placeholder="Leave empty for no limit"
                  />
                </div>
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="admin-form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="admin-form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="admin-form-group">
                  <label>Usage Limit</label>
                  <input
                    type="number"
                    name="usage_limit"
                    value={formData.usage_limit}
                    onChange={handleInputChange}
                    min="0"
                    className="form-control"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="admin-form-group">
                  <label>Usage Limit Per Customer</label>
                  <input
                    type="number"
                    name="usage_limit_per_customer"
                    value={formData.usage_limit_per_customer}
                    onChange={handleInputChange}
                    min="1"
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-3 mb-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="free_shipping"
                  id="coupon-free-shipping"
                  checked={formData.free_shipping}
                  onChange={handleInputChange}
                  className="form-check-input"
                />
                <label
                  htmlFor="coupon-free-shipping"
                  className="form-check-label"
                >
                  Free Shipping
                </label>
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  name="is_active"
                  id="coupon-is-active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="form-check-input"
                />
                <label htmlFor="coupon-is-active" className="form-check-label">
                  Active
                </label>
              </div>
            </div>
            <div className="admin-toolbar">
              <button type="submit" className="admin-btn-primary">
                {editingCoupon ? "Update Coupon" : "Create Coupon"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="admin-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card mb-3">
        <div className="row g-2 align-items-end flex-wrap">
          <div className="col-auto">
            <label
              htmlFor="coupon-filter-search"
              className="form-label small mb-0"
            >
              Search
            </label>
            <input
              id="coupon-filter-search"
              type="text"
              className="form-control form-control-sm admin-filter-input"
              style={{ minWidth: "360px" }}
              placeholder="Code, name, or description"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setSearchQuery(searchInput);
                  setCurrentPage(1);
                }
              }}
            />
          </div>
          <div className="col-auto">
            <label
              htmlFor="coupon-filter-status"
              className="form-label small mb-0"
            >
              Status
            </label>
            <select
              id="coupon-filter-status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select form-select-sm admin-filter-input"
              style={{ minWidth: "130px" }}
            >
              <option value="all">All Coupons</option>
              <option value="active">Active</option>
              <option value="inactive">Deactivated</option>
            </select>
          </div>
          <div className="col-auto d-flex gap-2">
            {(searchInput || searchQuery || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className="btn btn-sm btn-outline-secondary"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <PaginationBlock />

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <SortableTh column="code" label="Code" />
                <SortableTh column="name" label="Name" />
                <SortableTh column="discount_value" label="Discount" />
                <SortableTh column="start_date" label="Valid Period" />
                <SortableTh column="times_used" label="Usage" />
                <SortableTh column="is_active" label="Status" />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-secondary py-4">
                    No coupons found. Click &quot;Add New Coupon&quot; to create
                    one.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>
                      <strong>{coupon.code}</strong>
                    </td>
                    <td>{coupon.name}</td>
                    <td>
                      {coupon.discount_type === "percentage" && (
                        <span>{coupon.discount_value}%</span>
                      )}
                      {coupon.discount_type === "fixed_amount" && (
                        <span>${coupon.discount_value}</span>
                      )}
                      {coupon.discount_type === "free_shipping" && (
                        <span>Free Shipping</span>
                      )}
                    </td>
                    <td>
                      {formatDate(coupon.start_date)} -{" "}
                      {formatDate(coupon.end_date)}
                    </td>
                    <td>
                      {coupon.usage_limit
                        ? `${coupon.times_used || 0} / ${coupon.usage_limit}`
                        : `${coupon.times_used || 0} / ∞`}
                    </td>
                    <td>
                      <span
                        className={`admin-status-badge ${
                          coupon.is_active === 1 || coupon.is_active === true
                            ? "badge-active"
                            : "badge-inactive"
                        }`}
                      >
                        {coupon.is_active === 1 || coupon.is_active === true
                          ? "Active"
                          : "Deactivated"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(coupon)}
                        disabled={togglingId === coupon.id}
                        className="admin-btn-secondary me-2"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "13px" }}
                        title={
                          coupon.is_active === 1 || coupon.is_active === true
                            ? "Disable this coupon"
                            : "Enable this coupon"
                        }
                      >
                        {togglingId === coupon.id
                          ? "..."
                          : coupon.is_active === 1 || coupon.is_active === true
                          ? "Disable"
                          : "Enable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(coupon)}
                        className="admin-btn-secondary me-2"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "13px" }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(coupon.id)}
                        className="admin-btn-danger"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "13px" }}
                        title="Permanently delete this coupon"
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

      <div className="mt-3">
        <PaginationBlock />
      </div>
    </div>
  );
}
