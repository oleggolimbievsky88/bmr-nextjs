"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

function formatPrice(val) {
  const n = parseFloat(val);
  if (Number.isNaN(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function formatDate(str) {
  if (!str) return "—";
  try {
    const d = new Date(str);
    return d.toLocaleString();
  } catch {
    return str;
  }
}

function formatShortDate(str) {
  if (!str) return "—";
  try {
    const d = new Date(str);
    return d.toLocaleDateString();
  } catch {
    return str;
  }
}

function InfoRow({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="dealer-po-detail-row">
      <span className="dealer-po-detail-label">{label}:</span>
      <span className="dealer-po-detail-value">{value}</span>
    </div>
  );
}

function AddressBlock({
  label,
  address1,
  address2,
  city,
  state,
  zip,
  country,
}) {
  const parts = [
    address1,
    address2,
    [city, state, zip].filter(Boolean).join(", "),
    country,
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <div className="dealer-po-detail-block">
      <div className="dealer-po-detail-block-title">{label}</div>
      <div className="dealer-po-detail-block-content">
        {parts.map((p, i) => (
          <div key={i}>{p}</div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDealerPOsPage() {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPoId, setSelectedPoId] = useState(null);
  const [poDetail, setPoDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("sent_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterPoNumber, setFilterPoNumber] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [datePreset, setDatePreset] = useState(""); // "", "today", "yesterday", "week", "month"
  const [appliedFilters, setAppliedFilters] = useState({});

  const setDateRangePreset = useCallback((preset) => {
    const today = new Date();
    const toStr = (d) => d.toISOString().slice(0, 10);

    let from = "";
    let to = "";

    if (preset === "today") {
      from = toStr(today);
      to = toStr(today);
    } else if (preset === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      from = toStr(yesterday);
      to = from;
    } else if (preset === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 6);
      from = toStr(weekAgo);
      to = toStr(today);
    } else if (preset === "month") {
      from = toStr(new Date(today.getFullYear(), today.getMonth(), 1));
      to = toStr(today);
    }
    // preset === "" means "all" - clear dates

    setFilterDateFrom(from);
    setFilterDateTo(to);
    setDatePreset(preset);
    setAppliedFilters((prev) => ({ ...prev, dateFrom: from, dateTo: to }));
    setCurrentPage(1);
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const offset = (currentPage - 1) * perPage;
      const params = new URLSearchParams({
        limit: String(perPage),
        offset: String(offset),
        sortColumn,
        sortDirection,
      });
      const af = appliedFilters;
      if (af.customer?.trim()) params.set("customer", af.customer.trim());
      if (af.poNumber?.trim()) params.set("poNumber", af.poNumber.trim());
      if (af.status?.trim()) params.set("status", af.status.trim());
      if (af.dateFrom) params.set("dateFrom", af.dateFrom);
      if (af.dateTo) params.set("dateTo", af.dateTo);
      const res = await fetch(`/api/admin/dealer-pos?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load POs");
      setPos(data.pos || []);
      setTotal(typeof data.total === "number" ? data.total : 0);
      if ((data.pos || []).length === 0 && currentPage > 1 && data.total > 0) {
        setCurrentPage(1);
      }
    } catch (err) {
      setError(err.message);
      setPos([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, sortColumn, sortDirection, appliedFilters]);

  const applyFilters = useCallback(() => {
    setAppliedFilters({
      customer: filterCustomer,
      poNumber: filterPoNumber,
      status: filterStatus,
      dateFrom: filterDateFrom,
      dateTo: filterDateTo,
    });
    setCurrentPage(1);
  }, [
    filterCustomer,
    filterPoNumber,
    filterStatus,
    filterDateFrom,
    filterDateTo,
  ]);

  // Debounced filter-as-you-type for Customer and PO Number
  const prevSearchRef = useRef("|");
  useEffect(() => {
    const searchKey = `${filterCustomer}|${filterPoNumber}`;
    if (prevSearchRef.current === searchKey) return;
    prevSearchRef.current = searchKey;
    const t = setTimeout(() => {
      applyFilters();
    }, 400);
    return () => clearTimeout(t);
  }, [filterCustomer, filterPoNumber, applyFilters]);

  const clearFilters = useCallback(() => {
    setFilterCustomer("");
    setFilterPoNumber("");
    setFilterStatus("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setDatePreset("");
    setAppliedFilters({});
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openDetail = useCallback(async (poId) => {
    setSelectedPoId(poId);
    setPoDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/dealer-pos/${poId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load PO");
      setPoDetail(data);
    } catch (err) {
      setPoDetail({ error: err.message });
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedPoId(null);
    setPoDetail(null);
  }, []);

  const handleSort = useCallback((column) => {
    setSortColumn((prev) => {
      setSortDirection((d) =>
        prev === column ? (d === "asc" ? "desc" : "asc") : "asc",
      );
      return column;
    });
    setCurrentPage(1);
  }, []);

  const totalPages = Math.ceil(total / perPage) || 1;
  const hasBilling =
    poDetail?.dealer &&
    [
      poDetail.dealer.address1,
      poDetail.dealer.address2,
      poDetail.dealer.city,
    ].some(Boolean);
  const hasShipping =
    poDetail?.dealer &&
    [
      poDetail.dealer.shippingaddress1,
      poDetail.dealer.shippingaddress2,
      poDetail.dealer.shippingcity,
    ].some(Boolean);

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

  const hasActiveFilters =
    filterCustomer.trim() ||
    filterPoNumber.trim() ||
    filterStatus.trim() ||
    filterDateFrom ||
    filterDateTo;

  return (
    <div className="admin-content admin-dealer-pos-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dealer Purchase Orders</h1>
      </div>

      {/* Filters */}
      <div className="admin-card mb-3">
        <div className="row g-2 align-items-end flex-wrap">
          <div className="col-auto">
            <label htmlFor="filter-customer" className="form-label small mb-0">
              Customer / Business
            </label>
            <input
              id="filter-customer"
              type="text"
              className="form-control form-control-sm, admin-filter-input"
              placeholder="Name or email"
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              style={{ minWidth: "180px" }}
            />
          </div>
          <div className="col-auto">
            <label htmlFor="filter-po-number" className="form-label small mb-0">
              PO Number / ID
            </label>
            <input
              id="filter-po-number"
              type="text"
              className="form-control form-control-sm, admin-filter-input"
              placeholder="PO # or ID"
              value={filterPoNumber}
              onChange={(e) => setFilterPoNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              style={{ minWidth: "120px" }}
            />
          </div>
          <div className="col-auto">
            <label htmlFor="filter-date-from" className="form-label small mb-0">
              Date From
            </label>
            <input
              id="filter-date-from"
              type="date"
              className="form-control form-control-sm, admin-filter-input"
              value={filterDateFrom}
              onChange={(e) => {
                setFilterDateFrom(e.target.value);
                setDatePreset("custom");
              }}
              style={{ minWidth: "140px" }}
            />
          </div>
          <div className="col-auto">
            <label htmlFor="filter-date-to" className="form-label small mb-0">
              Date To
            </label>
            <input
              id="filter-date-to"
              type="date"
              className="form-control form-control-sm, admin-filter-input"
              value={filterDateTo}
              onChange={(e) => {
                setFilterDateTo(e.target.value);
                setDatePreset("custom");
              }}
              style={{ minWidth: "140px" }}
            />
          </div>
          <div className="col-auto">
            <label htmlFor="filter-status" className="form-label small mb-0">
              Status
            </label>
            <select
              id="filter-status"
              className="form-select form-select-sm admin-filter-input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="">All</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="col-auto d-flex gap-2">
            <button
              type="button"
              onClick={applyFilters}
              className="btn btn-sm btn-primary admin-filter-button"
            >
              Apply
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-sm btn-outline-secondary admin-filter-button"
              >
                Clear
              </button>
            )}
          </div>
          <div className="col-12 mt-2 pt-2 border-top">
            <span className="admin-view-label me-2">View:</span>
            <div
              className="btn-group btn-group-sm admin-date-presets"
              role="group"
              aria-label="Date range preset"
            >
              <input
                type="radio"
                className="btn-check"
                name="datePreset"
                id="preset-all"
                checked={datePreset === ""}
                onChange={() => setDateRangePreset("")}
              />
              <label className="btn btn-outline-secondary" htmlFor="preset-all">
                All
              </label>
              <input
                type="radio"
                className="btn-check"
                name="datePreset"
                id="preset-today"
                checked={datePreset === "today"}
                onChange={() => setDateRangePreset("today")}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor="preset-today"
              >
                Today
              </label>
              <input
                type="radio"
                className="btn-check"
                name="datePreset"
                id="preset-yesterday"
                checked={datePreset === "yesterday"}
                onChange={() => setDateRangePreset("yesterday")}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor="preset-yesterday"
              >
                Yesterday
              </label>
              <input
                type="radio"
                className="btn-check"
                name="datePreset"
                id="preset-week"
                checked={datePreset === "week"}
                onChange={() => setDateRangePreset("week")}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor="preset-week"
              >
                This week
              </label>
              <input
                type="radio"
                className="btn-check"
                name="datePreset"
                id="preset-month"
                checked={datePreset === "month"}
                onChange={() => setDateRangePreset("month")}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor="preset-month"
              >
                This month
              </label>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 mb-0">Loading POs...</p>
        </div>
      ) : pos.length === 0 && total === 0 ? (
        <div className="admin-section-card">
          <div className="admin-section-body">
            <div className="alert alert-info mb-0">
              No dealer POs yet. POs appear here after dealers send them from
              their dashboard.
            </div>
          </div>
        </div>
      ) : (
        <div className="admin-section-card">
          <div className="admin-section-body p-0">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 px-3 pt-3 pb-2 border-bottom bg-light">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <span className="text-muted small">
                  {total} PO{total !== 1 ? "s" : ""}
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
                  aria-label="Dealer POs pagination"
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
            <div className="admin-table-wrap">
              <table className="admin-table table">
                <thead>
                  <tr>
                    <SortableTh column="id" label="ID" />
                    <SortableTh column="dealer" label="Dealer" />
                    <SortableTh column="tier" label="Tier" />
                    <SortableTh column="status" label="Status" />
                    <SortableTh column="item_count" label="Products" />
                    <SortableTh column="subtotal" label="Total" />
                    <SortableTh column="sent_at" label="Sent" />
                    <SortableTh column="created_at" label="Created" />
                    <th style={{ width: 100 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {pos.map((po) => (
                    <tr key={po.id}>
                      <td>
                        <span className="fw-semibold">{po.id}</span>
                      </td>
                      <td>
                        <div>
                          {po.firstname} {po.lastname}
                        </div>
                        {po.email && (
                          <span className="d-block small text-muted">
                            {po.email}
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        {po.dealerTier != null && po.dealerTier > 0
                          ? po.dealerTier
                          : "—"}
                      </td>
                      <td>
                        <span
                          className={`badge dealer-po-status-badge ${
                            po.status === "sent"
                              ? "dealer-po-status-sent"
                              : po.status === "completed"
                                ? "dealer-po-status-completed"
                                : po.status === "cancelled"
                                  ? "dealer-po-status-cancelled"
                                  : po.status === "processing"
                                    ? "dealer-po-status-processing"
                                    : "dealer-po-status-default"
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td>{po.item_count ?? 0}</td>
                      <td>{formatPrice(po.subtotal)}</td>
                      <td>{formatShortDate(po.sent_at)}</td>
                      <td>{formatShortDate(po.created_at)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openDetail(po.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedPoId && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dealerPODetailTitle"
        >
          <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold" id="dealerPODetailTitle">
                  PO #{selectedPoId}
                  {poDetail?.po?.po_number && (
                    <span className="text-muted fw-normal ms-2">
                      ({poDetail.po.po_number})
                    </span>
                  )}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeDetail}
                />
              </div>
              <div className="modal-body">
                {detailLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : poDetail?.error ? (
                  <div className="alert alert-danger">{poDetail.error}</div>
                ) : poDetail ? (
                  <div className="dealer-po-detail">
                    {/* Dealer Info Section */}
                    {poDetail.dealer && (
                      <div className="dealer-po-detail-section">
                        <h6 className="dealer-po-detail-section-title">
                          Dealer Information
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="dealer-po-detail-card">
                              <InfoRow
                                label="Customer ID"
                                value={poDetail.dealer.CustomerID}
                              />
                              <InfoRow
                                label="Name"
                                value={`${poDetail.dealer.firstname || ""} ${
                                  poDetail.dealer.lastname || ""
                                }`.trim()}
                              />
                              <InfoRow
                                label="Email"
                                value={poDetail.dealer.email}
                              />
                              <InfoRow
                                label="Phone"
                                value={poDetail.dealer.phonenumber}
                              />
                              <InfoRow
                                label="Role"
                                value={poDetail.dealer.role}
                              />
                              <InfoRow
                                label="Dealer Tier"
                                value={
                                  poDetail.dealer.dealerTier != null
                                    ? `Tier ${poDetail.dealer.dealerTier}`
                                    : null
                                }
                              />
                              <InfoRow
                                label="Discount"
                                value={
                                  poDetail.dealer.dealerDiscount != null ||
                                  poDetail.tierDiscount != null
                                    ? `${
                                        poDetail.dealer.dealerDiscount ??
                                        poDetail.tierDiscount ??
                                        0
                                      }%`
                                    : null
                                }
                              />
                              <div className="mt-2">
                                <Link
                                  href={`/admin/customers?editCustomer=${poDetail.dealer.CustomerID}`}
                                  className="btn btn-sm btn-outline-secondary"
                                >
                                  Edit Customer →
                                </Link>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            {hasBilling && (
                              <AddressBlock
                                label="Billing Address"
                                address1={poDetail.dealer.address1}
                                address2={poDetail.dealer.address2}
                                city={poDetail.dealer.city}
                                state={poDetail.dealer.state}
                                zip={poDetail.dealer.zip}
                                country={poDetail.dealer.country}
                              />
                            )}
                            {hasShipping && (
                              <AddressBlock
                                label="Shipping Address"
                                address1={poDetail.dealer.shippingaddress1}
                                address2={poDetail.dealer.shippingaddress2}
                                city={poDetail.dealer.shippingcity}
                                state={poDetail.dealer.shippingstate}
                                zip={poDetail.dealer.shippingzip}
                                country={poDetail.dealer.shippingcountry}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PO Notes */}
                    {(poDetail.po?.notes || poDetail.po?.admin_notes) && (
                      <div className="dealer-po-detail-section">
                        <h6 className="dealer-po-detail-section-title">
                          Notes
                        </h6>
                        {poDetail.po.notes && (
                          <div className="mb-2">
                            <strong>Dealer notes:</strong> {poDetail.po.notes}
                          </div>
                        )}
                        {poDetail.po.admin_notes && (
                          <div>
                            <strong>Admin notes:</strong>{" "}
                            {poDetail.po.admin_notes}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Past Orders */}
                    {poDetail.pastOrders?.length > 0 && (
                      <div className="dealer-po-detail-section">
                        <h6 className="dealer-po-detail-section-title">
                          Recent Orders
                        </h6>
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Order #</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Ship Method</th>
                                <th>Payment</th>
                                <th className="text-end">Subtotal</th>
                                <th className="text-end">Tax</th>
                                <th className="text-end">Ship $</th>
                                <th className="text-end">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {poDetail.pastOrders.map((o) => (
                                <tr key={o.new_order_id}>
                                  <td>
                                    <Link
                                      href={`/admin/orders?orderId=${o.new_order_id}`}
                                      className="text-decoration-none fw-semibold"
                                    >
                                      {o.order_number || o.new_order_id}
                                    </Link>
                                  </td>
                                  <td>{formatShortDate(o.order_date)}</td>
                                  <td>
                                    <span
                                      className={`badge ${
                                        o.status === "shipped" ||
                                        o.status === "delivered"
                                          ? "bg-success"
                                          : o.status === "cancelled"
                                            ? "bg-danger"
                                            : "bg-secondary"
                                      }`}
                                    >
                                      {o.status}
                                    </span>
                                  </td>
                                  <td className="small">
                                    {o.free_shipping
                                      ? "Free"
                                      : o.shipping_method || "—"}
                                  </td>
                                  <td className="small">
                                    {o.payment_method || "—"}
                                  </td>
                                  <td className="text-end">
                                    {formatPrice(o.subtotal)}
                                  </td>
                                  <td className="text-end">
                                    {formatPrice(o.tax)}
                                  </td>
                                  <td className="text-end">
                                    {o.free_shipping
                                      ? "Free"
                                      : formatPrice(o.shipping_cost)}
                                  </td>
                                  <td className="text-end fw-semibold">
                                    {formatPrice(o.total)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Line Items */}
                    <div className="dealer-po-detail-section">
                      <h6 className="dealer-po-detail-section-title">
                        Line Items
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered">
                          <thead>
                            <tr>
                              <th>Part #</th>
                              <th>Product</th>
                              <th>Qty</th>
                              <th>Color</th>
                              <th>Add-ons</th>
                              <th className="text-end">Unit price</th>
                              <th className="text-end">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(poDetail.items || []).map((i) => {
                              const addons = [
                                i.grease_name,
                                i.anglefinder_name,
                                i.hardware_name,
                                ...(Array.isArray(i.hardware_pack_names) &&
                                i.hardware_pack_names.length > 0
                                  ? i.hardware_pack_names
                                  : []),
                              ].filter(Boolean);
                              return (
                                <tr key={i.id}>
                                  <td>{i.part_number}</td>
                                  <td>{i.product_name}</td>
                                  <td>{i.quantity}</td>
                                  <td>{i.color_name || "—"}</td>
                                  <td className="small">
                                    {addons.length ? addons.join(", ") : "—"}
                                  </td>
                                  <td className="text-end">
                                    {formatPrice(i.unit_price)}
                                  </td>
                                  <td className="text-end">
                                    {formatPrice(
                                      (parseFloat(i.unit_price) || 0) *
                                        (i.quantity || 1),
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-2 fw-bold fs-5">
                        Subtotal:{" "}
                        {formatPrice(
                          (poDetail.items || []).reduce(
                            (s, i) =>
                              s +
                              (parseFloat(i.unit_price) || 0) *
                                (i.quantity || 1),
                            0,
                          ),
                        )}
                      </div>
                    </div>

                    {/* PO Meta */}
                    <div className="dealer-po-detail-meta text-muted small mt-3">
                      Created: {formatDate(poDetail.po?.created_at)} • Sent:{" "}
                      {formatDate(poDetail.po?.sent_at)}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeDetail}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
