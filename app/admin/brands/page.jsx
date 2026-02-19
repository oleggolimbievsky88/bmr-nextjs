"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminBrandsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/brands");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load brands");
      }
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 mb-0 text-muted">Loading brands...</p>
      </div>
    );
  }

  return (
    <div className="admin-brands-list py-4">
      <h1 className="h4 mb-4">Brands</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {list.length === 0 ? (
        <div className="alert alert-info">
          No brands found. If using shared brand DB:{" "}
          <code>mysql -u user -p &lt; database/brand_core.sql</code> Then set
          DATABASE_BRAND_CORE_URL. Else:{" "}
          <code>mysql -u user -p database &lt; database/brands.sql</code>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Key</th>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.key}>
                  <td>
                    <code>{b.key}</code>
                  </td>
                  <td>{b.name || b.key}</td>
                  <td>
                    <span
                      className={`badge ${
                        b.isActive !== false ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {b.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/admin/brands/${encodeURIComponent(b.key)}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
