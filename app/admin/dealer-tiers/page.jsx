"use client";

import { useState, useEffect } from "react";

const DEFAULT_TIERS = [1, 2, 3, 4, 5, 6, 7, 8].map((tier) => ({
  tier,
  name: "",
  discount_percent: 0,
  flat_rate_shipping: 0,
  created_at: null,
  updated_at: null,
}));

function formatDateTime(val) {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export default function AdminDealerTiersPage() {
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const response = await fetch("/api/admin/dealer-tiers");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch dealer tiers");
      }

      const list = data.tiers || [];
      const full = DEFAULT_TIERS.map((d) => {
        const found = list.find((l) => l.tier === d.tier);
        if (!found) return { ...d };
        return {
          tier: found.tier,
          name: found.name ?? "",
          discount_percent: found.discount_percent ?? 0,
          flat_rate_shipping: found.flat_rate_shipping ?? 0,
          created_at: found.created_at ?? null,
          updated_at: found.updated_at ?? null,
        };
      });
      setTiers(full);
    } catch (err) {
      setError(err.message);
      setTiers(DEFAULT_TIERS);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (tier, field, value) => {
    setTiers((prev) =>
      prev.map((t) => {
        if (t.tier !== tier) return t;
        const next = { ...t, [field]: value };
        if (field === "discount_percent" || field === "flat_rate_shipping") {
          const num = parseFloat(value);
          next[field] = isNaN(num) ? 0 : num;
        }
        return next;
      })
    );
    setSuccess("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const response = await fetch("/api/admin/dealer-tiers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tiers: tiers.map((t) => ({
            tier: t.tier,
            name: t.name?.trim() || null,
            discount_percent: parseFloat(t.discount_percent) || 0,
            flat_rate_shipping: parseFloat(t.flat_rate_shipping) || 0,
          })),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update dealer tiers");
      }

      const updated = data.tiers || [];
      const full = DEFAULT_TIERS.map((d) => {
        const found = updated.find((l) => l.tier === d.tier);
        if (!found) return { ...d };
        return {
          tier: found.tier,
          name: found.name ?? "",
          discount_percent: found.discount_percent ?? 0,
          flat_rate_shipping: found.flat_rate_shipping ?? 0,
          created_at: found.created_at ?? null,
          updated_at: found.updated_at ?? null,
        };
      });
      setTiers(full);
      setSuccess("Dealer tiers saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dealer-tiers-page">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Dealer Tiers</h1>
        </div>
        <div className="admin-card text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 mb-0 text-muted">Loading dealer tiers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dealer-tiers-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dealer Tiers</h1>
      </div>

      <p className="text-muted mb-3">
        Configure dealer tiers 1–8. Customers assigned a tier in the Customers
        page will receive the discount on dealer pricing. Set flat-rate shipping
        per tier (0 = use standard shipping).
      </p>

      {error && <div className="admin-alert-error mb-3">{error}</div>}
      {success && (
        <div className="alert alert-success mb-3" role="alert">
          {success}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="admin-card">
          {/* Desktop table */}
          <div className="admin-dealer-tiers-table-wrap d-none d-md-block">
            <table className="admin-table admin-dealer-tiers-table">
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Name</th>
                  <th>Discount (%)</th>
                  <th>Flat rate shipping ($)</th>
                  <th className="text-muted small">Last updated</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((t) => (
                  <tr key={t.tier}>
                    <td>
                      <span className="fw-semibold">Tier {t.tier}</span>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Example: Tier 1(Bronze), Tier 2(Silver), etc."
                        value={t.name ?? ""}
                        onChange={(e) =>
                          handleChange(t.tier, "name", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        min="0"
                        max="100"
                        step="0.01"
                        style={{ maxWidth: "90px" }}
                        value={t.discount_percent ?? ""}
                        onChange={(e) =>
                          handleChange(
                            t.tier,
                            "discount_percent",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        min="0"
                        step="0.01"
                        style={{ maxWidth: "90px" }}
                        value={t.flat_rate_shipping ?? ""}
                        onChange={(e) =>
                          handleChange(
                            t.tier,
                            "flat_rate_shipping",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="text-muted small">
                      {formatDateTime(t.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="admin-dealer-tiers-cards d-md-none">
            {tiers.map((t) => (
              <div key={t.tier} className="admin-dealer-tier-card">
                <div className="admin-dealer-tier-card-header">
                  <span className="fw-semibold">Tier {t.tier}</span>
                  <span className="text-muted small">
                    {formatDateTime(t.updated_at)}
                  </span>
                </div>
                <div className="admin-dealer-tier-card-body">
                  <div className="mb-2">
                    <label className="form-label small mb-1">Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Bronze, Silver"
                      value={t.name ?? ""}
                      onChange={(e) =>
                        handleChange(t.tier, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small mb-1">
                        Discount %
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        min="0"
                        max="100"
                        step="0.01"
                        value={t.discount_percent ?? ""}
                        onChange={(e) =>
                          handleChange(
                            t.tier,
                            "discount_percent",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small mb-1">
                        Flat ship $
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        min="0"
                        step="0.01"
                        value={t.flat_rate_shipping ?? ""}
                        onChange={(e) =>
                          handleChange(
                            t.tier,
                            "flat_rate_shipping",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-top">
            <button
              type="submit"
              className="btn btn-primary admin-btn-primary"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Dealer Tiers"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
