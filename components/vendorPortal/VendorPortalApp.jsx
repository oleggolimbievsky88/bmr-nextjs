"use client";

import { useEffect, useMemo, useState } from "react";

function cx(...values) {
  return values.filter(Boolean).join(" ");
}

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

  const brandName = brand?.name || "Vendor Portal";
  const brandLogoAlt = `${brandName} logo`;

  if (auth.loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <div className="mt-2">Loading…</div>
      </div>
    );
  }

  return (
    <section className="flat-spacing-10 vendor-portal">
      <div className="container vendor-portal__container">
        <div className="vendor-portal__topbar">
          <div className="vendor-portal__brand">
            {brand?.logoPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brand.logoPath}
                alt={brandLogoAlt}
                className="vendor-portal__brandLogo"
              />
            ) : (
              <div className="vendor-portal__brandMark" aria-hidden="true">
                <span />
              </div>
            )}
            <div className="vendor-portal__brandText">
              <div className="vendor-portal__title">Vendor Downloads</div>
              <div className="vendor-portal__subtitle">{brandName}</div>
            </div>
          </div>

          {auth.authenticated ? (
            <div className="vendor-portal__topActions">
              <button
                className="tf-btn btn-outline vendor-portal__btn"
                type="button"
                onClick={onLogout}
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>

        {!auth.authenticated ? (
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="vendor-portal__card vendor-portal__card--login">
                <div className="vendor-portal__cardHeader">
                  <h5 className="vendor-portal__cardTitle mb-1">Sign in</h5>
                  <p className="vendor-portal__cardSub mb-0">
                    Use the shared vendor portal credentials.
                  </p>
                </div>

                {login.error ? (
                  <div className="alert alert-danger mt-3 mb-0" role="alert">
                    {login.error}
                  </div>
                ) : null}

                <form onSubmit={onSubmitLogin} className="vendor-portal__form">
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      className="form-control vendor-portal__input"
                      value={login.username}
                      onChange={(e) =>
                        setLogin((s) => ({ ...s, username: e.target.value }))
                      }
                      autoComplete="username"
                      inputMode="text"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      className="form-control vendor-portal__input"
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
                    className="tf-btn btn-fill w-100 vendor-portal__btn vendor-portal__btn--primary"
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
          <div className="vendor-portal__card vendor-portal__card--files">
            <div className="vendor-portal__filesHeader">
              <nav aria-label="breadcrumb" className="vendor-portal__crumbs">
                <ol className="breadcrumb mb-0">
                  {breadcrumbs.map((c, idx) => (
                    <li
                      key={c.path || "root"}
                      className={cx(
                        "breadcrumb-item",
                        idx === breadcrumbs.length - 1 && "active",
                      )}
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

              <div className="vendor-portal__filesActions">
                <button
                  className="tf-btn btn-outline vendor-portal__btn"
                  type="button"
                  onClick={() => loadList(path).catch(() => {})}
                  disabled={listing.loading}
                >
                  Refresh
                </button>
              </div>
            </div>

            {listing.error ? (
              <div className="alert alert-danger mt-3 mb-0" role="alert">
                {listing.error}
              </div>
            ) : null}

            {listing.loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : (
              <>
                {/* Mobile-first: card list */}
                <div className="vendor-portal__list d-md-none">
                  {listing.folders.map((f) => (
                    <div key={`dir:${f.path}`} className="vendor-portal__item">
                      <div
                        className="vendor-portal__itemIcon"
                        aria-hidden="true"
                      >
                        <i className="bi bi-folder2-open" />
                      </div>
                      <div className="vendor-portal__itemBody">
                        <div className="vendor-portal__itemTitle">{f.name}</div>
                        <div className="vendor-portal__itemMeta">Folder</div>
                      </div>
                      <div className="vendor-portal__itemAction">
                        <button
                          className="tf-btn btn-outline vendor-portal__btn"
                          type="button"
                          onClick={() => loadList(f.path).catch(() => {})}
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  ))}

                  {listing.files.map((file) => (
                    <div
                      key={`file:${file.key}`}
                      className="vendor-portal__item"
                    >
                      <div
                        className="vendor-portal__itemIcon"
                        aria-hidden="true"
                      >
                        <i className="bi bi-file-earmark" />
                      </div>
                      <div className="vendor-portal__itemBody">
                        <div className="vendor-portal__itemTitle">
                          {file.name}
                        </div>
                        <div className="vendor-portal__itemMeta">
                          File · {formatBytes(file.size)}
                        </div>
                      </div>
                      <div className="vendor-portal__itemAction">
                        <button
                          className="tf-btn btn-fill vendor-portal__btn vendor-portal__btn--primary"
                          type="button"
                          onClick={() => downloadFile(file.key).catch(() => {})}
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}

                  {listing.folders.length === 0 &&
                  listing.files.length === 0 ? (
                    <div className="vendor-portal__empty">
                      This folder is empty.
                    </div>
                  ) : null}
                </div>

                {/* Desktop: table */}
                <div className="vendor-portal__tableWrap d-none d-md-block">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0 vendor-portal__table">
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
                                className="tf-btn btn-outline vendor-portal__btn"
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
                            <td className="text-muted">
                              {formatBytes(file.size)}
                            </td>
                            <td className="text-end">
                              <button
                                className="tf-btn btn-fill vendor-portal__btn vendor-portal__btn--primary"
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
                            <td
                              colSpan={4}
                              className="text-center text-muted py-5"
                            >
                              This folder is empty.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
