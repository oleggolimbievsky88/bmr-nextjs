"use client";

import { useState, useEffect, useCallback } from "react";

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

export default function AdminDealerPOsPage() {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPoId, setSelectedPoId] = useState(null);
  const [poDetail, setPoDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/dealer-pos");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load POs");
      setPos(data.pos || []);
    } catch (err) {
      setError(err.message);
      setPos([]);
    } finally {
      setLoading(false);
    }
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
      setPoDetail({ po: data.po, items: data.items || [] });
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

  return (
    <div className="admin-content">
      <h1 className="mb-4">Dealer Purchase Orders</h1>

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
        </div>
      ) : pos.length === 0 ? (
        <div className="alert alert-info">
          No dealer POs yet. POs appear here after dealers send them from their
          dashboard.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Dealer</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pos.map((po) => (
                <tr key={po.id}>
                  <td>{po.id}</td>
                  <td>
                    {po.firstname} {po.lastname}
                    {po.email && (
                      <span className="d-block small text-muted">
                        {po.email}
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        po.status === "sent"
                          ? "bg-primary"
                          : po.status === "completed"
                            ? "bg-success"
                            : "bg-secondary"
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td>{formatDate(po.sent_at)}</td>
                  <td>{formatDate(po.created_at)}</td>
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
      )}

      {selectedPoId && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dealerPODetailTitle"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="dealerPODetailTitle">
                  PO #{selectedPoId}
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
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : poDetail?.error ? (
                  <div className="alert alert-danger">{poDetail.error}</div>
                ) : poDetail ? (
                  <>
                    <div className="mb-3">
                      <strong>Dealer:</strong> {poDetail.po?.firstname}{" "}
                      {poDetail.po?.lastname} ({poDetail.po?.email})
                    </div>
                    {poDetail.po?.notes && (
                      <div className="mb-3">
                        <strong>Notes:</strong> {poDetail.po.notes}
                      </div>
                    )}
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
                    <div className="mt-2 fw-6">
                      Subtotal:{" "}
                      {formatPrice(
                        (poDetail.items || []).reduce(
                          (s, i) =>
                            s +
                            (parseFloat(i.unit_price) || 0) * (i.quantity || 1),
                          0,
                        ),
                      )}
                    </div>
                  </>
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
