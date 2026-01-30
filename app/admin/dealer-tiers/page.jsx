"use client";

import { useState, useEffect } from "react";

export default function AdminDealerTiersPage() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/dealer-tiers");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch dealer tiers");
      }

      const list = data.tiers || [];
      const defaultTiers = [1, 2, 3, 4, 5, 6, 7, 8].map((tier) => ({
        tier,
        discount_percent: 0,
      }));
      const full = defaultTiers.map(
        (d) => list.find((l) => l.tier === d.tier) || d,
      );
      setTiers(full);
      setError("");
    } catch (err) {
      setError(err.message);
      setTiers(
        [1, 2, 3, 4, 5, 6, 7, 8].map((tier) => ({
          tier,
          discount_percent: 0,
        })),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountChange = (tier, value) => {
    const num = parseFloat(value);
    setTiers((prev) =>
      prev.map((t) =>
        t.tier === tier ? { ...t, discount_percent: isNaN(num) ? 0 : num } : t,
      ),
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/admin/dealer-tiers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tiers: tiers.map((t) => ({
            tier: t.tier,
            discount_percent: parseFloat(t.discount_percent) || 0,
          })),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update dealer tiers");
      }

      setTiers(data.tiers || tiers);
      alert("Dealer tiers saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-section">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 mb-0">Loading dealer tiers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <h1 className="mb-4">Dealer Tiers</h1>
      <p className="text-muted mb-4">
        Configure discount percentages for dealer tiers 1–8. Customers assigned
        a tier in the Customers page will receive this discount on dealer
        pricing.
      </p>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Discount (%)</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t) => (
                <tr key={t.tier}>
                  <td>Tier {t.tier}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="100"
                      step="0.01"
                      value={t.discount_percent ?? ""}
                      onChange={(e) =>
                        handleDiscountChange(t.tier, e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Dealer Tiers"}
        </button>
      </form>
    </div>
  );
}
