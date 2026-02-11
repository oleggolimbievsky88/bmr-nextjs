"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/utlis/showToast";

const MAX_IMAGES = 10;

function ConfirmDeleteModal({
  show,
  onClose,
  onConfirm,
  title,
  message,
  variant = "banner",
}) {
  if (!show) return null;
  const isBanner = variant === "banner";
  const handleConfirm = () => {
    onClose();
    onConfirm();
  };
  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg overflow-hidden rounded-3">
          <div className="modal-header border-0 bg-danger text-white">
            <h5 className="modal-title fw-semibold">{title}</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body py-4">
            <p className="mb-0 text-dark">{message}</p>
          </div>
          <div className="modal-footer border-0 bg-light gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`btn rounded-pill ${
                isBanner ? "btn-danger" : "btn-outline-danger"
              }`}
              onClick={handleConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function resolveImageSrc(src) {
  if (!src || typeof src !== "string") return "";
  const s = src.trim();
  if (s.startsWith("http") || s.startsWith("/")) return s;
  if (s.includes("/")) return `/${s}`;
  return `/images/slider/${s}`;
}

function formatBannerDate(val) {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return val;
  }
}

export default function AdminBannerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("id");

  const [list, setList] = useState([]);
  const [banner, setBanner] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [urls, setUrls] = useState({});
  const [form, setForm] = useState({
    bannername: "",
    display: false,
    bannerspeed: "0",
    display_start: "",
    display_end: "",
    is_default: false,
  });
  const [newImageSrc, setNewImageSrc] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: null,
    data: null,
  });

  const fetchList = useCallback(async () => {
    const res = await fetch("/api/admin/banner");
    if (!res.ok) throw new Error("Failed to fetch list");
    const data = await res.json();
    setList(Array.isArray(data) ? data : []);
  }, []);

  const fetchBanner = useCallback(async (id) => {
    if (!id) return;
    const res = await fetch(`/api/admin/banner?id=${id}`);
    if (!res.ok) throw new Error("Failed to fetch banner");
    const data = await res.json();
    setBanner(data.banner || null);
    setImages(data.images || []);
    const initial = {};
    (data.images || []).forEach((img) => {
      initial[img.ImageId] = img.ImageUrl || "";
    });
    setUrls(initial);
    if (data.banner) {
      setForm({
        bannername: data.banner.bannername || "",
        display: !!(data.banner.display === 1 || data.banner.display === "1"),
        bannerspeed: data.banner.bannerspeed || "0",
        display_start: data.banner.display_start
          ? data.banner.display_start.slice(0, 16)
          : "",
        display_end: data.banner.display_end
          ? data.banner.display_end.slice(0, 16)
          : "",
        is_default: !!(
          data.banner.is_default === 1 || data.banner.is_default === true
        ),
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        await fetchList();
        if (editId) await fetchBanner(editId);
      } catch (e) {
        if (!cancelled) showToast(e.message || "Failed to load", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [editId, fetchList, fetchBanner]);

  const handleUrlChange = (imageId, value) => {
    setUrls((prev) => ({ ...prev, [imageId]: value }));
  };

  const handleSaveBanner = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/banner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bannerid: Number(editId),
          bannername: form.bannername,
          display: form.display,
          bannerspeed: form.bannerspeed,
          display_start: form.display_start || null,
          display_end: form.display_end || null,
          is_default: form.is_default,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update banner");
      showToast("Banner saved.", "success");
      router.push("/admin/banner");
    } catch (e) {
      showToast(e.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const moveImage = (fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= images.length) return;
    const arr = [...images];
    [arr[fromIndex], arr[toIndex]] = [arr[toIndex], arr[fromIndex]];
    setImages(arr);
  };

  const handleSaveImages = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(urls).map(([imageId, imageUrl]) => ({
        imageId: Number(imageId),
        imageUrl: String(imageUrl).trim() || "",
      }));
      const imageOrder = images.map((img, idx) => ({
        imageId: img.ImageId,
        imagePosition: idx,
      }));
      const res = await fetch("/api/admin/banner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates, imageOrder }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update");
      }
      showToast("Images saved.", "success");
      router.push("/admin/banner");
    } catch (e) {
      showToast(e.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const addImageWithSrc = async (imageSrc) => {
    if (!editId || !imageSrc?.trim()) return false;
    if (images.length >= MAX_IMAGES) {
      showToast(`Maximum ${MAX_IMAGES} images per banner.`, "error");
      return false;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/banner/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bannerid: Number(editId),
          imageSrc: imageSrc.trim(),
          imageUrl: newImageUrl.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to add image");
      showToast("Image added.", "success");
      setNewImageSrc("");
      setNewImageUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchBanner(editId);
      await fetchList();
      return true;
    } catch (e) {
      showToast(e.message || "Failed to add image", "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = async () => {
    if (!newImageSrc.trim()) {
      showToast(
        "Upload an image or enter a filename (e.g. AAK322_Banner.jpg)",
        "error",
      );
      return;
    }
    await addImageWithSrc(newImageSrc);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= MAX_IMAGES) {
      showToast(`Maximum ${MAX_IMAGES} images per banner.`, "error");
      e.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/admin/banner/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to upload");
      await addImageWithSrc(data.filename);
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteImageClick = (imageId) => {
    setConfirmModal({
      show: true,
      type: "image",
      data: { imageId },
    });
  };

  const handleDeleteImageConfirm = async () => {
    const { imageId } = confirmModal.data || {};
    if (!imageId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/banner/image?id=${imageId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to delete");
      }
      showToast("Image removed.", "success");
      setConfirmModal({ show: false, type: null, data: null });
      await fetchBanner(editId);
      await fetchList();
    } catch (e) {
      showToast(e.message || "Failed to delete", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBanner = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bannername: "New Banner",
          display: 0,
          bannerspeed: "0",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to create");
      const newId = data.bannerid;
      showToast("Banner created.", "success");
      window.location.href = `/admin/banner?id=${newId}`;
    } catch (e) {
      showToast(e.message || "Failed to create", "error");
      setSaving(false);
    }
  };

  const handleDeleteBannerClick = (bannerId, name) => {
    setConfirmModal({
      show: true,
      type: "banner",
      data: { bannerId, name },
    });
  };

  const handleDeleteBannerConfirm = async () => {
    const { bannerId } = confirmModal.data || {};
    if (!bannerId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/banner?id=${bannerId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to delete");
      }
      showToast("Banner deleted.", "success");
      setConfirmModal({ show: false, type: null, data: null });
      if (String(bannerId) === editId) window.location.href = "/admin/banner";
      else await fetchList();
    } catch (e) {
      showToast(e.message || "Failed to delete", "error");
    } finally {
      setSaving(false);
    }
  };

  const closeConfirmModal = () =>
    setConfirmModal({ show: false, type: null, data: null });

  const confirmModalProps =
    confirmModal.type === "banner"
      ? {
          title: "Delete banner?",
          message: `Delete "${confirmModal.data?.name || ""}" and all its images? This cannot be undone.`,
          variant: "banner",
          onConfirm: handleDeleteBannerConfirm,
        }
      : confirmModal.type === "image"
        ? {
            title: "Remove image?",
            message: "Remove this image from the banner?",
            variant: "image",
            onConfirm: handleDeleteImageConfirm,
          }
        : null;

  if (loading && !editId) {
    return (
      <div className="admin-banner-page">
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "2.5rem", height: "2.5rem" }}
          >
            <span className="visually-hidden">Loading…</span>
          </div>
          <p className="text-muted mt-2">Loading banners…</p>
        </div>
        {confirmModalProps && confirmModal.show && (
          <ConfirmDeleteModal
            show={confirmModal.show}
            onClose={closeConfirmModal}
            {...confirmModalProps}
          />
        )}
      </div>
    );
  }

  if (!editId) {
    return (
      <div className="admin-banner-page">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">Banners</h1>
            <p className="text-muted small mb-0">
              Scheduled banners show when current time is within their
              start/end. Use one as default for gaps. No overlapping ranges.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary rounded-pill px-4"
            disabled={saving}
            onClick={handleCreateBanner}
          >
            + Add banner
          </button>
        </div>

        {list.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body text-center py-5">
              <p className="text-muted mb-3">No banners yet.</p>
              <button
                type="button"
                className="btn btn-primary rounded-pill"
                disabled={saving}
                onClick={handleCreateBanner}
              >
                Add your first banner
              </button>
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 py-3 ps-4">ID</th>
                    <th className="border-0 py-3">Name</th>
                    <th className="border-0 py-3">Display</th>
                    <th className="border-0 py-3">Default</th>
                    <th className="border-0 py-3">Start</th>
                    <th className="border-0 py-3">End</th>
                    <th className="border-0 py-3">Images</th>
                    <th className="border-0 py-3 pe-4 text-end"></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((b) => (
                    <tr key={b.bannerid}>
                      <td className="ps-4">
                        <span className="text-muted fw-medium">
                          {b.bannerid}
                        </span>
                      </td>
                      <td className="fw-medium">{b.bannername}</td>
                      <td>
                        <span
                          className={`badge ${
                            b.display === 1 || b.display === "1"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {b.display === 1 || b.display === "1" ? "Yes" : "No"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            b.is_default === 1 || b.is_default === true
                              ? "bg-primary"
                              : "bg-secondary"
                          }`}
                        >
                          {b.is_default === 1 || b.is_default === true
                            ? "Yes"
                            : "No"}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {formatBannerDate(b.display_start)}
                      </td>
                      <td className="text-muted small">
                        {formatBannerDate(b.display_end)}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {b.imageCount ?? 0}
                        </span>
                      </td>
                      <td className="pe-4 text-end">
                        <Link
                          href={`/admin/banner?id=${b.bannerid}`}
                          className="btn btn-sm btn-outline-primary rounded-pill me-1"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill"
                          onClick={() =>
                            handleDeleteBannerClick(b.bannerid, b.bannername)
                          }
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {confirmModalProps && confirmModal.show && (
          <ConfirmDeleteModal
            show={confirmModal.show}
            onClose={closeConfirmModal}
            {...confirmModalProps}
          />
        )}
      </div>
    );
  }

  if (loading && banner === null) {
    return (
      <div className="admin-banner-page">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
          <p className="text-muted mt-2">Loading banner…</p>
        </div>
        {confirmModalProps && confirmModal.show && (
          <ConfirmDeleteModal
            show={confirmModal.show}
            onClose={closeConfirmModal}
            {...confirmModalProps}
          />
        )}
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="admin-banner-page">
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body text-center py-5">
            <p className="text-muted mb-3">Banner not found.</p>
            <Link
              href="/admin/banner"
              className="btn btn-outline-secondary rounded-pill"
            >
              ← Back to list
            </Link>
          </div>
        </div>
        {confirmModalProps && confirmModal.show && (
          <ConfirmDeleteModal
            show={confirmModal.show}
            onClose={closeConfirmModal}
            {...confirmModalProps}
          />
        )}
      </div>
    );
  }

  return (
    <div className="admin-banner-page">
      <div className="mb-4">
        <Link
          href="/admin/banner"
          className="btn btn-link text-muted text-decoration-none p-0 mb-2 d-inline-flex align-items-center"
        >
          ← Back to list
        </Link>
        <h1 className="h3 fw-bold mb-0">Edit banner</h1>
      </div>

      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          <h5 className="card-title fw-semibold mb-4">Banner settings</h5>
          <div className="row g-2 mb-2">
            <div className="col-md-6">
              <label className="form-label small">Name</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.bannername}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bannername: e.target.value }))
                }
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Speed (delay ms)</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.bannerspeed}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bannerspeed: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="row g-2 mb-2">
            <div className="col-md-6">
              <label className="form-label small">
                Display start (optional)
              </label>
              <input
                type="datetime-local"
                className="form-control form-control-sm"
                value={form.display_start}
                onChange={(e) =>
                  setForm((f) => ({ ...f, display_start: e.target.value }))
                }
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Display end (optional)</label>
              <input
                type="datetime-local"
                className="form-control form-control-sm"
                value={form.display_end}
                onChange={(e) =>
                  setForm((f) => ({ ...f, display_end: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={form.display}
                onChange={(e) =>
                  setForm((f) => ({ ...f, display: e.target.checked }))
                }
              />
              <span className="form-check-label">
                Display (legacy fallback)
              </span>
            </label>
          </div>
          <div className="mb-2">
            <label className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={form.is_default}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_default: e.target.checked }))
                }
              />
              <span className="form-check-label">
                Default banner (show when no scheduled range matches)
              </span>
            </label>
          </div>
          <button
            type="button"
            className="btn btn-primary rounded-pill px-4"
            disabled={saving}
            onClick={handleSaveBanner}
          >
            {saving ? "Saving…" : "Save banner"}
          </button>
        </div>
      </div>

      <div className="mb-3">
        <h5 className="fw-semibold mb-1">Images (max {MAX_IMAGES})</h5>
        <p className="text-muted small mb-0">
          Upload from your computer or use a filename for existing files in
          public/images/slider/.
        </p>
      </div>

      {images.length > 0 && (
        <>
          <p className="text-muted small mb-2">
            Use arrows to reorder. Order and URLs are saved together.
          </p>
          <div className="row g-3 mb-4">
            {images.map((img, idx) => (
              <div key={img.ImageId} className="col-12 col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100 rounded-3 overflow-hidden">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-secondary rounded-pill">
                        #{idx + 1}
                      </span>
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm rounded-pill"
                          onClick={() => moveImage(idx, -1)}
                          disabled={saving || idx === 0}
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm rounded-pill"
                          onClick={() => moveImage(idx, 1)}
                          disabled={saving || idx === images.length - 1}
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                    {img.ImageSrc && (
                      <img
                        src={resolveImageSrc(img.ImageSrc)}
                        alt=""
                        className="img-fluid mb-2"
                        style={{ maxHeight: "120px", objectFit: "contain" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <label className="form-label small">Link URL</label>
                    <input
                      type="text"
                      className="form-control form-control-sm mb-2"
                      placeholder="/products/slug"
                      value={urls[img.ImageId] ?? ""}
                      onChange={(e) =>
                        handleUrlChange(img.ImageId, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger rounded-pill"
                      onClick={() => handleDeleteImageClick(img.ImageId)}
                      disabled={saving}
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <button
              type="button"
              className="btn btn-secondary rounded-pill px-4"
              disabled={saving}
              onClick={handleSaveImages}
            >
              {saving ? "Saving…" : "Save images (URLs & order)"}
            </button>
          </div>
        </>
      )}

      {images.length < MAX_IMAGES && (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-4">
            <h6 className="card-title fw-semibold mb-3">Add image</h6>
            <p className="text-muted small mb-3">
              Upload from your computer or enter a filename for an existing file
              in public/images/slider/.
            </p>
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label small">
                  Upload image (JPG, PNG, GIF, WebP)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="form-control form-control-sm"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  disabled={saving || uploading}
                />
                {(uploading || saving) && (
                  <small className="text-muted">
                    {uploading ? "Uploading…" : "Adding…"}
                  </small>
                )}
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label small">
                  Or type filename (existing file)
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="AAK322_Banner.jpg"
                  value={newImageSrc}
                  onChange={(e) => setNewImageSrc(e.target.value)}
                  disabled={saving || uploading}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label small">Link URL (optional)</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="/products/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  disabled={saving || uploading}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <button
                  type="button"
                  className="btn btn-primary rounded-pill"
                  disabled={saving || uploading || !newImageSrc.trim()}
                  onClick={handleAddImage}
                >
                  Add image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmModalProps && confirmModal.show && (
        <ConfirmDeleteModal
          show={confirmModal.show}
          onClose={closeConfirmModal}
          {...confirmModalProps}
        />
      )}
    </div>
  );
}
