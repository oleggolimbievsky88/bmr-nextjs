"use client";

import { useEffect, useMemo, useState } from "react";

function formatBytes(bytes) {
  const n = Number(bytes || 0);
  if (!Number.isFinite(n) || n <= 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    Math.floor(Math.log(n) / Math.log(1024)),
    units.length - 1,
  );
  const v = n / Math.pow(1024, i);
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function joinPath(parts) {
  return parts.filter(Boolean).join("/");
}

export default function VendorPortalApp({ brand }) {
  const [auth, setAuth] = useState({ loading: true, authenticated: false });
  const [login, setLogin] = useState({
    username: "",
    password: "",
    error: null,
    submitting: false,
  });

  const [path, setPath] = useState("");
  const [listing, setListing] = useState({
    loading: false,
    error: null,
    folders: [],
    files: [],
  });

  const breadcrumbs = useMemo(() => {
    const parts = String(path || "")
      .split("/")
      .filter(Boolean);
    const crumbs = [{ label: "Home", path: "" }];
    for (let i = 0; i < parts.length; i++) {
      crumbs.push({ label: parts[i], path: joinPath(parts.slice(0, i + 1)) });
    }
    return crumbs;
  }, [path]);

  async function refreshSession() {
    const res = await fetch("/api/vendor-auth/session", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    setAuth({ loading: false, authenticated: Boolean(data.authenticated) });
  }

  async function loadList(nextPath) {
    setListing((s) => ({ ...s, loading: true, error: null }));
    try {
      const qs = new URLSearchParams();
      if (nextPath) qs.set("path", nextPath);
      const res = await fetch(`/api/vendor-files/list?${qs.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load files");
      }
      setPath(nextPath || "");
      setListing({
        loading: false,
        error: null,
        folders: data.folders || [],
        files: data.files || [],
      });
    } catch (e) {
      setListing({
        loading: false,
        error: e.message || "Failed to load files",
        folders: [],
        files: [],
      });
    }
  }

  useEffect(() => {
    refreshSession().catch(() =>
      setAuth({ loading: false, authenticated: false }),
    );
  }, []);

  useEffect(() => {
    if (auth.authenticated) loadList("").catch(() => {});
  }, [auth.authenticated]);

  async function onSubmitLogin(e) {
    e.preventDefault();
    setLogin((s) => ({ ...s, submitting: true, error: null }));
    try {
      const res = await fetch("/api/vendor-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: login.username,
          password: login.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }
      setLogin({ username: "", password: "", error: null, submitting: false });
      await refreshSession();
    } catch (e2) {
      setLogin((s) => ({
        ...s,
        submitting: false,
        error: e2.message || "Login failed",
      }));
    }
  }

  async function onLogout() {
    await fetch("/api/vendor-auth/logout", { method: "POST" }).catch(() => {});
    setAuth({ loading: false, authenticated: false });
    setPath("");
    setListing({ loading: false, error: null, folders: [], files: [] });
  }

  async function downloadFile(relKey) {
    const qs = new URLSearchParams({ key: relKey });
    const res = await fetch(`/api/vendor-files/download?${qs.toString()}`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success || !data.url) {
      throw new Error(data.error || "Failed to create download link");
    }
    window.open(data.url, "_blank", "noopener,noreferrer");
  }

  if (auth.loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <div className="mt-2">Loading…</div>
      </div>
    );
  }

  return (
    <section className="flat-spacing-10">
      <div className="container" style={{ maxWidth: 1100 }}>
        <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            {brand?.logoPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brand.logoPath}
                alt={`${brand?.name || "Brand"} logo`}
                style={{ height: 44, width: "auto" }}
              />
            ) : null}
            <div>
              <div className="fw-6" style={{ fontSize: 18 }}>
                Vendor Downloads
              </div>
              <div className="text-muted small">{brand?.name || "Portal"}</div>
            </div>
          </div>

          {auth.authenticated ? (
            <button
              className="tf-btn btn-outline rounded-0"
              type="button"
              onClick={onLogout}
            >
              Sign out
            </button>
          ) : null}
        </div>

        {!auth.authenticated ? (
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="dashboard-card p-4">
                <h5 className="fw-6 mb-2">Sign in</h5>
                <p className="text-muted mb-3">
                  Enter the shared vendor portal login.
                </p>
                {login.error ? (
                  <div className="alert alert-danger mb-3" role="alert">
                    {login.error}
                  </div>
                ) : null}
                <form onSubmit={onSubmitLogin}>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      className="form-control"
                      value={login.username}
                      onChange={(e) =>
                        setLogin((s) => ({ ...s, username: e.target.value }))
                      }
                      autoComplete="username"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      className="form-control"
                      type="password"
                      value={login.password}
                      onChange={(e) =>
                        setLogin((s) => ({ ...s, password: e.target.value }))
                      }
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <button
                    className="tf-btn btn-fill rounded-0 w-100"
                    type="submit"
                    disabled={login.submitting}
                  >
                    {login.submitting ? "Signing in…" : "Sign in"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-card p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  {breadcrumbs.map((c, idx) => (
                    <li
                      key={c.path || "root"}
                      className={`breadcrumb-item ${idx === breadcrumbs.length - 1 ? "active" : ""}`}
                    >
                      {idx === breadcrumbs.length - 1 ? (
                        c.label
                      ) : (
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            loadList(c.path).catch(() => {});
                          }}
                        >
                          {c.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>

              <button
                className="tf-btn btn-outline rounded-0"
                type="button"
                onClick={() => loadList(path).catch(() => {})}
                disabled={listing.loading}
              >
                Refresh
              </button>
            </div>

            {listing.error ? (
              <div className="alert alert-danger mb-3" role="alert">
                {listing.error}
              </div>
            ) : null}

            {listing.loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "55%" }}>Name</th>
                      <th style={{ width: "15%" }}>Type</th>
                      <th style={{ width: "15%" }}>Size</th>
                      <th style={{ width: "15%" }} className="text-end">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listing.folders.map((f) => (
                      <tr key={`dir:${f.path}`}>
                        <td className="fw-6">
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              loadList(f.path).catch(() => {});
                            }}
                          >
                            <i className="bi bi-folder2-open me-2" />
                            {f.name}
                          </a>
                        </td>
                        <td className="text-muted">Folder</td>
                        <td className="text-muted">—</td>
                        <td className="text-end">
                          <button
                            className="tf-btn btn-outline rounded-0"
                            type="button"
                            onClick={() => loadList(f.path).catch(() => {})}
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}

                    {listing.files.map((file) => (
                      <tr key={`file:${file.key}`}>
                        <td className="fw-6">
                          <i className="bi bi-file-earmark me-2" />
                          {file.name}
                        </td>
                        <td className="text-muted">File</td>
                        <td className="text-muted">{formatBytes(file.size)}</td>
                        <td className="text-end">
                          <button
                            className="tf-btn btn-fill rounded-0"
                            type="button"
                            onClick={() =>
                              downloadFile(file.key).catch(() => {})
                            }
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}

                    {listing.folders.length === 0 &&
                    listing.files.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center text-muted py-5">
                          This folder is empty.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
