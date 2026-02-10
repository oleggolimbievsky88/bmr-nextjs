"use client";

import { useState, useEffect } from "react";
import { showToast } from "@/utlis/showToast";

export default function AdminBannerPage() {
  const [banner, setBanner] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [urls, setUrls] = useState({});

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch("/api/admin/banner");
        if (!res.ok) throw new Error("Failed to fetch banner");
        const data = await res.json();
        setBanner(data.banner);
        setImages(data.images || []);
        const initial = {};
        (data.images || []).forEach((img) => {
          initial[img.ImageId] = img.ImageUrl || "";
        });
        setUrls(initial);
      } catch (e) {
        showToast(e.message || "Failed to load banner", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, []);

  const handleUrlChange = (imageId, value) => {
    setUrls((prev) => ({ ...prev, [imageId]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(urls).map(([imageId, imageUrl]) => ({
        imageId: Number(imageId),
        imageUrl: String(imageUrl).trim() || "",
      }));
      const res = await fetch("/api/admin/banner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update");
      }
      showToast("Banner links saved.", "success");
    } catch (e) {
      showToast(e.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-form-title mb-4">
        <h1>Banners</h1>
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  const hasBanner = banner != null;
  const hasImages = images && images.length > 0;

  return (
    <div className="admin-form-title mb-4">
      <h1>Banners</h1>
      {!hasBanner && (
        <p className="text-muted mb-4">
          No banner in the database yet. Add a banner row (e.g. in your DB set
          display = 1 for the banner you want to use), then refresh this page.
        </p>
      )}
      {hasBanner && !hasImages && (
        <p className="text-muted mb-4">
          This banner has no images. Add rows to the bannerimages table for
          bannerid = {banner.bannerid}, then refresh to set link URLs.
        </p>
      )}
      {hasBanner && hasImages && (
        <>
          <p className="text-muted mb-4">
            Set the link URL for each banner image (e.g. /products/platform-slug
            or /product/123). Leave blank for no link.
          </p>
          <div className="row g-3">
            {images.map((img) => (
              <div key={img.ImageId} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100">
                  <div className="card-body">
                    {img.ImageSrc && (
                      <img
                        src={
                          img.ImageSrc.startsWith("/")
                            ? img.ImageSrc
                            : `/${img.ImageSrc}`
                        }
                        alt=""
                        className="img-fluid mb-2"
                        style={{ maxHeight: "120px", objectFit: "contain" }}
                      />
                    )}
                    <label className="form-label small">Link URL</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="/products/2024-2025-mustang"
                      value={urls[img.ImageId] ?? ""}
                      onChange={(e) =>
                        handleUrlChange(img.ImageId, e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="btn btn-primary"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saving…" : "Save link URLs"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
