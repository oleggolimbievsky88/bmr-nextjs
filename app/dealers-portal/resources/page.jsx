"use client";

import { useEffect, useState } from "react";

export default function DealersPortalResourcesPage() {
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/dealer/resources")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories || []);
          setResources(data.resources || []);
        } else setError(data.error || "Failed to load");
      })
      .catch((err) => {
        setError(err.message);
        setCategories([]);
        setResources([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="my-account-content">
        <h5 className="fw-bold mb_30">Download Resources</h5>
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
      <h5 className="fw-bold mb_30">Download Resources</h5>
      <p className="text-muted mb-4">
        Installation instructions, Hi-Res images, price lists, and new product
        info.
      </p>
      {/* TODO: Add files to public/dealer-resources/ and list them in
      data/dealer-resources.js. */}

      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}
      {categories.map((cat) => {
        const items = resources.filter((r) => r.categoryId === cat.id);
        return (
          <div key={cat.id} className="dashboard-card mb-4 p-4">
            <h6 className="fw-6 mb-2">{cat.title}</h6>
            <p className="small text-muted mb-3">{cat.description}</p>
            {items.length === 0 ? (
              <p className="small text-muted mb-0">
                No files in this category yet.
              </p>
            ) : (
              <ul className="list-unstyled mb-0">
                {items.map((res, idx) => {
                  const ext = (res.fileUrl || "")
                    .split(".")
                    .pop()
                    ?.toLowerCase();
                  const isZip = ext === "zip";
                  const label = isZip
                    ? "ZIP"
                    : ext === "pdf"
                    ? "PDF"
                    : "Download";
                  return (
                    <li key={idx} className="mb-2">
                      <a
                        href={res.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="d-flex align-items-center gap-2 text-decoration-none"
                      >
                        <span className="badge bg-primary rounded-0">
                          {label}
                        </span>
                        <span className="fw-6">{res.title}</span>
                        {res.description && (
                          <span className="small text-muted">
                            — {res.description}
                          </span>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
