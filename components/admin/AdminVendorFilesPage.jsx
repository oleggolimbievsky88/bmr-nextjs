"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getBrandKey } from "@/src/brand";

const BRAND_OPTIONS = [
  { key: "bmr", label: "BMR" },
  { key: "controlfreak", label: "Control Freak" },
];

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

export default function AdminVendorFilesPage() {
  const defaultBrand = useMemo(() => {
    try {
      const k = getBrandKey();
      return BRAND_OPTIONS.some((b) => b.key === k) ? k : "bmr";
    } catch {
      return "bmr";
    }
  }, []);

  const [brand, setBrand] = useState(defaultBrand);
  const [path, setPath] = useState("");
  const [listing, setListing] = useState({
    loading: false,
    error: null,
    folders: [],
    files: [],
  });

  const [newFolderName, setNewFolderName] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const [renameOpen, setRenameOpen] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const breadcrumbs = useMemo(() => {
    const parts = String(path || "")
      .split("/")
      .filter(Boolean);
    const crumbs = [{ label: "Root", path: "" }];
    for (let i = 0; i < parts.length; i++) {
      crumbs.push({
        label: parts[i],
        path: parts.slice(0, i + 1).join("/"),
      });
    }
    return crumbs;
  }, [path]);

  const refresh = useCallback(
    async (pathOverride) => {
      const listPath = pathOverride !== undefined ? pathOverride : path;
      setListing((s) => ({ ...s, loading: true, error: null }));
      try {
        const qs = new URLSearchParams({ brand });
        if (listPath) qs.set("path", listPath);
        const res = await fetch(`/api/admin/vendor-files/list?${qs}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load");
        }
        setListing({
          loading: false,
          error: null,
          folders: data.folders || [],
          files: data.files || [],
        });
      } catch (e) {
        setListing({
          loading: false,
          error: e.message || "Failed to load",
          folders: [],
          files: [],
        });
      }
    },
    [brand, path],
  );

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  async function apiJson(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand, ...body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  }

  async function handleMkdir(e) {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await apiJson("/api/admin/vendor-files/mkdir", {
        path,
        name: newFolderName.trim(),
      });
      setNewFolderName("");
      setMessage({ type: "success", text: "Folder created." });
      await refresh();
    } catch (err) {
      setMessage({ type: "danger", text: err.message });
    }
  }

  async function handleUpload(e) {
    const input = e.target.files?.[0];
    if (!input) return;
    setUploadBusy(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.set("brand", brand);
      fd.set("path", path);
      fd.set("file", input);
      const res = await fetch("/api/admin/vendor-files/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }
      setMessage({ type: "success", text: "File uploaded." });
      e.target.value = "";
      await refresh();
    } catch (err) {
      setMessage({ type: "danger", text: err.message });
    } finally {
      setUploadBusy(false);
    }
  }

  async function handleDeleteFile(key) {
    if (!window.confirm(`Delete file "${key}"?`)) return;
    try {
      await apiJson("/api/admin/vendor-files/delete", { type: "file", key });
      setMessage({ type: "success", text: "File deleted." });
      await refresh();
    } catch (err) {
      setMessage({ type: "danger", text: err.message });
    }
  }

  async function handleDeleteFolder(folderPath) {
    if (
      !window.confirm(
        `Delete folder "${folderPath}" and ALL files inside? This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await apiJson("/api/admin/vendor-files/delete", {
        type: "folder",
        path: folderPath,
      });
      setMessage({ type: "success", text: "Folder deleted." });
      if (path === folderPath || path.startsWith(`${folderPath}/`)) {
        const parent = folderPath.includes("/")
          ? folderPath.slice(0, folderPath.lastIndexOf("/"))
          : "";
        setPath(parent);
      } else {
        await refresh();
      }
    } catch (err) {
      setMessage({ type: "danger", text: err.message });
    }
  }

  async function handleDownloadFile(key) {
    const qs = new URLSearchParams({ brand, key });
    const res = await fetch(
      `/api/admin/vendor-files/download?${qs.toString()}`,
      { cache: "no-store" },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      setMessage({ type: "danger", text: data.error || "Download failed" });
      return;
    }
    window.open(data.url, "_blank", "noopener,noreferrer");
  }

  function openRenameFile(key) {
    const base = key.split("/").pop() || key;
    setRenameOpen({ kind: "file", fromKey: key, fromPath: null, label: base });
    setRenameValue(base);
  }

  function openRenameFolder(folderPath) {
    const base = folderPath.split("/").pop() || folderPath;
    setRenameOpen({
      kind: "folder",
      fromKey: null,
      fromPath: folderPath,
      label: base,
    });
    setRenameValue(base);
  }

  async function submitRename() {
    if (!renameOpen) return;
    const name = renameValue.trim();
    if (!name) return;
    try {
      if (renameOpen.kind === "file") {
        const parent = renameOpen.fromKey.includes("/")
          ? renameOpen.fromKey.slice(0, renameOpen.fromKey.lastIndexOf("/"))
          : "";
        const toKey = parent ? `${parent}/${name}` : name;
        await apiJson("/api/admin/vendor-files/rename", {
          kind: "file",
          fromKey: renameOpen.fromKey,
          toKey,
        });
      } else {
        const parent = renameOpen.fromPath.includes("/")
          ? renameOpen.fromPath.slice(0, renameOpen.fromPath.lastIndexOf("/"))
          : "";
        const toPath = parent ? `${parent}/${name}` : name;
        await apiJson("/api/admin/vendor-files/rename", {
          kind: "folder",
          fromPath: renameOpen.fromPath,
          toPath,
        });
        let newListPath = path;
        if (
          path === renameOpen.fromPath ||
          path.startsWith(`${renameOpen.fromPath}/`)
        ) {
          const suffix =
            path === renameOpen.fromPath
              ? ""
              : path.slice(renameOpen.fromPath.length);
          newListPath = suffix ? `${toPath}${suffix}` : toPath;
          setPath(newListPath);
        }
        setRenameOpen(null);
        setRenameValue("");
        setMessage({ type: "success", text: "Renamed." });
        await refresh(newListPath);
        return;
      }
      setRenameOpen(null);
      setRenameValue("");
      setMessage({ type: "success", text: "Renamed." });
      await refresh();
    } catch (err) {
      setMessage({ type: "danger", text: err.message });
    }
  }

  return (
    <div className="admin-page-inner admin-vendor-files">
      <h1 className="admin-page-title">Vendor downloads (R2)</h1>
      <p className="admin-vendor-files__intro mb-0">
        Manage files and folders vendors see on{" "}
        <code>vendors.bmrsuspension.com</code> and{" "}
        <code>vendors.controlfreaksuspension.com</code>. Objects live under the
        brand prefix in your R2 bucket (<code>bmr/</code> and{" "}
        <code>controlfreak/</code> by default).
      </p>

      {message ? (
        <div
          className={`alert alert-${message.type === "success" ? "success" : "danger"} mt-4 mb-0`}
          role="alert"
        >
          {message.text}
        </div>
      ) : null}

      <div className="admin-vendor-files__toolbar mt-4">
        <div className="admin-vendor-files__toolbar-row">
          <div className="admin-vendor-files__field">
            <label className="form-label" htmlFor="admin-vendor-files-brand">
              Brand / prefix
            </label>
            <select
              id="admin-vendor-files-brand"
              className="form-select"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setPath("");
              }}
            >
              {BRAND_OPTIONS.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-vendor-files__actions">
            <form onSubmit={handleMkdir} className="admin-vendor-files__mkdir">
              <input
                className="form-control"
                placeholder="New folder name"
                aria-label="New folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <button type="submit" className="admin-btn admin-btn-primary">
                Create folder
              </button>
            </form>
            <div className="admin-vendor-files__file-actions">
              <label className="admin-btn admin-btn-secondary mb-0">
                {uploadBusy ? "Uploading…" : "Upload file"}
                <input
                  type="file"
                  className="d-none"
                  disabled={uploadBusy}
                  onChange={handleUpload}
                />
              </label>
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => refresh()}
                disabled={listing.loading}
              >
                <i
                  className={`bi bi-arrow-clockwise${listing.loading ? " admin-vendor-files__spin" : ""}`}
                  aria-hidden
                />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav aria-label="breadcrumb" className="admin-vendor-files__breadcrumb">
        <ol className="breadcrumb mb-0">
          {breadcrumbs.map((c, idx) => (
            <li
              key={c.path || "root"}
              className={`breadcrumb-item ${idx === breadcrumbs.length - 1 ? "active" : ""}`}
            >
              {idx === breadcrumbs.length - 1 ? (
                c.label
              ) : (
                <button
                  type="button"
                  className="btn btn-link p-0 align-baseline"
                  onClick={() => setPath(c.path)}
                >
                  {c.label}
                </button>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {listing.error ? (
        <div className="alert alert-danger">{listing.error}</div>
      ) : null}

      {listing.loading ? (
        <div className="text-center py-5 admin-vendor-files__table-card">
          <div
            className="spinner-border text-secondary"
            role="status"
            aria-label="Loading"
          />
        </div>
      ) : (
        <div className="admin-vendor-files__table-card">
          <div className="table-responsive admin-table-wrap">
            <table className="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listing.folders.map((f) => (
                  <tr key={`d:${f.path}`}>
                    <td>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-start fw-semibold"
                        onClick={() => setPath(f.path)}
                      >
                        <i className="bi bi-folder2-open me-1" aria-hidden />
                        {f.name}
                      </button>
                    </td>
                    <td>Folder</td>
                    <td>—</td>
                    <td className="text-end text-nowrap">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary me-1"
                        onClick={() => setPath(f.path)}
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary me-1"
                        onClick={() => openRenameFolder(f.path)}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteFolder(f.path)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {listing.files.map((file) => (
                  <tr key={`f:${file.key}`}>
                    <td className="fw-semibold">
                      <i className="bi bi-file-earmark me-1" aria-hidden />
                      {file.name}
                    </td>
                    <td>File</td>
                    <td>{formatBytes(file.size)}</td>
                    <td className="text-end text-nowrap">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => handleDownloadFile(file.key)}
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary me-1"
                        onClick={() => openRenameFile(file.key)}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteFile(file.key)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {listing.folders.length === 0 && listing.files.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      This folder is empty.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {renameOpen ? (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.4)" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Rename {renameOpen.kind === "file" ? "file" : "folder"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => {
                    setRenameOpen(null);
                    setRenameValue("");
                  }}
                />
              </div>
              <div className="modal-body">
                <label className="form-label">New name</label>
                <input
                  className="form-control"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setRenameOpen(null);
                    setRenameValue("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => submitRename()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
