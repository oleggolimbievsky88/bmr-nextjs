"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

const PER_PAGE = 24;

function formatPrice(val) {
  const n = parseFloat(val);
  if (Number.isNaN(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

export default function DealersPortalProductsPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(PER_PAGE),
        offset: String(page * PER_PAGE),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const response = await fetch(`/api/dealer/products?${params}`);
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to load products");
      setProducts(data.products || []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error(err);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.ceil(total / PER_PAGE) || 1;

  return (
    <div className="my-account-content">
      <h5 className="fw-5 mb_30">Dealer Products</h5>
      <div className="mb-4">
        <input
          type="search"
          className="form-control"
          placeholder="Search by product name or part number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "400px" }}
        />
      </div>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-0">No products found.</p>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {products.map((p) => (
              <div key={p.ProductID} className="col-6 col-md-4 col-lg-3">
                <div className="dashboard-card h-100">
                  <Link
                    href={`/product/${p.ProductID}`}
                    className="text-decoration-none text-dark"
                  >
                    <div
                      className="position-relative mb-2"
                      style={{
                        aspectRatio: "1",
                        backgroundColor: "var(--bg-11, #f5f5f5)",
                      }}
                    >
                      {p.ImageSmall && p.ImageSmall !== "0" ? (
                        <Image
                          src={`https://bmrsuspension.com/siteart/products/${p.ImageSmall}`}
                          alt={p.ProductName || ""}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          style={{ objectFit: "contain" }}
                        />
                      ) : (
                        <span className="d-flex align-items-center justify-content-center h-100 text-muted">
                          No image
                        </span>
                      )}
                    </div>
                    <h6
                      className="dashboard-card-title small mb-1 text-truncate"
                      title={p.ProductName}
                    >
                      {p.ProductName}
                    </h6>
                    <p className="dashboard-card-meta small mb-1">
                      {p.PartNumber}
                    </p>
                    <div className="d-flex align-items-baseline gap-2 flex-wrap">
                      <span className="text-muted text-decoration-line-through small">
                        {formatPrice(p.Price)}
                      </span>
                      <span className="fw-6 text-success">
                        {formatPrice(p.dealerPrice)}
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <nav className="d-flex justify-content-center gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <span className="align-self-center small text-muted">
                Page {page + 1} of {totalPages} ({total} products)
              </span>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
