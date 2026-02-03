"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("datecreated");
  const [sortDirection, setSortDirection] = useState("desc");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    role: "customer",
    dealerTier: 0,
    dealerDiscount: 0,
  });

  const fetchCustomers = useCallback(async () => {
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
      const response = await fetch(`/api/admin/customers?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch customers");
      }

      setCustomers(data.customers || []);
      const tot = typeof data.total === "number" ? data.total : 0;
      setTotal(tot);
      if ((data.customers || []).length === 0 && currentPage > 1 && tot > 0) {
        setCurrentPage(1);
      }
      setError("");
    } catch (err) {
      setError(err.message);
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, debouncedSearch, sortColumn, sortDirection]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const searchParams = useSearchParams();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openEditByParam = useCallback((customer) => {
    setEditingCustomer(customer);
    setFormData({
      role: customer.role || "customer",
      dealerTier: customer.dealerTier || 0,
      dealerDiscount: customer.dealerDiscount || 0,
    });
  }, []);

  useEffect(() => {
    const editCustomerId = searchParams.get("editCustomer");
    if (editCustomerId) {
      const id = parseInt(editCustomerId, 10);
      if (!Number.isNaN(id)) {
        fetch(`/api/admin/customers/${id}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.success && data.customer) {
              openEditByParam(data.customer);
            }
          })
          .catch(console.error);
      }
    }
  }, [searchParams, openEditByParam]);

  const handleEdit = openEditByParam;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        `/api/admin/customers/${editingCustomer.CustomerID}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update customer");
      }

      setEditingCustomer(null);
      fetchCustomers();
      alert("Customer updated successfully!");
    } catch (err) {
      setError(err.message);
      console.error("Error updating customer:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  const SortableTh = ({ column, label, className }) => (
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
      className={`sortable ${className || ""}`}
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

  const totalPages = Math.ceil(total / perPage) || 1;
  const paginationBlock = (
    <nav aria-label="Customer pagination" className="admin-products-pagination">
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
                className={`page-item ${p === currentPage ? "active" : ""}`}
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
          className={`page-item ${currentPage >= totalPages ? "disabled" : ""}`}
        >
          <button
            type="button"
            className="page-link"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );

  if (loading && customers.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 mb-0">Loading customers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Customer Management</h1>
        <div className="admin-toolbar">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ minWidth: "260px", maxWidth: "320px" }}
          />
          <button
            type="button"
            onClick={fetchCustomers}
            className="admin-btn-primary"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="admin-alert-error">{error}</div>}

      {editingCustomer && (
        <div className="admin-card mb-4">
          <h2 className="h5 fw-6 mb-4">
            Edit Customer: {editingCustomer.firstname}{" "}
            {editingCustomer.lastname}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="admin-form-group">
                  <label htmlFor="edit-role">Role *</label>
                  <select
                    id="edit-role"
                    name="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                    className="form-select"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>
              </div>
              <div className="col-md-4">
                <div className="admin-form-group">
                  <label htmlFor="edit-tier">Dealer Tier (1-8)</label>
                  <input
                    id="edit-tier"
                    type="number"
                    name="dealerTier"
                    value={formData.dealerTier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dealerTier: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    max="8"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="admin-form-group">
                  <label htmlFor="edit-discount">Dealer Discount (%)</label>
                  <input
                    id="edit-discount"
                    type="number"
                    name="dealerDiscount"
                    value={formData.dealerDiscount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dealerDiscount: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    max="100"
                    step="0.01"
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            <div className="admin-toolbar">
              <button type="submit" className="admin-btn-primary">
                Update Customer
              </button>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="admin-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span className="admin-products-count">
              {total} customer{total !== 1 ? "s" : ""}
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
          {total > perPage && paginationBlock}
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <SortableTh column="firstname" label="Customer" />
                <SortableTh column="email" label="Email" />
                <SortableTh column="role" label="Role" />
                <SortableTh
                  column="dealerTier"
                  label="Tier"
                  className="text-center"
                />
                <SortableTh
                  column="dealerDiscount"
                  label="Discount"
                  className="text-center"
                />
                <SortableTh column="datecreated" label="Joined" />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-secondary py-4">
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.CustomerID}>
                    <td>
                      {customer.firstname} {customer.lastname}
                    </td>
                    <td>{customer.email}</td>
                    <td>
                      <span
                        className={`admin-status-badge ${
                          customer.role === "admin"
                            ? "cancelled"
                            : customer.role === "vendor"
                              ? "processed"
                              : "pending"
                        }`}
                      >
                        {customer.role || "customer"}
                      </span>
                    </td>
                    <td className="text-center">{customer.dealerTier || 0}</td>
                    <td className="text-center">
                      {customer.dealerDiscount || 0}%
                    </td>
                    <td>{formatDate(customer.datecreated)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleEdit(customer)}
                        className="admin-btn-secondary"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "13px" }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {total > perPage && (
          <div className="d-flex justify-content-end mt-3">
            {paginationBlock}
          </div>
        )}
      </div>
    </div>
  );
}
