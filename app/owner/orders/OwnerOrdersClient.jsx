"use client";

import { useEffect, useMemo, useState } from "react";

export default function OwnerOrdersClient({ initialBrand = "bmr" }) {
  const [mounted, setMounted] = useState(false);
  const [brand, setBrand] = useState(
    String(initialBrand || "bmr")
      .trim()
      .toLowerCase(),
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState("");
  const [ccType, setCcType] = useState("");
  const [passwordAOnly, setPasswordAOnly] = useState(false);
  const [limit, setLimit] = useState(50);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [brandDbConfigured, setBrandDbConfigured] = useState(null);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (brand) p.set("brand", brand);
    if (dateFrom) p.set("dateFrom", dateFrom);
    if (dateTo) p.set("dateTo", dateTo);
    if (email.trim()) p.set("email", email.trim());
    if (name.trim()) p.set("name", name.trim());
    if (paymentMethod) p.set("paymentMethod", paymentMethod);
    if (status) p.set("status", status);
    if (ccType.trim()) p.set("ccType", ccType.trim());
    if (passwordAOnly) p.set("passwordAOnly", "1");
    p.set("limit", String(limit));
    return p;
  }, [
    brand,
    dateFrom,
    dateTo,
    email,
    name,
    paymentMethod,
    status,
    ccType,
    passwordAOnly,
    limit,
  ]);

  const exportUrl = useMemo(() => {
    const p = new URLSearchParams(params);
    p.delete("limit");
    return `/api/owner/orders/export?${p.toString()}`;
  }, [params]);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/owner/orders?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load orders");
      setHeaders(Array.isArray(data.headers) ? data.headers : []);
      setRows(Array.isArray(data.rows) ? data.rows : []);
      setBrandDbConfigured(
        typeof data.brandDbConfigured === "boolean"
          ? data.brandDbConfigured
          : null,
      );
    } catch (e) {
      setError(e.message || String(e));
      setHeaders([]);
      setRows([]);
      setBrandDbConfigured(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Brand switching should be immediate (otherwise it feels broken).
  useEffect(() => {
    fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand]);

  const visibleHeaders = useMemo(() => {
    if (showAllColumns) return headers;
    return headers.slice(0, 16);
  }, [headers, showAllColumns]);

  return (
    <div className="container py-4" style={{ overflowX: "hidden" }}>
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
        <div>
          <h1 className="h3 mb-1">Online Orders</h1>
          <div className="text-muted">
            Preview results, then export as CSV (Google Sheets friendly).
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={fetchPreview}
            disabled={loading}
          >
            {loading ? "Loading…" : "Apply filters"}
          </button>
          <a className="btn btn-primary" href={exportUrl}>
            Export CSV
          </a>
        </div>
      </div>

      <div className="card mb-3" style={{ maxWidth: "100%" }}>
        <div className="card-body">
          {!mounted ? (
            <div className="text-muted small">Loading filters…</div>
          ) : (
            <div className="row g-3 flex-wrap" style={{ flexWrap: "wrap" }}>
              <div className="col-12 col-md-3">
                <label className="form-label">Brand</label>
                <select
                  className="form-select"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  suppressHydrationWarning
                >
                  <option value="bmr">BMR</option>
                  <option value="controlfreak">Control Freak</option>
                </select>
                <div className="form-text text-break" style={{ maxWidth: 320 }}>
                  Uses <code>DATABASE_URL_BMR</code> /{" "}
                  <code>DATABASE_URL_CONTROLFREAK</code> (if set).
                </div>
                {brandDbConfigured === false && (
                  <div className="form-text text-warning">
                    Brand DB not configured on server; using default DB.
                  </div>
                )}
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label">Date from</label>
                <input
                  type="date"
                  className="form-control, order-form-control"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  suppressHydrationWarning
                />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label">Date to</label>
                <input
                  type="date"
                  className="form-control, order-form-control"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  suppressHydrationWarning
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label">Email</label>
                <input
                  type="text"
                  className="form-control, order-form-control"
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  suppressHydrationWarning
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control, order-form-control"
                  placeholder="First / last"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  suppressHydrationWarning
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label">Payment method</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  suppressHydrationWarning
                >
                  <option value="">Any</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label">CC type</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Visa / MasterCard / Amex..."
                  value={ccType}
                  onChange={(e) => setCcType(e.target.value)}
                  suppressHydrationWarning
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label">Order status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  suppressHydrationWarning
                >
                  <option value="">Any</option>
                  <option value="__not_cancelled">Not cancelled</option>
                  <option value="pending">Pending</option>
                  <option value="processed">Processed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label">Rows</label>
                <select
                  className="form-select"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                  suppressHydrationWarning
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label d-block">Customer filters</label>
                <label className="form-check-label d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={passwordAOnly}
                    onChange={(e) => setPasswordAOnly(e.target.checked)}
                    suppressHydrationWarning
                  />
                  Has <code className="mb-0">password_a</code> (not
                  false/0/empty)
                </label>
              </div>

              <div className="col-12 d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                    setEmail("");
                    setName("");
                    setPaymentMethod("");
                    setStatus("");
                    setCcType("");
                    setPasswordAOnly(false);
                    setLimit(50);
                    setShowAllColumns(false);
                  }}
                >
                  Clear
                </button>
                <div className="text-muted align-self-center">
                  Export link:{" "}
                  <code style={{ wordBreak: "break-all" }}>{exportUrl}</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
            <div className="text-muted">
              Showing <strong>{rows.length}</strong> row
              {rows.length === 1 ? "" : "s"}.
            </div>
            {headers.length > 16 && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowAllColumns((v) => !v)}
              >
                {showAllColumns ? "Show fewer columns" : "Show all columns"}
              </button>
            )}
          </div>

          <div style={{ overflowX: "auto", maxWidth: "100%" }}>
            <table
              className="table table-sm table-striped align-middle mb-0"
              style={{ minWidth: "max-content" }}
            >
              <thead>
                <tr>
                  {visibleHeaders.map((h) => (
                    <th key={h} style={{ whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={Math.max(1, visibleHeaders.length)}>
                      <div className="text-muted py-3 text-center">
                        No rows found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr
                      key={
                        row?.["O_new_order_id"] ??
                        row?.["O_order_number"] ??
                        idx
                      }
                    >
                      {visibleHeaders.map((h) => (
                        <td
                          key={h}
                          style={{
                            whiteSpace: "nowrap",
                            maxWidth: 320,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={row?.[h] == null ? "" : String(row?.[h] ?? "")}
                        >
                          {row?.[h] == null ? "" : String(row?.[h])}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
