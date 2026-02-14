"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getColorBadgeStyle } from "@/lib/colorBadge";
import { showToast } from "@/utlis/showToast";
import { handleAdmin401 } from "@/lib/adminAuth";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [revealedCc, setRevealedCc] = useState(null);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("order_date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterOrderNumber, setFilterOrderNumber] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [datePreset, setDatePreset] = useState("");

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

    setFilterDateFrom(from);
    setFilterDateTo(to);
    setDatePreset(preset);
    setCurrentPage(1);
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * perPage;
      const params = new URLSearchParams({
        limit: String(perPage),
        offset: String(offset),
        sortColumn,
        sortDirection,
      });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (filterOrderNumber.trim())
        params.set("orderNumber", filterOrderNumber.trim());
      if (filterName.trim()) params.set("name", filterName.trim());
      if (filterDateFrom) params.set("dateFrom", filterDateFrom);
      if (filterDateTo) params.set("dateTo", filterDateTo);

      const response = await fetch(`/api/admin/orders?${params}`);
      if (handleAdmin401(response)) return;
      const data = await response.json();

      if (!response.ok) {
        let msg = data.error || "Failed to fetch orders";
        if (data.hint) msg += ". " + data.hint;
        if (data.detail) msg += " (" + data.detail + ")";
        throw new Error(msg);
      }

      setOrders(data.orders || []);
      const tot = typeof data.total === "number" ? data.total : 0;
      setTotal(tot);
      if ((data.orders || []).length === 0 && currentPage > 1 && tot > 0) {
        setCurrentPage(1);
      }
      setError("");
    } catch (err) {
      setError(err.message);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    perPage,
    statusFilter,
    sortColumn,
    sortDirection,
    filterOrderNumber,
    filterName,
    filterDateFrom,
    filterDateTo,
  ]);

  const searchParams = useSearchParams();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (orderId) {
      fetch(`/api/admin/orders?orderId=${orderId}`)
        .then((r) => {
          if (handleAdmin401(r)) return null;
          return r.json();
        })
        .then((data) => {
          if (data?.success && data?.order) {
            setRevealedCc(null);
            setSelectedOrder(data.order);
          }
        })
        .catch(console.error);
    }
  }, [searchParams]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const applyFilters = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterOrderNumber("");
    setFilterName("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setDatePreset("");
    setStatusFilter("all");
    setCurrentPage(1);
  }, []);

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

  const PaginationBlock = () => {
    const totalPages = Math.ceil(total / perPage) || 1;
    if (total <= 0) return null;
    return (
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="text-muted small">
            {total} order{total !== 1 ? "s" : ""}
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
            aria-label="Orders pagination"
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
    );
  };

  const OrderHistoryCollapse = ({ statusHistory, ccRevealLog, formatDate }) => {
    const [open, setOpen] = useState(false);
    const hasHistory = statusHistory?.length > 0 || ccRevealLog?.length > 0;
    return (
      <div className="admin-order-history">
        <button
          type="button"
          className="admin-order-history-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <span
            className="admin-order-history-caret"
            style={{
              transform: open ? "rotate(90deg)" : "none",
              transition: "transform 0.2s",
            }}
            aria-hidden="true"
          />
          <strong>Order History</strong>
          <span className="admin-order-history-badges">
            <span className="badge admin-badge-primary">
              {statusHistory?.length || 0} status
            </span>
            <span className="badge admin-badge-outline">
              {ccRevealLog?.length || 0} CC reveals
            </span>
          </span>
        </button>
        {open && (
          <div className="admin-order-history-body">
            {!hasHistory && (
              <div className="text-muted small">
                No history yet. Once someone changes status or clicks “Reveal
                card number”, it will show up here.
              </div>
            )}
            {statusHistory?.length > 0 && (
              <div className="mb-3">
                <div className="admin-order-history-section-title">
                  Status changes
                </div>
                <table className="table table-sm table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ fontWeight: "bold" }}>When</th>
                      <th style={{ fontWeight: "bold" }}>Who</th>
                      <th style={{ fontWeight: "bold" }}>Change</th>
                      <th style={{ fontWeight: "bold" }}>Tracking</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusHistory.map((entry) => (
                      <tr key={entry.id}>
                        <td>{formatDate(entry.created_at)}</td>
                        <td>
                          {entry.changed_by_name || entry.changed_by_email}
                          <br />
                          <span className="text-muted">
                            {entry.changed_by_email}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted">
                            {entry.previous_status || "—"}
                          </span>{" "}
                          <span aria-hidden="true">→</span>{" "}
                          <span className="fw-6 text-capitalize">
                            {entry.new_status}
                          </span>
                        </td>
                        <td>{entry.tracking_number || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {ccRevealLog?.length > 0 && (
              <div>
                <div className="admin-order-history-section-title">
                  CC number revealed
                </div>
                <table className="table table-sm table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Who</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ccRevealLog.map((entry) => (
                      <tr key={entry.id}>
                        <td>{formatDateWithSeconds(entry.revealed_at)}</td>
                        <td>
                          {entry.revealed_by_name || entry.revealed_by_email}
                          <br />
                          <span className="text-muted">
                            {entry.revealed_by_email}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const updateOrderStatus = async (
    orderId,
    newStatus,
    trackingNumber = null,
  ) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          tracking_number: trackingNumber || undefined,
        }),
      });
      if (handleAdmin401(response)) return;
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order status");
      }

      if (trackingNumber) {
        showToast(
          "Tracking number added and order marked as shipped.",
          "success",
        );
      }

      fetchOrders();
      if (selectedOrder?.new_order_id === orderId) {
        const freshRes = await fetch(`/api/admin/orders?orderId=${orderId}`);
        if (handleAdmin401(freshRes)) return;
        const fresh = await freshRes.json();
        if (fresh?.order) {
          setSelectedOrder(fresh.order);
        } else {
          setSelectedOrder({
            ...selectedOrder,
            status: newStatus,
            tracking_number: trackingNumber || selectedOrder.tracking_number,
          });
        }
      }
    } catch (err) {
      alert(err.message);
      console.error("Error updating order status:", err);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/admin/orders?orderId=${orderId}`);
      if (handleAdmin401(response)) return;
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch order details");
      }

      setRevealedCc(null);
      setSelectedOrder(data.order);
    } catch (err) {
      alert(err.message);
      console.error("Error fetching order details:", err);
    }
  };

  const printReceipt = (orderId) => {
    const printWindow = window.open(
      `/admin/orders/${orderId}/print`,
      "_blank",
      "width=800,height=600",
    );
    if (printWindow) {
      printWindow.focus();
    }
  };

  const getStatusSelectClass = (status) => {
    const v = status || "pending";
    return `form-select admin-status-select ${v}`;
  };

  const OrderStatusDropdown = ({ value, onSelect, size = "md" }) => {
    const current = value || "pending";
    const btnClass =
      size === "sm"
        ? `btn btn-sm admin-status-dropdown-btn ${current}`
        : `btn admin-status-dropdown-btn ${current}`;

    const statuses = [
      { value: "pending", label: "Pending" },
      { value: "processed", label: "Processed" },
      { value: "shipped", label: "Shipped" },
      { value: "delivered", label: "Delivered" },
      { value: "cancelled", label: "Cancelled" },
    ];

    return (
      <div className="dropdown">
        <button
          type="button"
          className={btnClass}
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <span className="text-capitalize">{current}</span>
          <span className="ms-2" aria-hidden="true">
            ▾
          </span>
        </button>
        <ul className="dropdown-menu admin-status-dropdown-menu">
          {statuses.map((s) => (
            <li key={s.value}>
              <button
                type="button"
                className={`dropdown-item admin-status-dropdown-item ${s.value}`}
                onClick={() => onSelect(s.value)}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateWithSeconds = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 mb-0">Loading orders...</p>
      </div>
    );
  }

  const hasActiveFilters =
    filterOrderNumber.trim() ||
    filterName.trim() ||
    filterDateFrom ||
    filterDateTo ||
    statusFilter !== "all";

  return (
    <div className="admin-orders-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Orders Management</h1>
      </div>

      {/* Filters: order number, name, date range */}
      <div className="admin-card mb-3">
        <div className="row g-2 align-items-end flex-wrap">
          <div className="col-auto">
            <label
              htmlFor="filter-order-number"
              className="form-label small mb-0"
            >
              Order number
            </label>
            <input
              id="filter-order-number"
              type="text"
              className="form-control form-control-sm admin-filter-input"
              placeholder="Order number"
              value={filterOrderNumber}
              onChange={(e) => setFilterOrderNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
          </div>
          <div className="col-auto">
            <label htmlFor="filter-name" className="form-label small mb-0">
              Name / email
            </label>
            <input
              id="filter-name"
              type="text"
              className="form-control form-control-sm admin-filter-input"
              placeholder="Customer name or email"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
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
              onChange={(e) => setFilterDateFrom(e.target.value)}
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
          <div className="col-auto">
            <label htmlFor="filter-status" className="form-label small mb-0">
              Status
            </label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select form-select-sm admin-filter-input"
              style={{ minWidth: "130px" }}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processed">Processed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="col-auto d-flex gap-2">
            <button
              type="button"
              onClick={applyFilters}
              className="admin-btn-primary admin-filter-button"
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
                name="ordersDatePreset"
                id="orders-preset-all"
                checked={datePreset === ""}
                onChange={() => setDateRangePreset("")}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor="orders-preset-all"
              >
                All
              </label>
              <input
                type="radio"
                className="btn-check"
                name="ordersDatePreset"
                id="orders-preset-today"
                checked={datePreset === "today"}
                onChange={() => setDateRangePreset("today")}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor="orders-preset-today"
              >
                Today
              </label>
              <input
                type="radio"
                className="btn-check"
                name="ordersDatePreset"
                id="orders-preset-yesterday"
                checked={datePreset === "yesterday"}
                onChange={() => setDateRangePreset("yesterday")}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor="orders-preset-yesterday"
              >
                Yesterday
              </label>
              <input
                type="radio"
                className="btn-check"
                name="ordersDatePreset"
                id="orders-preset-week"
                checked={datePreset === "week"}
                onChange={() => setDateRangePreset("week")}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor="orders-preset-week"
              >
                This week
              </label>
              <input
                type="radio"
                className="btn-check"
                name="ordersDatePreset"
                id="orders-preset-month"
                checked={datePreset === "month"}
                onChange={() => setDateRangePreset("month")}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor="orders-preset-month"
              >
                This month
              </label>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="admin-alert-error">{error}</div>}

      {selectedOrder && (
        <div
          className="admin-modal-backdrop"
          onClick={() => {
            setRevealedCc(null);
            setSelectedOrder(null);
          }}
          role="presentation"
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
          >
            <div className="admin-modal-header">
              <h2 id="order-modal-title">
                Order: {selectedOrder.order_number}
              </h2>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={() => printReceipt(selectedOrder.new_order_id)}
                  className="admin-btn-secondary"
                  style={{ fontSize: "14px", padding: "0.375rem 0.75rem" }}
                  title="Print Receipt"
                >
                  🖨️ Print
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRevealedCc(null);
                    setSelectedOrder(null);
                  }}
                  className="admin-modal-close"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="admin-modal-body">
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <h3 className="h6 fw-6 mb-2">
                    Billing <br />
                    Information
                  </h3>
                  <p className="mb-1">
                    {selectedOrder.billing_first_name}{" "}
                    {selectedOrder.billing_last_name}
                  </p>
                  <p className="mb-1">{selectedOrder.billing_address1}</p>
                  {selectedOrder.billing_address2 && (
                    <p className="mb-1">{selectedOrder.billing_address2}</p>
                  )}
                  <p className="mb-1">
                    {selectedOrder.billing_city}, {selectedOrder.billing_state}{" "}
                    {selectedOrder.billing_zip}
                  </p>
                  <p className="mb-1">{selectedOrder.billing_country}</p>
                  <p className="mb-1">{selectedOrder.billing_email}</p>
                  {selectedOrder.billing_phone && (
                    <p className="mb-1">{selectedOrder.billing_phone}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <h3 className="h6 fw-6 mb-2">Shipping Information</h3>
                  <p className="mb-1">
                    {selectedOrder.shipping_first_name}{" "}
                    {selectedOrder.shipping_last_name}
                  </p>
                  <p className="mb-1">{selectedOrder.shipping_address1}</p>
                  {selectedOrder.shipping_address2 && (
                    <p className="mb-1">{selectedOrder.shipping_address2}</p>
                  )}
                  <p className="mb-1">
                    {selectedOrder.shipping_city},{" "}
                    {selectedOrder.shipping_state} {selectedOrder.shipping_zip}
                  </p>
                  <p className="mb-1">{selectedOrder.shipping_country}</p>
                  <p className="mb-1">
                    <strong>Shipping method:</strong>{" "}
                    {selectedOrder.free_shipping && selectedOrder.coupon_code
                      ? `Free Shipping (Coupon: ${selectedOrder.coupon_code})`
                      : selectedOrder.free_shipping
                        ? "Free Shipping"
                        : selectedOrder.shipping_method || "—"}
                  </p>
                  {selectedOrder.free_shipping ? (
                    <p className="mb-1">
                      <span className="badge bg-success">
                        {selectedOrder.coupon_code
                          ? "Free (Coupon)"
                          : "Free Shipping"}
                      </span>
                    </p>
                  ) : (
                    <p className="mb-1">
                      <strong>Shipping cost:</strong>{" "}
                      {formatCurrency(selectedOrder.shipping_cost)}
                    </p>
                  )}
                  {selectedOrder.coupon_code && (
                    <p className="mb-0">
                      <strong>Coupon:</strong> {selectedOrder.coupon_code}
                    </p>
                  )}
                </div>
              </div>

              {selectedOrder.notes && selectedOrder.notes.trim() && (
                <div className="mb-4">
                  <h3 className="h6 fw-6 mb-2">Order Notes</h3>
                  <div
                    className="admin-order-notes p-3 rounded"
                    style={{
                      background: "#f8f9fa",
                      border: "1px solid #dee2e6",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {selectedOrder.notes}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="h6 fw-6 mb-2">Order Items</h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Part Number</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.new_order_item_id}>
                          <td>
                            <div>{item.product_name}</div>
                            {item.color != null &&
                              String(item.color).trim() !== "" && (
                                <span
                                  className="admin-color-badge"
                                  style={getColorBadgeStyle(item.color)}
                                >
                                  {item.color}
                                </span>
                              )}
                            {item.size != null &&
                              String(item.size).trim() !== "" && (
                                <span
                                  className="admin-color-badge ms-1"
                                  style={{
                                    background: "#64748b",
                                    color: "#fff",
                                  }}
                                >
                                  Size: {item.size}
                                </span>
                              )}
                          </td>
                          <td>{item.part_number}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">
                            {formatCurrency(item.price)}
                            {(parseFloat(item.line_discount) || 0) > 0 && (
                              <div className="text-success small">
                                Coupon: -{formatCurrency(item.line_discount)}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-end">
                  <div style={{ minWidth: "200px" }}>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>
                        {formatCurrency(
                          selectedOrder.total -
                            (parseFloat(selectedOrder.shipping_cost) || 0) -
                            (parseFloat(selectedOrder.tax) || 0) +
                            (parseFloat(selectedOrder.discount) || 0),
                        )}
                      </span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>Discount:</span>
                        <span>-{formatCurrency(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between mb-2">
                      <span>Shipping:</span>
                      <span>{formatCurrency(selectedOrder.shipping_cost)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tax:</span>
                      <span>
                        {formatCurrency(parseFloat(selectedOrder.tax) || 0)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between fw-7 border-top pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {(selectedOrder.cc_last_four ||
                selectedOrder.cc_payment_token ||
                selectedOrder.paypal_email) && (
                <div className="mb-4">
                  <h3 className="h6 fw-6 mb-2">Payment</h3>
                  {selectedOrder.payment_method === "PayPal" &&
                  selectedOrder.paypal_email ? (
                    <p className="mb-1">
                      PayPal ({selectedOrder.paypal_email})
                    </p>
                  ) : (
                    <p className="mb-1">
                      {selectedOrder.cc_type && (
                        <span>{selectedOrder.cc_type} </span>
                      )}
                      {selectedOrder.cc_last_four ? (
                        <span>****{selectedOrder.cc_last_four}</span>
                      ) : (
                        <span>••••</span>
                      )}
                      {selectedOrder.cc_exp_month &&
                        selectedOrder.cc_exp_year && (
                          <span className="ms-2">
                            Exp: {selectedOrder.cc_exp_month}/
                            {String(selectedOrder.cc_exp_year).slice(-2)}
                          </span>
                        )}
                    </p>
                  )}
                  {selectedOrder.payment_method !== "PayPal" &&
                    selectedOrder.cc_last_four && (
                      <button
                        type="button"
                        onClick={async () => {
                          setRevealedCc({
                            loading: true,
                            value: null,
                            error: null,
                          });
                          try {
                            const res = await fetch(
                              `/api/admin/orders/${selectedOrder.new_order_id}/decrypt-cc`,
                            );
                            if (handleAdmin401(res)) return;
                            const data = await res.json();
                            if (!res.ok)
                              throw new Error(
                                data.error || "Failed to decrypt",
                              );
                            setRevealedCc({
                              loading: false,
                              value: data.ccNumber || null,
                              error: null,
                            });
                            const freshRes = await fetch(
                              `/api/admin/orders?orderId=${selectedOrder.new_order_id}`,
                            );
                            if (handleAdmin401(freshRes)) return;
                            const fresh = await freshRes.json();
                            if (fresh?.order) setSelectedOrder(fresh.order);
                          } catch (e) {
                            setRevealedCc({
                              loading: false,
                              value: null,
                              error: e.message,
                            });
                          }
                        }}
                        className="admin-btn-secondary mt-1"
                        style={{ fontSize: "13px" }}
                        disabled={revealedCc?.loading}
                      >
                        {revealedCc?.loading ? "..." : "Reveal card number"}
                      </button>
                    )}
                  {revealedCc?.value != null && (
                    <div className="mt-2">
                      <code style={{ fontSize: "14px", letterSpacing: "1px" }}>
                        {revealedCc.value}
                      </code>
                      {selectedOrder.cc_ccv && (
                        <>
                          <br />
                          <code className="ms-2">
                            CCV: {selectedOrder.cc_ccv}
                          </code>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setRevealedCc(null)}
                        className="btn btn-link btn-sm ms-2"
                      >
                        Hide
                      </button>
                    </div>
                  )}
                  {selectedOrder.payment_method !== "PayPal" &&
                    revealedCc?.error && (
                      <p className="text-danger small mt-1">
                        {revealedCc.error}
                      </p>
                    )}
                </div>
              )}

              <div className="admin-form-group mb-4">
                <label htmlFor="tracking-number" className="form-label">
                  Primary Tracking Number
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    id="tracking-number"
                    className="form-control"
                    placeholder="Enter tracking number"
                    defaultValue={selectedOrder.tracking_number || ""}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      const trackingInput =
                        document.getElementById("tracking-number");
                      const trackingNumber = trackingInput.value.trim();
                      if (trackingNumber) {
                        updateOrderStatus(
                          selectedOrder.new_order_id,
                          "shipped",
                          trackingNumber,
                        );
                      }
                    }}
                  >
                    Update
                  </button>
                </div>
              </div>

              <div className="admin-form-group mb-4">
                <label className="form-label">
                  Additional Tracking Numbers
                </label>
                <ul className="list-group list-group-flush mb-2">
                  {(selectedOrder.tracking_numbers || []).map((t) => (
                    <li
                      key={t.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>
                        {t.tracking_number}
                        {t.carrier ? ` (${t.carrier})` : ""}
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={async () => {
                          try {
                            const res = await fetch(
                              `/api/admin/orders/${selectedOrder.new_order_id}/tracking/${t.id}`,
                              { method: "DELETE" },
                            );
                            if (handleAdmin401(res)) return;
                            if (res.ok) {
                              showToast("Tracking number removed", "success");
                              viewOrderDetails(selectedOrder.new_order_id);
                            } else {
                              const d = await res.json();
                              showToast(d.error || "Failed to remove", "error");
                            }
                          } catch (e) {
                            showToast(
                              "Failed to remove tracking number",
                              "error",
                            );
                          }
                        }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="text-muted small mb-2">
                  Paste multiple tracking numbers (one per line or
                  comma-separated) and click Add to add all.
                </p>
                <div className="input-group">
                  <input
                    type="text"
                    id="additional-tracking-number"
                    className="form-control"
                    placeholder="Tracking number (or paste multiple)"
                  />
                  <input
                    type="text"
                    id="additional-tracking-carrier"
                    className="form-control"
                    placeholder="Carrier (optional)"
                    style={{ maxWidth: "120px" }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={async () => {
                      const raw =
                        document
                          .getElementById("additional-tracking-number")
                          ?.value?.trim() || "";
                      const carrier =
                        document
                          .getElementById("additional-tracking-carrier")
                          ?.value?.trim() || null;
                      const numbers = raw
                        .split(/[\n,;]+/)
                        .map((n) => n.trim())
                        .filter(Boolean);
                      if (numbers.length === 0) return;
                      let added = 0;
                      for (const num of numbers) {
                        try {
                          const res = await fetch(
                            `/api/admin/orders/${selectedOrder.new_order_id}/tracking`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                tracking_number: num,
                                carrier,
                              }),
                            },
                          );
                          if (handleAdmin401(res)) return;
                          if (res.ok) {
                            added++;
                          } else {
                            const d = await res.json();
                            showToast(
                              d.error || `Failed to add ${num}`,
                              "error",
                            );
                          }
                        } catch (e) {
                          showToast(`Failed to add ${num}`, "error");
                        }
                      }
                      if (added > 0) {
                        document.getElementById(
                          "additional-tracking-number",
                        ).value = "";
                        document.getElementById(
                          "additional-tracking-carrier",
                        ).value = "";
                        showToast(
                          added === 1
                            ? "Tracking number added"
                            : `${added} tracking numbers added`,
                          "success",
                        );
                        viewOrderDetails(selectedOrder.new_order_id);
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Order History (at very end) */}
              <div className="mb-4">
                <OrderHistoryCollapse
                  statusHistory={selectedOrder.status_history || []}
                  ccRevealLog={selectedOrder.cc_reveal_log || []}
                  formatDate={formatDate}
                />
              </div>
              <div className="admin-toolbar d-flex flex-wrap align-items-center gap-3">
                <OrderStatusDropdown
                  value={selectedOrder.status}
                  onSelect={(newStatus) => {
                    if (newStatus === "shipped") {
                      const tracking = prompt(
                        "Enter tracking number (optional):",
                        selectedOrder.tracking_number || "",
                      );
                      updateOrderStatus(
                        selectedOrder.new_order_id,
                        newStatus,
                        tracking || null,
                      );
                    } else {
                      updateOrderStatus(
                        selectedOrder.new_order_id,
                        newStatus,
                        null,
                      );
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setRevealedCc(null);
                    setSelectedOrder(null);
                  }}
                  className="admin-btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card">
        <PaginationBlock />
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <SortableTh column="order_number" label="Order Number" />
                <SortableTh column="order_date" label="Date" />
                <SortableTh column="billing_last_name" label="Customer" />
                <th>Items</th>
                <th>Shipping</th>
                <SortableTh column="total" label="Total" />
                <SortableTh column="status" label="Status" />
                <th>Last Changed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-secondary py-4">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.new_order_id}>
                    <td>
                      <strong>{order.order_number}</strong>
                    </td>
                    <td>{formatDate(order.order_date)}</td>
                    <td>
                      {order.billing_first_name} {order.billing_last_name}
                      <br />
                      <small className="text-secondary">
                        {order.billing_email}
                      </small>
                    </td>
                    <td className="text-center">
                      {order.item_count || 0} items
                    </td>
                    <td className="small">
                      <span title={order.shipping_method || "—"}>
                        {order.free_shipping && order.coupon_code
                          ? `Free Shipping (Coupon: ${order.coupon_code})`
                          : order.free_shipping
                            ? "Free Shipping"
                            : order.shipping_method || "—"}
                      </span>
                      {order.coupon_code && !order.free_shipping && (
                        <span className="text-muted d-block small">
                          Coupon: {order.coupon_code}
                        </span>
                      )}
                      {order.free_shipping ? (
                        <span
                          className="badge bg-success ms-1"
                          title="Free shipping"
                        >
                          Free
                        </span>
                      ) : order.shipping_cost != null &&
                        parseFloat(order.shipping_cost) > 0 ? (
                        <span className="text-muted d-block small">
                          {formatCurrency(order.shipping_cost)}
                        </span>
                      ) : null}
                    </td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <span
                        className={`admin-status-badge ${
                          order.status || "pending"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="small">
                      {order.last_changed_at ? (
                        <>
                          {order.last_changed_by_name ||
                            order.last_changed_by_email}
                          <br />
                          <span className="text-muted">
                            {formatDate(order.last_changed_at)}
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => viewOrderDetails(order.new_order_id)}
                          className="admin-btn-secondary"
                          style={{
                            padding: "0.25rem 0.5rem",
                            fontSize: "13px",
                          }}
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => printReceipt(order.new_order_id)}
                          className="admin-btn-secondary"
                          style={{
                            padding: "0.25rem 0.5rem",
                            fontSize: "13px",
                          }}
                          title="Print Receipt"
                        >
                          🖨️
                        </button>
                        <OrderStatusDropdown
                          value={order.status}
                          size="sm"
                          onSelect={(newStatus) => {
                            if (newStatus === "shipped") {
                              const tracking = prompt(
                                "Enter tracking number (optional):",
                                order.tracking_number || "",
                              );
                              updateOrderStatus(
                                order.new_order_id,
                                newStatus,
                                tracking || null,
                              );
                            } else {
                              updateOrderStatus(
                                order.new_order_id,
                                newStatus,
                                null,
                              );
                            }
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginationBlock />
      </div>
    </div>
  );
}
