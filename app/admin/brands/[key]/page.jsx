"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/utlis/showToast";

function ColorInput({ value, onChange, label, id }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="d-flex align-items-center gap-2">
        <input
          type="color"
          id={id}
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="form-control form-control-color p-1"
          style={{ width: "48px", height: "38px" }}
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="form-control"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

/** Options for Assurance Bar icon dropdown (value = icon class string) */
const ASSURANCE_BAR_ICON_OPTIONS = [
  { value: "icon-shipping", label: "Shipping" },
  { value: "icon-payment fs-22", label: "Payment" },
  { value: "icon-return fs-20", label: "Return" },
  { value: "icon-suport", label: "Support" },
  { value: "icon-shipping-1", label: "Shipping (alt)" },
  { value: "icon-payment-1", label: "Payment (alt)" },
  { value: "icon-return-1", label: "Return (alt)" },
  { value: "icon-suport-1", label: "Support (alt)" },
  { value: "icon-premium-support", label: "Premium Support" },
  { value: "icon-help", label: "Help" },
  { value: "icon-fast-shipping", label: "Fast Shipping" },
  { value: "icon-delivery-time", label: "Delivery Time" },
  { value: "icon-days-return", label: "Days Return" },
  { value: "icon-safe", label: "Safe" },
  { value: "icon-check", label: "Check" },
  { value: "icon-gift", label: "Gift" },
  { value: "icon-time", label: "Time" },
  { value: "icon-warranty", label: "Warranty" },
  { value: "icon-trial", label: "Trial" },
  { value: "__custom__", label: "Custom…" },
];

export default function AdminBrandEditPage() {
  const params = useParams();
  const router = useRouter();
  const key = params?.key;

  const [brand, setBrand] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchBrand = useCallback(async () => {
    if (!key) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/admin/brands/${encodeURIComponent(key)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load brand");
      }
      const data = await res.json();
      setBrand(data);
      setForm({
        name: data.name || "",
        companyName: data.companyName || "",
        companyNameShort: data.companyNameShort || "",
        copyrightName: data.copyrightName || "",
        themeColor: data.themeColor || "",
        buttonBadgeColor: data.buttonBadgeColor || "",
        buttonBadgeTextColor: data.buttonBadgeTextColor || "",
        primaryButtonTextColor: data.primaryButtonTextColor || "",
        assuranceBarBackgroundColor: data.assuranceBarBackgroundColor || "",
        assuranceBarTextColor: data.assuranceBarTextColor || "",
        defaultTitle: data.defaultTitle || "",
        defaultDescription: data.defaultDescription || "",
        faviconPath: data.faviconPath || "",
        ogImagePath: data.ogImagePath || "",
        defaultOgImagePath: data.defaultOgImagePath || "",
        logo: data.logo || {},
        contact: data.contact || {},
        social: data.social || {},
        assuranceBarItems: Array.isArray(data.assuranceBarItems)
          ? data.assuranceBarItems
          : [],
        aboutBrand: data.aboutBrand || null,
        isActive: data.isActive !== false,
        shopByMake: data.shopByMake || {
          sectionTitle: "",
          sectionSubtitle: "",
          items: [],
        },
        shopByCategory: (() => {
          const section = data.shopByCategory || {};
          const items =
            Array.isArray(section.items) && section.items.length > 0
              ? section.items
              : [
                  {
                    href: "/products/new",
                    title: "New Products",
                    subtitle: "Latest releases",
                    img: "/images/shop-categories/NewProductsGradient.jpg",
                  },
                  {
                    href: "/products/bmr-merchandise",
                    title: "BMR Merchandise",
                    subtitle: "Apparel & more",
                    img: "/images/shop-categories/MerchGradient.jpg",
                  },
                  {
                    href: "/products/gift-cards",
                    title: "BMR Gift Cards",
                    subtitle: "Perfect gift",
                    img: "/images/shop-categories/GiftCardsGradient.jpg",
                  },
                ];
          return {
            sectionTitle: section.sectionTitle?.trim() || "Shop by Category",
            sectionSubtitle:
              section.sectionSubtitle?.trim() ||
              "Browse our New Products, BMR Merchandise, and Gift Cards.",
            items,
          };
        })(),
        navLabels: data.navLabels || {},
        navUrls: data.navUrls || {},
        navOrder:
          Array.isArray(data.navOrder) && data.navOrder.length > 0
            ? data.navOrder
            : [
                "ford",
                "gmLateModel",
                "gmMidMuscle",
                "gmClassicMuscle",
                "mopar",
                "installation",
                "cart",
              ],
        navPlatformIds: Array.isArray(data.navPlatformIds)
          ? data.navPlatformIds
          : [],
      });
    } catch (err) {
      setError(err.message);
      setBrand(null);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    fetchBrand();
  }, [fetchBrand]);

  const updateForm = (path, value) => {
    const parts = path.split(".");
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
        cur = cur[p];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const updateAssuranceItem = (index, field, value) => {
    setForm((prev) => {
      const items = [...(prev.assuranceBarItems || [])];
      items[index] = { ...(items[index] || {}), [field]: value };
      return { ...prev, assuranceBarItems: items };
    });
  };

  const addAssuranceItem = () => {
    setForm((prev) => ({
      ...prev,
      assuranceBarItems: [
        ...(prev.assuranceBarItems || []),
        {
          iconClass: "",
          title: "",
          description: "",
          sortOrder: prev.assuranceBarItems?.length || 0,
        },
      ],
    }));
  };

  const removeAssuranceItem = (index) => {
    setForm((prev) => ({
      ...prev,
      assuranceBarItems: (prev.assuranceBarItems || []).filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const shopByMake = form.shopByMake || {
    sectionTitle: "",
    sectionSubtitle: "",
    items: [],
  };
  const updateShopByMake = (field, value) => {
    setForm((prev) => ({
      ...prev,
      shopByMake: { ...(prev.shopByMake || {}), [field]: value },
    }));
  };
  const updateShopByMakeItem = (index, field, value) => {
    setForm((prev) => {
      const items = [...(prev.shopByMake?.items || [])];
      items[index] = { ...(items[index] || {}), [field]: value };
      return {
        ...prev,
        shopByMake: { ...(prev.shopByMake || {}), items },
      };
    });
  };
  const addShopByMakeItem = () => {
    setForm((prev) => ({
      ...prev,
      shopByMake: {
        ...(prev.shopByMake || {}),
        items: [
          ...(prev.shopByMake?.items || []),
          { imagePath: "", title: "", link: "", shopNowLabel: "SHOP NOW" },
        ],
      },
    }));
  };
  const removeShopByMakeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      shopByMake: {
        ...(prev.shopByMake || {}),
        items: (prev.shopByMake?.items || []).filter((_, i) => i !== index),
      },
    }));
  };

  const shopByCategory = form.shopByCategory || {
    sectionTitle: "Shop by Category",
    sectionSubtitle: "",
    items: [],
  };
  const updateShopByCategory = (field, value) => {
    setForm((prev) => ({
      ...prev,
      shopByCategory: { ...(prev.shopByCategory || {}), [field]: value },
    }));
  };
  const updateShopByCategoryItem = (index, field, value) => {
    setForm((prev) => {
      const items = [...(prev.shopByCategory?.items || [])];
      items[index] = { ...(items[index] || {}), [field]: value };
      return {
        ...prev,
        shopByCategory: { ...(prev.shopByCategory || {}), items },
      };
    });
  };
  const addShopByCategoryItem = () => {
    setForm((prev) => ({
      ...prev,
      shopByCategory: {
        ...(prev.shopByCategory || {}),
        items: [
          ...(prev.shopByCategory?.items || []),
          { href: "", title: "", subtitle: "", img: "" },
        ],
      },
    }));
  };
  const removeShopByCategoryItem = (index) => {
    setForm((prev) => ({
      ...prev,
      shopByCategory: {
        ...(prev.shopByCategory || {}),
        items: (prev.shopByCategory?.items || []).filter((_, i) => i !== index),
      },
    }));
  };

  const [uploadingShopCategoryImage, setUploadingShopCategoryImage] =
    useState(null);
  const [uploadingShopByMakeImage, setUploadingShopByMakeImage] =
    useState(null);
  const handleShopByMakeImageUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingShopByMakeImage(index);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/admin/shop-by-make-images/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      updateShopByMakeItem(
        index,
        "imagePath",
        data.path || data.filename || "",
      );
      showToast("Image uploaded. Save brand to apply.", "success");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploadingShopByMakeImage(null);
      e.target.value = "";
    }
  };
  const handleShopCategoryImageUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingShopCategoryImage(index);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/admin/shop-category-images/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      updateShopByCategoryItem(index, "img", data.path || data.filename || "");
      showToast("Image uploaded. Save brand to apply.", "success");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploadingShopCategoryImage(null);
      e.target.value = "";
    }
  };

  const DEFAULT_NAV_PLACEHOLDERS = {
    ford: { label: "Ford", url: "/products/ford" },
    gmLateModel: {
      label: "GM Late Model Cars",
      url: "/products/gm/late-model",
    },
    gmMidMuscle: {
      label: "GM Mid Muscle Cars",
      url: "/products/gm/mid-muscle",
    },
    gmClassicMuscle: {
      label: "GM Classic Muscle Cars",
      url: "/products/gm/classic-muscle",
    },
    mopar: { label: "Mopar", url: "/products/mopar" },
    installation: { label: "Installation", url: "/installation" },
    cart: { label: "Cart", url: "/view-cart" },
  };

  const navOrder =
    Array.isArray(form.navOrder) && form.navOrder.length > 0
      ? form.navOrder
      : Object.keys(DEFAULT_NAV_PLACEHOLDERS);

  const toggleNavPlatform = (id) => {
    setForm((prev) => {
      const list = prev.navPlatformIds || [];
      const next = list.includes(id)
        ? list.filter((k) => k !== id)
        : [...list, id];
      return { ...prev, navPlatformIds: next };
    });
  };

  const addNavLink = () => {
    const newId = `link-${Date.now()}`;
    setForm((prev) => ({
      ...prev,
      navOrder: [...(prev.navOrder || []), newId],
      navLabels: { ...(prev.navLabels || {}), [newId]: "" },
      navUrls: { ...(prev.navUrls || {}), [newId]: "" },
      // New links are simple (not in navPlatformIds) by default
    }));
  };

  const removeNavLink = (id) => {
    setForm((prev) => {
      const nextOrder = (prev.navOrder || []).filter((k) => k !== id);
      const nextLabels = { ...(prev.navLabels || {}) };
      const nextUrls = { ...(prev.navUrls || {}) };
      const nextPlatformIds = (prev.navPlatformIds || []).filter(
        (k) => k !== id,
      );
      delete nextLabels[id];
      delete nextUrls[id];
      return {
        ...prev,
        navOrder: nextOrder,
        navLabels: nextLabels,
        navUrls: nextUrls,
        navPlatformIds: nextPlatformIds,
      };
    });
  };

  const moveNavLink = (id, direction) => {
    setForm((prev) => {
      const order = [...(prev.navOrder || [])];
      const idx = order.indexOf(id);
      if (idx === -1) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === order.length - 1) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      [order[idx], order[swapIdx]] = [order[swapIdx], order[idx]];
      return { ...prev, navOrder: order };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        companyName: form.companyName,
        companyNameShort: form.companyNameShort,
        copyrightName: form.copyrightName,
        themeColor: form.themeColor,
        buttonBadgeColor: form.buttonBadgeColor,
        buttonBadgeTextColor: form.buttonBadgeTextColor,
        primaryButtonTextColor: form.primaryButtonTextColor,
        assuranceBarBackgroundColor: form.assuranceBarBackgroundColor,
        assuranceBarTextColor: form.assuranceBarTextColor,
        defaultTitle: form.defaultTitle,
        defaultDescription: form.defaultDescription,
        faviconPath: form.faviconPath,
        ogImagePath: form.ogImagePath,
        defaultOgImagePath: form.defaultOgImagePath,
        logo: form.logo,
        contact: form.contact,
        social: form.social,
        assuranceBarItems: form.assuranceBarItems,
        aboutBrand: form.aboutBrand,
        isActive: form.isActive,
        shopByMake: form.shopByMake,
        shopByCategory: form.shopByCategory,
        navLabels: form.navLabels,
        navUrls: form.navUrls,
        navOrder: form.navOrder,
        navPlatformIds: Array.isArray(form.navPlatformIds)
          ? form.navPlatformIds
          : [],
      };

      const res = await fetch(`/api/admin/brands/${encodeURIComponent(key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save");
      showToast("Brand saved successfully.", "success");
      router.push("/admin/brands");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 mb-0 text-muted">Loading brand...</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="admin-page">
        <div className="py-4">
          <div className="alert alert-danger rounded-3">{error}</div>
          <Link href="/admin/brands" className="btn btn-outline-secondary">
            Back to Brands
          </Link>
        </div>
      </div>
    );
  }

  const contact = form.contact || {};
  const social = form.social || {};
  const logo = form.logo || {};
  const aboutBrand = form.aboutBrand || {};

  const displayName = form.companyNameShort?.trim() || form.name?.trim() || key;
  const accent = form.buttonBadgeColor || form.themeColor || "#db1215";
  const onAccent = form.buttonBadgeTextColor || "#fff";
  const brandAccentStyle = {
    "--admin-brand-accent": accent,
    "--admin-brand-on-accent": onAccent,
  };

  return (
    <div className="admin-page" style={brandAccentStyle}>
      <div className="admin-brand-edit py-4">
        <div className="admin-page-header-modern">
          <div>
            <div className="admin-brand-title-row">
              <h1 className="admin-brand-title">{displayName}</h1>
              <span
                className={
                  form.isActive
                    ? "admin-brand-badge admin-brand-badge--active"
                    : "admin-brand-badge admin-brand-badge--inactive"
                }
              >
                {form.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="admin-brand-subtitle">Brand settings</p>
          </div>
          <div className="admin-brand-actions-header">
            <Link href="/admin/brands" className="btn btn-outline-secondary">
              Back to Brands
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-brand-card">
            <div className="admin-brand-card-header">
              <h2 className="admin-brand-card-title">
                <span className="admin-brand-section-badge">Identity</span>
                Brand Identity
              </h2>
            </div>
            <div className="admin-brand-card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.name || ""}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="BMR Suspension"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.companyName || ""}
                    onChange={(e) => updateForm("companyName", e.target.value)}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Company Name Short</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.companyNameShort || ""}
                    onChange={(e) =>
                      updateForm("companyNameShort", e.target.value)
                    }
                    placeholder="BMR"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Copyright Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.copyrightName || ""}
                  onChange={(e) => updateForm("copyrightName", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="admin-brand-card">
            <div className="admin-brand-card-header">
              <h2 className="admin-brand-card-title">
                <span className="admin-brand-section-badge">Media</span>
                Logos & Media
              </h2>
            </div>
            <div className="admin-brand-card-body">
              <div className="mb-3">
                <label className="form-label">Header Logo Path</label>
                <input
                  type="text"
                  className="form-control"
                  value={logo.headerPath || ""}
                  onChange={(e) =>
                    updateForm("logo", { ...logo, headerPath: e.target.value })
                  }
                  placeholder="/brands/bmr/images/logo/..."
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Footer Logo Path</label>
                <input
                  type="text"
                  className="form-control"
                  value={logo.footerPath || ""}
                  onChange={(e) =>
                    updateForm("logo", { ...logo, footerPath: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Favicon Path</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.faviconPath || ""}
                  onChange={(e) => updateForm("faviconPath", e.target.value)}
                  placeholder="/brands/bmr/favicons/favicon.svg"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">OG Image Path</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.ogImagePath || ""}
                  onChange={(e) => updateForm("ogImagePath", e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Default OG Image Path</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.defaultOgImagePath || ""}
                  onChange={(e) =>
                    updateForm("defaultOgImagePath", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="admin-brand-card">
            <div className="admin-brand-card-header">
              <h2 className="admin-brand-card-title">
                <span className="admin-brand-section-badge">Theme</span>
                Theme Colors
              </h2>
            </div>
            <div className="admin-brand-card-body">
              <div className="row">
                <div className="col-md-6">
                  <ColorInput
                    id="themeColor"
                    label="Primary Color"
                    value={form.themeColor}
                    onChange={(v) => updateForm("themeColor", v)}
                  />
                </div>
                <div className="col-md-6">
                  <ColorInput
                    id="buttonBadgeColor"
                    label="Button Badge Color"
                    value={form.buttonBadgeColor}
                    onChange={(v) => updateForm("buttonBadgeColor", v)}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <ColorInput
                    id="buttonBadgeTextColor"
                    label="Button Badge Text Color"
                    value={form.buttonBadgeTextColor}
                    onChange={(v) => updateForm("buttonBadgeTextColor", v)}
                  />
                </div>
                <div className="col-md-6">
                  <ColorInput
                    id="primaryButtonTextColor"
                    label="Primary Button Text Color"
                    value={form.primaryButtonTextColor}
                    onChange={(v) => updateForm("primaryButtonTextColor", v)}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <ColorInput
                    id="assuranceBarBg"
                    label="Assurance Bar Background"
                    value={form.assuranceBarBackgroundColor}
                    onChange={(v) =>
                      updateForm("assuranceBarBackgroundColor", v)
                    }
                  />
                </div>
                <div className="col-md-6">
                  <ColorInput
                    id="assuranceBarText"
                    label="Assurance Bar Text Color"
                    value={form.assuranceBarTextColor}
                    onChange={(v) => updateForm("assuranceBarTextColor", v)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-brand-card">
            <div className="admin-brand-card-header">
              <h2 className="admin-brand-card-title">
                <span className="admin-brand-section-badge">Contact</span>
                Contact
              </h2>
            </div>
            <div className="admin-brand-card-body">
              <div className="mb-3">
                <label className="form-label">
                  Address (one line per address line)
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={(contact.addressLines || []).join("\n")}
                  onChange={(e) =>
                    updateForm("contact", {
                      ...contact,
                      addressLines: e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="1033 Pine Chase Ave&#10;Lakeland, FL 33815"
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={contact.email || ""}
                    onChange={(e) =>
                      updateForm("contact", {
                        ...contact,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone (Display)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={contact.phoneDisplay || ""}
                    onChange={(e) =>
                      updateForm("contact", {
                        ...contact,
                        phoneDisplay: e.target.value,
                      })
                    }
                    placeholder="(813) 986-9302"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Phone (tel link, digits only)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={contact.phoneTel || ""}
                  onChange={(e) =>
                    updateForm("contact", {
                      ...contact,
                      phoneTel: e.target.value,
                    })
                  }
                  placeholder="8139869302"
                />
              </div>
            </div>
          </div>

          <div className="admin-brand-card">
            <div className="admin-brand-card-header">
              <h2 className="admin-brand-card-title">
                <span className="admin-brand-section-badge">Social</span>
                Social Links
              </h2>
            </div>
            <div className="admin-brand-card-body">
              <div className="row">
                {[
                  "facebook",
                  "instagram",
                  "youtube",
                  "tiktok",
                  "x",
                  "linkedin",
                ].map((platform) => (
                  <div className="col-md-6 mb-3" key={platform}>
                    <label className="form-label text-capitalize">
                      {platform === "x" ? "X (Twitter)" : platform}
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      value={social[platform] || ""}
                      onChange={(e) =>
                        updateForm("social", {
                          ...social,
                          [platform]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-brand-card">
            <div className="admin-brand-card-header">
              <h2 className="admin-brand-card-title">
                <span className="admin-brand-section-badge">Footer Bar</span>
                Assurance Bar Items (Homepage above footer)
              </h2>
              <button
                type="button"
                className="admin-brand-btn-add"
                onClick={addAssuranceItem}
              >
                + Add
              </button>
            </div>
            <div className="admin-brand-card-body">
              {(form.assuranceBarItems || []).map((item, idx) => (
                <div key={idx} className="admin-brand-list-item">
                  <span className="admin-brand-list-item-badge">{idx + 1}</span>
                  <div className="admin-brand-list-item-fields">
                    <div className="mb-2">
                      <label
                        htmlFor={`assurance-icon-${idx}`}
                        className="form-label small mb-1"
                      >
                        Icon
                      </label>
                      {(() => {
                        const iconClass = item.iconClass || "";
                        const matchingPreset = ASSURANCE_BAR_ICON_OPTIONS.find(
                          (o) =>
                            o.value !== "__custom__" && o.value === iconClass,
                        );
                        const isCustom = !matchingPreset;
                        return (
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <select
                              id={`assurance-icon-${idx}`}
                              className="form-select form-select-sm"
                              style={{ maxWidth: "220px" }}
                              value={
                                matchingPreset
                                  ? matchingPreset.value
                                  : "__custom__"
                              }
                              onChange={(e) => {
                                const v = e.target.value;
                                updateAssuranceItem(
                                  idx,
                                  "iconClass",
                                  v === "__custom__" ? "" : v,
                                );
                              }}
                            >
                              {ASSURANCE_BAR_ICON_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            {isCustom && (
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                style={{ minWidth: "160px" }}
                                placeholder="e.g. icon-shipping fs-22"
                                value={iconClass}
                                onChange={(e) =>
                                  updateAssuranceItem(
                                    idx,
                                    "iconClass",
                                    e.target.value,
                                  )
                                }
                              />
                            )}
                            {iconClass && (
                              <span
                                className="d-inline-flex align-items-center justify-content-center rounded bg-light border"
                                style={{
                                  width: 28,
                                  height: 28,
                                  fontSize: "1rem",
                                }}
                                title={iconClass}
                              >
                                <i className={iconClass} />
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="mb-2">
                      <label
                        htmlFor={`assurance-title-${idx}`}
                        className="form-label small mb-1"
                      >
                        Title
                      </label>
                      <input
                        type="text"
                        id={`assurance-title-${idx}`}
                        className="form-control form-control-sm"
                        placeholder="e.g. Free Shipping"
                        value={item.title || ""}
                        onChange={(e) =>
                          updateAssuranceItem(idx, "title", e.target.value)
                        }
                      />
                    </div>
                    <div className="mb-0">
                      <label
                        htmlFor={`assurance-desc-${idx}`}
                        className="form-label small mb-1"
                      >
                        Description
                      </label>
                      <input
                        type="text"
                        id={`assurance-desc-${idx}`}
                        className="form-control form-control-sm"
                        placeholder="e.g. Free shipping to the 48 states"
                        value={item.description || ""}
                        onChange={(e) =>
                          updateAssuranceItem(
                            idx,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="admin-brand-list-item-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeAssuranceItem(idx)}
                      aria-label="Remove"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-brand-card">
            <div className="admin-brand-card-header">
              <h2 className="admin-brand-card-title">
                <span className="admin-brand-section-badge">Home</span>
                Shop By Make (homepage section)
              </h2>
              <button
                type="button"
                className="admin-brand-btn-add"
                onClick={addShopByMakeItem}
              >
                + Add section
              </button>
            </div>
            <div className="admin-brand-card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Section title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shopByMake.sectionTitle || ""}
                    onChange={(e) =>
                      updateShopByMake("sectionTitle", e.target.value)
                    }
                    placeholder="Shop by Make"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Section subtitle</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shopByMake.sectionSubtitle || ""}
                    onChange={(e) =>
                      updateShopByMake("sectionSubtitle", e.target.value)
                    }
                    placeholder="Find parts for Ford, GM, and Dodge platforms."
                  />
                </div>
              </div>
              {(shopByMake.items || []).map((item, idx) => (
                <div key={`make-${idx}`} className="admin-brand-list-item">
                  <span className="admin-brand-list-item-badge">{idx + 1}</span>
                  <div className="admin-brand-list-item-fields">
                    <div className="row">
                      <div className="col-12 mb-2">
                        <label className="form-label small mb-1">
                          Image (path or upload from PC)
                        </label>
                        <div className="d-flex gap-2 flex-wrap align-items-center">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ minWidth: "200px" }}
                            placeholder="/images/logo/Ford_Logo.png"
                            value={item.imagePath || ""}
                            onChange={(e) =>
                              updateShopByMakeItem(
                                idx,
                                "imagePath",
                                e.target.value,
                              )
                            }
                          />
                          <label className="btn btn-sm btn-outline-primary mb-0">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                              className="visually-hidden"
                              onChange={(e) =>
                                handleShopByMakeImageUpload(e, idx)
                              }
                              disabled={
                                uploadingShopByMakeImage !== null &&
                                uploadingShopByMakeImage !== idx
                              }
                            />
                            {uploadingShopByMakeImage === idx
                              ? "Uploading…"
                              : "Browse / Upload"}
                          </label>
                        </div>
                        {(item.imagePath || "").startsWith("http") && (
                          <div className="mt-1">
                            <img
                              src={item.imagePath}
                              alt=""
                              style={{
                                maxHeight: 48,
                                objectFit: "contain",
                                borderRadius: 4,
                              }}
                            />
                          </div>
                        )}
                        {(item.imagePath || "").startsWith("/") && (
                          <div className="mt-1">
                            <img
                              src={item.imagePath}
                              alt=""
                              style={{
                                maxHeight: 48,
                                objectFit: "contain",
                                borderRadius: 4,
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="col-md-6 mb-2">
                        <label className="form-label small mb-1">Title</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="FORD"
                          value={item.title || ""}
                          onChange={(e) =>
                            updateShopByMakeItem(idx, "title", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <label className="form-label small mb-1">
                          Link (path)
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="products/ford"
                          value={item.link || ""}
                          onChange={(e) =>
                            updateShopByMakeItem(idx, "link", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <label className="form-label small mb-1">
                          Shop Now label
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="SHOP NOW"
                          value={item.shopNowLabel || ""}
                          onChange={(e) =>
                            updateShopByMakeItem(
                              idx,
                              "shopNowLabel",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="admin-brand-list-item-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeShopByMakeItem(idx)}
                      aria-label="Remove"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-brand-card">
            <div className="admin-brand-card-header">
              <h2 className="admin-brand-card-title">
                <span className="admin-brand-section-badge">Home</span>
                Shop by Category (homepage cards)
              </h2>
              <button
                type="button"
                className="admin-brand-btn-add"
                onClick={addShopByCategoryItem}
              >
                + Add card
              </button>
            </div>
            <div className="admin-brand-card-body">
              <p className="admin-brand-nav-intro mb-3">
                Full-bleed image tiles on the homepage. Upload an image or enter
                a path. Order is preserved.
              </p>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Section title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shopByCategory.sectionTitle || ""}
                    onChange={(e) =>
                      updateShopByCategory("sectionTitle", e.target.value)
                    }
                    placeholder="Shop by Category"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Section subtitle</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shopByCategory.sectionSubtitle || ""}
                    onChange={(e) =>
                      updateShopByCategory("sectionSubtitle", e.target.value)
                    }
                    placeholder="Browse our New Products, Merchandise, and Gift Cards."
                  />
                </div>
              </div>
              {(shopByCategory.items || []).map((item, idx) => (
                <div key={`cat-${idx}`} className="admin-brand-list-item">
                  <span className="admin-brand-list-item-badge">{idx + 1}</span>
                  <div className="admin-brand-list-item-fields">
                    <div className="row">
                      <div className="col-12 mb-2">
                        <label className="form-label small mb-1">
                          Image (path or upload from PC)
                        </label>
                        <div className="d-flex gap-2 flex-wrap align-items-center">
                          <input
                            type="text"
                            className="form-control form-control-sm flex-grow-1"
                            style={{ minWidth: "200px" }}
                            placeholder="/images/shop-categories/MyImage.jpg"
                            value={item.img || ""}
                            onChange={(e) =>
                              updateShopByCategoryItem(
                                idx,
                                "img",
                                e.target.value,
                              )
                            }
                          />
                          <label className="btn btn-sm btn-outline-primary mb-0">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                              className="visually-hidden"
                              onChange={(e) =>
                                handleShopCategoryImageUpload(e, idx)
                              }
                              disabled={
                                uploadingShopCategoryImage !== null &&
                                uploadingShopCategoryImage !== idx
                              }
                            />
                            {uploadingShopCategoryImage === idx
                              ? "Uploading…"
                              : "Browse / Upload"}
                          </label>
                        </div>
                        {(item.img || "").startsWith("http") && (
                          <div className="mt-1">
                            <img
                              src={item.img}
                              alt=""
                              style={{
                                maxHeight: 48,
                                objectFit: "contain",
                                borderRadius: 4,
                              }}
                            />
                          </div>
                        )}
                        {(item.img || "").startsWith("/") &&
                          !item.img.startsWith("http") && (
                            <div className="mt-1">
                              <img
                                src={item.img}
                                alt=""
                                style={{
                                  maxHeight: 48,
                                  objectFit: "contain",
                                  borderRadius: 4,
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                      </div>
                      <div className="col-md-6 mb-2">
                        <label className="form-label small mb-1">Title</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="New Products"
                          value={item.title || ""}
                          onChange={(e) =>
                            updateShopByCategoryItem(
                              idx,
                              "title",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <label className="form-label small mb-1">
                          Subtitle
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Latest releases"
                          value={item.subtitle || ""}
                          onChange={(e) =>
                            updateShopByCategoryItem(
                              idx,
                              "subtitle",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <label className="form-label small mb-1">
                          Link (path)
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="/products/new"
                          value={item.href || ""}
                          onChange={(e) =>
                            updateShopByCategoryItem(
                              idx,
                              "href",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="admin-brand-list-item-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeShopByCategoryItem(idx)}
                      aria-label="Remove"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-brand-card">
            <div className="admin-brand-card-header">
              <h2 className="admin-brand-card-title">
                <span className="admin-brand-section-badge">Nav</span>
                Mega menu labels &amp; URLs
              </h2>
              <button
                type="button"
                className="admin-brand-btn-add"
                onClick={addNavLink}
              >
                + Add link
              </button>
            </div>
            <div className="admin-brand-card-body">
              <p className="admin-brand-nav-intro">
                Label and URL for each main navigation link. Order matches the
                menu. Check &quot;Dropdown&quot; for items that show a mega menu
                (e.g. Ford, Mopar). Leave unchecked for plain links (e.g.
                Installation, Cart).
              </p>
              {navOrder.map((k, index) => {
                const place = DEFAULT_NAV_PLACEHOLDERS[k] || {
                  label: "New link",
                  url: "/",
                };
                const isPlatform = (form.navPlatformIds || []).includes(k);
                const canMoveUp = index > 0;
                const canMoveDown = index < navOrder.length - 1;
                return (
                  <div key={k} className="admin-brand-nav-row">
                    <span className="admin-brand-nav-order">{index + 1}</span>
                    <div className="admin-brand-nav-move">
                      <button
                        type="button"
                        onClick={() => moveNavLink(k, "up")}
                        disabled={!canMoveUp}
                        aria-label="Move up"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveNavLink(k, "down")}
                        disabled={!canMoveDown}
                        aria-label="Move down"
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>
                    <div className="admin-brand-nav-fields">
                      <div className="admin-brand-nav-field">
                        <label>Label</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={form.navLabels?.[k] ?? ""}
                          onChange={(e) =>
                            updateForm("navLabels", {
                              ...(form.navLabels || {}),
                              [k]: e.target.value,
                            })
                          }
                          placeholder={place.label}
                        />
                      </div>
                      <div className="admin-brand-nav-field">
                        <label>URL</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={form.navUrls?.[k] ?? ""}
                          onChange={(e) =>
                            updateForm("navUrls", {
                              ...(form.navUrls || {}),
                              [k]: e.target.value,
                            })
                          }
                          placeholder={place.url}
                        />
                      </div>
                    </div>
                    <div className="admin-brand-nav-delete">
                      <button
                        type="button"
                        onClick={() => removeNavLink(k)}
                        aria-label="Delete"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="w-100">
                      <div className="admin-brand-nav-dropdown-wrap">
                        <label className="admin-brand-nav-dropdown-badge">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`nav-platform-${k}`}
                            checked={isPlatform}
                            onChange={() => toggleNavPlatform(k)}
                          />
                          Dropdown (mega menu)
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="admin-brand-card">
            <div className="admin-brand-card-header">
              <h2 className="admin-brand-card-title">
                <span className="admin-brand-section-badge">About</span>
                About Brand
              </h2>
            </div>
            <div className="admin-brand-card-body">
              <div className="mb-3">
                <label className="form-label">Heading</label>
                <input
                  type="text"
                  className="form-control"
                  value={aboutBrand.heading || ""}
                  onChange={(e) =>
                    updateForm("aboutBrand", {
                      ...aboutBrand,
                      heading: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Paragraphs (one per line)</label>
                <textarea
                  className="form-control"
                  rows={5}
                  value={(aboutBrand.paragraphs || []).join("\n\n")}
                  onChange={(e) =>
                    updateForm("aboutBrand", {
                      ...aboutBrand,
                      paragraphs: e.target.value
                        .split(/\n\n+/)
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">CTA Label</label>
                  <input
                    type="text"
                    className="form-control"
                    value={aboutBrand.ctaLabel || ""}
                    onChange={(e) =>
                      updateForm("aboutBrand", {
                        ...aboutBrand,
                        ctaLabel: e.target.value,
                      })
                    }
                    placeholder="Contact Support"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">CTA Href</label>
                  <input
                    type="text"
                    className="form-control"
                    value={aboutBrand.ctaHref || ""}
                    onChange={(e) =>
                      updateForm("aboutBrand", {
                        ...aboutBrand,
                        ctaHref: e.target.value,
                      })
                    }
                    placeholder="/contact"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-brand-card">
            <div className="admin-brand-card-header">
              <h2 className="admin-brand-card-title">
                <span className="admin-brand-section-badge">SEO</span>
                SEO
              </h2>
            </div>
            <div className="admin-brand-card-body">
              <div className="mb-3">
                <label className="form-label">Default Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.defaultTitle || ""}
                  onChange={(e) => updateForm("defaultTitle", e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Default Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.defaultDescription || ""}
                  onChange={(e) =>
                    updateForm("defaultDescription", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="admin-brand-active-card">
            <span className="admin-brand-active-label">
              Brand is live on the site
            </span>
            <div className="form-check form-switch mb-0">
              <input
                type="checkbox"
                className="form-check-input"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => updateForm("isActive", e.target.checked)}
              />
              <label className="form-check-label" htmlFor="isActive">
                Active
              </label>
            </div>
          </div>

          <div className="admin-brand-form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save brand"}
            </button>
            <Link href="/admin/brands" className="btn btn-outline-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
