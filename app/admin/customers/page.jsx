"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { showToast } from "@/utlis/showToast";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [dealerTiers, setDealerTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("datecreated");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterRole, setFilterRole] = useState("all");
  const [filterDealerTier, setFilterDealerTier] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [datePreset, setDatePreset] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phonenumber: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    shippingfirstname: "",
    shippinglastname: "",
    shippingaddress1: "",
    shippingaddress2: "",
    shippingcity: "",
    shippingstate: "",
    shippingzip: "",
    shippingcountry: "",
    role: "customer",
    dealerTier: 0,
  });
  const [sendingReset, setSendingReset] = useState(false);

  const searchParams = useSearchParams();

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
      if (filterRole !== "all") params.set("role", filterRole);
      if (filterDealerTier !== "all")
        params.set("dealerTier", filterDealerTier);
      if (filterDateFrom) params.set("dateFrom", filterDateFrom);
      if (filterDateTo) params.set("dateTo", filterDateTo);

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
  }, [
    currentPage,
    perPage,
    debouncedSearch,
    sortColumn,
    sortDirection,
    filterRole,
    filterDealerTier,
    filterDateFrom,
    filterDateTo,
  ]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    fetch("/api/admin/dealer-tiers")
      .then((r) => r.json())
      .then((data) => setDealerTiers(data.tiers || []))
      .catch(() => setDealerTiers([]));
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const applyFilters = useCallback(() => setCurrentPage(1), []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearch("");
    setFilterRole("all");
    setFilterDealerTier("all");
    setFilterDateFrom("");
    setFilterDateTo("");
    setDatePreset("");
    setCurrentPage(1);
  }, []);

  const setDateRangePreset = useCallback((preset) => {
    setDatePreset(preset);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pad = (n) => String(n).padStart(2, "0");
    const fmt = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (preset === "today") {
      setFilterDateFrom(fmt(today));
      setFilterDateTo(fmt(today));
    } else if (preset === "yesterday") {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      setFilterDateFrom(fmt(y));
      setFilterDateTo(fmt(y));
    } else if (preset === "week") {
      const start = new Date(today);
      start.setDate(start.getDate() - start.getDay());
      setFilterDateFrom(fmt(start));
      setFilterDateTo(fmt(today));
    } else if (preset === "month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      setFilterDateFrom(fmt(start));
      setFilterDateTo(fmt(today));
    } else {
      setFilterDateFrom("");
      setFilterDateTo("");
    }
    setCurrentPage(1);
  }, []);

  const applyCustomerToForm = useCallback((customer) => {
    setFormData({
      firstname: customer.firstname ?? "",
      lastname: customer.lastname ?? "",
      email: customer.email ?? "",
      phonenumber: customer.phonenumber ?? "",
      address1: customer.address1 ?? "",
      address2: customer.address2 ?? "",
      city: customer.city ?? "",
      state: customer.state ?? "",
      zip: customer.zip ?? "",
      country: customer.country ?? "",
      shippingfirstname: customer.shippingfirstname ?? "",
      shippinglastname: customer.shippinglastname ?? "",
      shippingaddress1: customer.shippingaddress1 ?? "",
      shippingaddress2: customer.shippingaddress2 ?? "",
      shippingcity: customer.shippingcity ?? "",
      shippingstate: customer.shippingstate ?? "",
      shippingzip: customer.shippingzip ?? "",
      shippingcountry: customer.shippingcountry ?? "",
      role: customer.role || "customer",
      dealerTier: customer.dealerTier ?? 0,
    });
  }, []);

  const openEditByParam = useCallback(
    (customer) => {
      setEditingCustomer(customer);
      applyCustomerToForm(customer);
    },
    [applyCustomerToForm]
  );

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

  const handleEdit = useCallback(
    async (customer) => {
      setEditingCustomer(customer);
      if (
        customer.address1 !== undefined &&
        customer.shippingfirstname !== undefined
      ) {
        applyCustomerToForm(customer);
        return;
      }
      try {
        const res = await fetch(`/api/admin/customers/${customer.CustomerID}`);
        const data = await res.json();
        if (data.success && data.customer) {
          setEditingCustomer(data.customer);
          applyCustomerToForm(data.customer);
        } else {
          applyCustomerToForm(customer);
        }
      } catch (e) {
        console.error(e);
        applyCustomerToForm(customer);
      }
    },
    [applyCustomerToForm]
  );

  const handleSendPasswordReset = useCallback(async () => {
    if (!editingCustomer?.CustomerID) return;
    setSendingReset(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/customers/${editingCustomer.CustomerID}/send-password-reset`,
        { method: "POST" }
      );
      const data = await res.json();
      if (res.ok) {
        showToast(
          "Password reset email sent to the customer's email address.",
          "success"
        );
      } else {
        setError(data.error || "Failed to send password reset email");
      }
    } catch (err) {
      setError(err.message || "Failed to send password reset email");
    } finally {
      setSendingReset(false);
    }
  }, [editingCustomer?.CustomerID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        `/api/admin/customers/${editingCustomer.CustomerID}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || "Failed to update customer";
        if (
          response.status === 400 &&
          msg.toLowerCase().includes("email") &&
          msg.toLowerCase().includes("already in use")
        ) {
          showToast(
            "That email address is already in use by another customer.",
            "error"
          );
          setError("");
          return;
        }
        throw new Error(msg);
      }

      setEditingCustomer(null);
      fetchCustomers();
      showToast("Customer updated successfully!", "success");
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
      title="Click to sort"
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
            )
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

  const hasActiveFilters =
    searchTerm ||
    filterRole !== "all" ||
    filterDealerTier !== "all" ||
    filterDateFrom ||
    filterDateTo;

  if (loading && customers.length === 0) {
    return (
      <div className="admin-customers-page">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Customer Management</h1>
        </div>
        <div className="admin-card text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 mb-0 text-muted">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-customers-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Customer Management</h1>
      </div>

      {/* Filters - same look as admin products/orders */}
      <div className="admin-card mb-3">
        <div className="row g-2 align-items-end flex-wrap">
          <div className="col-auto">
            <label htmlFor="filter-search" className="form-label small mb-0">
              Name / email
            </label>
            <input
              id="filter-search"
              type="text"
              className="form-control form-control-sm admin-filter-input"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              style={{ minWidth: "180px" }}
            />
          </div>
          <div className="col-auto">
            <label htmlFor="filter-role" className="form-label small mb-0">
              Role
            </label>
            <select
              id="filter-role"
              className="form-select form-select-sm admin-filter-input"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="all">All</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="vendor">Vendor</option>
              <option value="dealer">Dealer</option>
            </select>
          </div>
          <div className="col-auto">
            <label htmlFor="filter-tier" className="form-label small mb-0">
              Dealer tier
            </label>
            <select
              id="filter-tier"
              className="form-select form-select-sm admin-filter-input"
              value={filterDealerTier}
              onChange={(e) => setFilterDealerTier(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="all">All</option>
              <option value="0">Non-dealers</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((t) => {
                const tierInfo = dealerTiers.find((dt) => dt.tier === t);
                const label = tierInfo?.name
                  ? `Tier ${t} (${tierInfo.name})`
                  : `Tier ${t}`;
                return (
                  <option key={t} value={t}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="col-auto">
            <label htmlFor="filter-date-from" className="form-label small mb-0">
              Date from
            </label>
            <input
              id="filter-date-from"
              type="date"
              className="form-control form-control-sm admin-filter-input"
              value={filterDateFrom}
              onChange={(e) => {
                setFilterDateFrom(e.target.value);
                setDatePreset("custom");
              }}
            />
          </div>
          <div className="col-auto">
            <label htmlFor="filter-date-to" className="form-label small mb-0">
              Date to
            </label>
            <input
              id="filter-date-to"
              type="date"
              className="form-control form-control-sm admin-filter-input"
              value={filterDateTo}
              onChange={(e) => {
                setFilterDateTo(e.target.value);
                setDatePreset("custom");
              }}
            />
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
            <span className="admin-view-label me-2">Joined:</span>
            <div
              className="btn-group btn-group-sm admin-date-presets"
              role="group"
              aria-label="Date range preset"
            >
              <input
                type="radio"
                className="btn-check"
                name="customersDatePreset"
                id="customers-preset-all"
                checked={datePreset === ""}
                onChange={() => setDateRangePreset("")}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor="customers-preset-all"
              >
                All
              </label>
              <input
                type="radio"
                className="btn-check"
                name="customersDatePreset"
                id="customers-preset-today"
                checked={datePreset === "today"}
                onChange={() => setDateRangePreset("today")}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor="customers-preset-today"
              >
                Today
              </label>
              <input
                type="radio"
                className="btn-check"
                name="customersDatePreset"
                id="customers-preset-yesterday"
                checked={datePreset === "yesterday"}
                onChange={() => setDateRangePreset("yesterday")}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor="customers-preset-yesterday"
              >
                Yesterday
              </label>
              <input
                type="radio"
                className="btn-check"
                name="customersDatePreset"
                id="customers-preset-week"
                checked={datePreset === "week"}
                onChange={() => setDateRangePreset("week")}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor="customers-preset-week"
              >
                This week
              </label>
              <input
                type="radio"
                className="btn-check"
                name="customersDatePreset"
                id="customers-preset-month"
                checked={datePreset === "month"}
                onChange={() => setDateRangePreset("month")}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor="customers-preset-month"
              >
                This month
              </label>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="admin-alert-error mb-3">{error}</div>}

      {editingCustomer && (
        <div className="admin-card mb-3">
          <h2 className="h5 fw-semibold mb-3">
            Edit Customer: {editingCustomer.firstname}{" "}
            {editingCustomer.lastname}
          </h2>
          <p className="text-muted small mb-3">
            Dealer discount is set by dealer tier on the Dealer Tiers page; it
            is not edited here.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="admin-form-group">
                  <label htmlFor="edit-firstname">First name *</label>
                  <input
                    id="edit-firstname"
                    type="text"
                    value={formData.firstname}
                    onChange={(e) =>
                      setFormData({ ...formData, firstname: e.target.value })
                    }
                    required
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="admin-form-group">
                  <label htmlFor="edit-lastname">Last name *</label>
                  <input
                    id="edit-lastname"
                    type="text"
                    value={formData.lastname}
                    onChange={(e) =>
                      setFormData({ ...formData, lastname: e.target.value })
                    }
                    required
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="admin-form-group">
                  <label htmlFor="edit-email">Email *</label>
                  <input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="admin-form-group">
                  <label htmlFor="edit-phone">Phone</label>
                  <input
                    id="edit-phone"
                    type="text"
                    value={formData.phonenumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phonenumber: e.target.value })
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="admin-form-group">
                  <label htmlFor="edit-address1">Address line 1</label>
                  <input
                    id="edit-address1"
                    type="text"
                    value={formData.address1}
                    onChange={(e) =>
                      setFormData({ ...formData, address1: e.target.value })
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="admin-form-group">
                  <label htmlFor="edit-address2">Address line 2</label>
                  <input
                    id="edit-address2"
                    type="text"
                    value={formData.address2}
                    onChange={(e) =>
                      setFormData({ ...formData, address2: e.target.value })
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="admin-form-group">
                  <label htmlFor="edit-city">City</label>
                  <input
                    id="edit-city"
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="admin-form-group">
                  <label htmlFor="edit-state">State</label>
                  <input
                    id="edit-state"
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="admin-form-group">
                  <label htmlFor="edit-zip">ZIP</label>
                  <input
                    id="edit-zip"
                    type="text"
                    value={formData.zip}
                    onChange={(e) =>
                      setFormData({ ...formData, zip: e.target.value })
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="admin-form-group">
                  <label htmlFor="edit-country">Country</label>
                  <input
                    id="edit-country"
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            <h3 className="h6 mt-4 mb-2">Shipping address</h3>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="admin-form-group">
                  <label htmlFor="edit-ship-firstname">First name</label>
                  <input
                    id="edit-ship-firstname"
                    type="text"
                    value={formData.shippingfirstname}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingfirstname: e.target.value,
                      })
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="admin-form-group">
                  <label htmlFor="edit-ship-lastname">Last name</label>
                  <input
                    id="edit-ship-lastname"
                    type="text"
                    value={formData.shippinglastname}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippinglastname: e.target.value,
                      })
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="admin-form-group">
                  <label htmlFor="edit-ship-address1">Address line 1</label>
                  <input
                    id="edit-ship-address1"
                    type="text"
                    value={formData.shippingaddress1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingaddress1: e.target.value,
                      })
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="admin-form-group">
                  <label htmlFor="edit-ship-address2">Address line 2</label>
                  <input
                    id="edit-ship-address2"
                    type="text"
                    value={formData.shippingaddress2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingaddress2: e.target.value,
                      })
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-3">
                <div className="admin-form-group">
                  <label htmlFor="edit-ship-city">City</label>
                  <input
                    id="edit-ship-city"
                    type="text"
                    value={formData.shippingcity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingcity: e.target.value,
                      })
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-3">
                <div className="admin-form-group">
                  <label htmlFor="edit-ship-state">State</label>
                  <input
                    id="edit-ship-state"
                    type="text"
                    value={formData.shippingstate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingstate: e.target.value,
                      })
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="admin-form-group">
                  <label htmlFor="edit-ship-zip">ZIP</label>
                  <input
                    id="edit-ship-zip"
                    type="text"
                    value={formData.shippingzip}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingzip: e.target.value,
                      })
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="admin-form-group">
                  <label htmlFor="edit-ship-country">Country</label>
                  <input
                    id="edit-ship-country"
                    type="text"
                    value={formData.shippingcountry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingcountry: e.target.value,
                      })
                    }
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            <div className="row g-3 mb-3">
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
                    <option value="dealer">Dealer</option>
                  </select>
                </div>
              </div>
              <div className="col-md-4">
                <div className="admin-form-group">
                  <label htmlFor="edit-tier">Dealer Tier (0 = none, 1–8)</label>
                  <input
                    id="edit-tier"
                    type="number"
                    name="dealerTier"
                    value={formData.dealerTier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dealerTier: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    min="0"
                    max="8"
                    className="form-control"
                    style={{ maxWidth: "100px" }}
                  />
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className="d-block small text-muted mb-1">Password</label>
              <button
                type="button"
                onClick={handleSendPasswordReset}
                disabled={sendingReset}
                className="btn btn-outline-secondary"
              >
                {sendingReset
                  ? "Sending…"
                  : "Send password reset email to this customer"}
              </button>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button type="submit" className="btn btn-primary">
                Update Customer
              </button>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="btn btn-outline-secondary"
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
          <table className="admin-table d-none d-md-table">
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
                        className={`badge ${
                          customer.role === "admin"
                            ? "bg-danger"
                            : customer.role === "vendor"
                            ? "bg-info"
                            : customer.role === "dealer"
                            ? "bg-primary"
                            : "bg-secondary"
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
                        className="btn btn-sm btn-outline-primary"
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

        {/* Mobile cards */}
        <div className="admin-customers-cards d-md-none">
          {customers.length === 0 ? (
            <p className="text-center text-secondary py-4 mb-0">
              No customers found
            </p>
          ) : (
            customers.map((customer) => (
              <div
                key={customer.CustomerID}
                className="admin-customer-card"
                onClick={() => handleEdit(customer)}
              >
                <div className="admin-customer-card-header">
                  <span className="fw-semibold">
                    {customer.firstname} {customer.lastname}
                  </span>
                  <span
                    className={`badge ${
                      customer.role === "admin"
                        ? "bg-danger"
                        : customer.role === "vendor"
                        ? "bg-info"
                        : customer.role === "dealer"
                        ? "bg-primary"
                        : "bg-secondary"
                    }`}
                  >
                    {customer.role || "customer"}
                  </span>
                </div>
                <div className="admin-customer-card-body">
                  <div className="small text-muted">{customer.email}</div>
                  <div className="d-flex gap-3 mt-2 small">
                    <span>Tier: {customer.dealerTier || 0}</span>
                    <span>Discount: {customer.dealerDiscount || 0}%</span>
                    <span>{formatDate(customer.datecreated)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
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
