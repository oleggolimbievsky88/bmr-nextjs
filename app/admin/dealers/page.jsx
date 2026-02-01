'use client'

import { useState, useEffect, useCallback } from 'react'

export default function AdminDealersPage() {
  const [tiers, setTiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saveMessage, setSaveMessage] = useState(null)

  const fetchTiers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dealer-tiers')
      if (!res.ok) throw new Error(res.statusText)
      const data = await res.json()
      setTiers(Array.isArray(data.tiers) ? data.tiers : [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load tiers')
      setTiers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTiers()
  }, [fetchTiers])

  const handleChange = (id, field, value) => {
    setTiers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      )
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMessage(null)
    setError(null)
    try {
      const updates = tiers.map((t) => ({
        id: t.id,
        name: t.name,
        discount_percent: t.discount_percent != null ? Number(t.discount_percent) : undefined,
        flat_rate_shipping: t.flat_rate_shipping != null ? Number(t.flat_rate_shipping) : undefined,
      }))
      const res = await fetch('/api/admin/dealer-tiers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || res.statusText)
      setTiers(data.tiers || tiers)
      setSaveMessage('Saved successfully.')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Dealers</h1>

      <section>
        <h2 className="text-lg font-semibold mb-3">Tier discounts & flat rate shipping</h2>
        <p className="text-muted mb-4">
          Tier 1 & 2 dealers in the lower 48 US get the flat rate shipping shown below.
          Tier 3 pays full UPS. Discount % is applied to dealer orders.
        </p>

        {loading && <p className="text-muted">Loading…</p>}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        {saveMessage && (
          <div className="alert alert-success" role="alert">
            {saveMessage}
          </div>
        )}

        {!loading && tiers.length > 0 && (
          <>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Tier</th>
                    <th>Name</th>
                    <th>Discount %</th>
                    <th>Flat rate shipping (lower 48)</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((t) => (
                    <tr key={t.id}>
                      <td>{t.tier}</td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={t.name ?? ''}
                          onChange={(e) => handleChange(t.id, 'name', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          min="0"
                          max="100"
                          step="0.01"
                          value={t.discount_percent ?? ''}
                          onChange={(e) =>
                            handleChange(t.id, 'discount_percent', e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          min="0"
                          step="0.01"
                          value={t.flat_rate_shipping ?? ''}
                          onChange={(e) =>
                            handleChange(t.id, 'flat_rate_shipping', e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="btn btn-primary mt-3"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </>
        )}

        {!loading && tiers.length === 0 && !error && (
          <p className="text-muted">
            No tiers found. Run <code>database/dealer_tiers.sql</code> to create the table and seed tiers.
          </p>
        )}
      </section>
    </div>
  )
}
