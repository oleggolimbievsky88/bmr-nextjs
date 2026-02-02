"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

function formatPrice(val) {
  const n = parseFloat(val);
  if (Number.isNaN(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

export default function DealersPortalPOPage() {
  const [po, setPo] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState("");

  const fetchDraft = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let res = await fetch("/api/dealer/po");
      let data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load PO");

      if (!data.po) {
        res = await fetch("/api/dealer/po", { method: "POST" });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create PO");
      }

      setPo(data.po);
      setItems(data.items || []);
      setNotes(data.po?.notes || "");
    } catch (err) {
      setError(err.message);
      setPo(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDraft();
  }, [fetchDraft]);

  const handleUpdateQty = async (itemId, newQty) => {
    const qty = Math.max(1, parseInt(newQty, 10) || 1);
    const res = await fetch(`/api/dealer/po/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: qty }),
    });
    if (!res.ok) return;
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: qty } : i)),
    );
  };

  const handleUpdateColor = async (itemId, colorId, colorName) => {
    const res = await fetch(`/api/dealer/po/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colorId: colorId || null, colorName: colorName || "" }),
    });
    if (!res.ok) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, color_id: colorId, color_name: colorName }
          : i,
      ),
    );
  };

  const handleRemove = async (itemId) => {
    const res = await fetch(`/api/dealer/po/items/${itemId}`, {
      method: "DELETE",
    });
    if (!res.ok) return;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleSend = async () => {
    if (!po?.id || items.length === 0) {
      setError("Add at least one item before sending.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/dealer/po/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poId: po.id, notes: notes || "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send PO");
      await fetchDraft();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const subtotal = items.reduce(
    (sum, i) => sum + (parseFloat(i.unit_price) || 0) * (i.quantity || 1),
    0,
  );

  if (loading) {
    return (
      <div className="my-account-content">
        <h5 className="fw-5 mb_30">Purchase Order</h5>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-account-content">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb_30">
        <h5 className="fw-5 mb-0">Purchase Order</h5>
        <Link
          href="/dealers-portal/products"
          className="btn btn-primary btn-sm"
        >
          Add from products
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      {po && (
        <>
          <div className="mb-3">
            <label className="form-label small">Notes (optional)</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Notes for this PO..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {items.length === 0 ? (
            <div className="dashboard-card p-4 text-center text-muted">
              <p className="mb-2">Your PO is empty.</p>
              <Link href="/dealers-portal/products" className="btn btn-outline-primary btn-sm">
                Add products
              </Link>
            </div>
          ) : (
            <>
              <div className="table-responsive mb-4">
                <table className="table table-bordered dashboard-card">
                  <thead>
                    <tr>
                      <th>Part #</th>
                      <th>Product</th>
                      <th style={{ width: "90px" }}>Qty</th>
                      <th style={{ width: "140px" }}>Color</th>
                      <th>Add-ons</th>
                      <th className="text-end">Unit price</th>
                      <th className="text-end">Total</th>
                      <th style={{ width: "60px" }} />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => {
                      const addons = [
                        i.grease_name,
                        i.anglefinder_name,
                        i.hardware_name,
                      ].filter(Boolean);
                      return (
                      <tr key={i.id}>
                        <td className="small">{i.part_number}</td>
                        <td>{i.product_name}</td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min={1}
                            value={i.quantity}
                            onChange={(e) =>
                              handleUpdateQty(i.id, e.target.value)
                            }
                            onBlur={(e) => {
                              const v = e.target.value;
                              if (String(i.quantity) !== v)
                                handleUpdateQty(i.id, v);
                            }}
                          />
                        </td>
                        <td>
                          <ColorSelect
                            itemId={i.id}
                            valueId={i.color_id}
                            valueName={i.color_name}
                            onUpdate={handleUpdateColor}
                          />
                        </td>
                        <td className="small">
                          {addons.length ? addons.join(", ") : "—"}
                        </td>
                        <td className="text-end">{formatPrice(i.unit_price)}</td>
                        <td className="text-end">
                          {formatPrice(
                            (parseFloat(i.unit_price) || 0) * (i.quantity || 1),
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleRemove(i.id)}
                            aria-label="Remove"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div className="fw-6">
                  Subtotal: {formatPrice(subtotal)}
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSend}
                  disabled={sending}
                >
                  {sending ? "Sending…" : "Send PO"}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ColorSelect({ itemId, valueId, valueName, onUpdate }) {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dealer/colors")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.colors) setColors(data.colors);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const opt = e.target.options[e.target.selectedIndex];
    const id = opt.value ? parseInt(opt.value, 10) : null;
    const name = opt.value ? opt.text : "";
    onUpdate(itemId, id, name);
  };

  if (loading) return <span className="small text-muted">…</span>;

  const currentId = valueId != null ? String(valueId) : "";
  return (
    <select
      className="form-select form-select-sm"
      value={currentId}
      onChange={handleChange}
    >
      <option value="">—</option>
      {colors.map((c) => (
        <option key={c.ColorID} value={c.ColorID}>
          {c.ColorName}
        </option>
      ))}
    </select>
  );
}
