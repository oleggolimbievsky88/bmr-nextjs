"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

const PER_PAGE = 50;
const IMAGE_BASE = "https://bmrsuspension.com/siteart/products";
const ALL = "";

function formatPrice(val) {
  const n = parseFloat(val);
  if (Number.isNaN(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function getProductImageUrl(p) {
  const small = (p.ImageSmall && String(p.ImageSmall).trim()) || "";
  const large = (p.ImageLarge && String(p.ImageLarge).trim()) || "";
  const filename = (small !== "" && small !== "0" ? small : large) || "";
  if (!filename || filename === "0") return null;
  return `${IMAGE_BASE}/${encodeURIComponent(filename)}`;
}

function getPlatformLabel(platforms, bodyId) {
  if (!bodyId || !platforms || !platforms.length) return "—";
  const b = platforms.find((x) => String(x.id) === String(bodyId));
  if (!b) return "—";
  const start = b.StartYear ?? b.startYear ?? "";
  const end = b.EndYear ?? b.endYear ?? "";
  if (start && end) {
    return start === end ? `${start} ${b.name}` : `${start}-${end} ${b.name}`;
  }
  return b.name || "—";
}

/** Product Color is comma-separated color IDs (e.g. "1,2"). */
function parseProductColorIds(colorStr) {
  if (!colorStr || typeof colorStr !== "string") return [];
  return String(colorStr)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Comma-separated IDs (Grease, AngleFinder, Hardware). */
function parseProductAddonIds(str) {
  if (!str || typeof str !== "string") return [];
  return String(str)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** CSS class for color column: Red -> light red tint; Black Hammertone (powder coat) -> dark. */
function getColorColumnClass(colorName) {
  const name = (colorName || "").toLowerCase();
  if (name === "red") return "dealer-col-red";
  if (name.includes("hammertone")) return "dealer-col-black";
  return "";
}

export default function DealersPortalProductsPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [platformId, setPlatformId] = useState(ALL);
  const [mainCatId, setMainCatId] = useState(ALL);
  const [catId, setCatId] = useState(ALL);
  const [vendorId, setVendorId] = useState(ALL);
  const [filterOptions, setFilterOptions] = useState({
    platforms: [],
    mainCategories: [],
    categories: [],
    vendors: [],
  });
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [addToPOModal, setAddToPOModal] = useState(null);
  const [addToPOQty, setAddToPOQty] = useState(1);
  const [addToPOColorId, setAddToPOColorId] = useState("");
  const [addToPOColors, setAddToPOColors] = useState([]);
  const [addToPOSending, setAddToPOSending] = useState(false);
  const [addToPOError, setAddToPOError] = useState(null);
  const [draftPOId, setDraftPOId] = useState(null);
  const [colorList, setColorList] = useState([]);
  const [greaseList, setGreaseList] = useState([]);
  const [anglefinderList, setAnglefinderList] = useState([]);
  const [hardwareList, setHardwareList] = useState([]);
  const [rowQtys, setRowQtys] = useState({});
  const [rowAddOns, setRowAddOns] = useState({});
  const [addRowSending, setAddRowSending] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/dealer/filter-options").then((r) => r.json()),
      fetch("/api/dealer/colors").then((r) => r.json()),
      fetch("/api/grease").then((r) => r.json()),
      fetch("/api/anglefinder").then((r) => r.json()),
      fetch("/api/hardware").then((r) => r.json()),
    ])
      .then(([data, colorsData, greaseData, anglefinderData, hardwareData]) => {
        if (!cancelled && data.success) {
          setFilterOptions({
            platforms: data.platforms || [],
            mainCategories: data.mainCategories || [],
            categories: data.categories || [],
            vendors: data.vendors || [],
          });
        }
        if (!cancelled && colorsData.success && colorsData.colors) {
          setColorList(colorsData.colors);
        }
        if (!cancelled && greaseData.success && greaseData.grease) {
          setGreaseList(greaseData.grease);
        }
        if (
          !cancelled &&
          anglefinderData.success &&
          anglefinderData.anglefinder
        ) {
          setAnglefinderList(anglefinderData.anglefinder);
        }
        if (!cancelled && hardwareData.success && hardwareData.hardware) {
          setHardwareList(hardwareData.hardware);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setOptionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(PER_PAGE),
        offset: String(page * PER_PAGE),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (platformId && platformId !== ALL) params.set("bodyId", platformId);
      if (mainCatId && mainCatId !== ALL) params.set("mainCatId", mainCatId);
      if (catId && catId !== ALL) params.set("catId", catId);
      if (vendorId && vendorId !== ALL) params.set("vendorId", vendorId);
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
  }, [page, debouncedSearch, platformId, mainCatId, catId, vendorId]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, platformId, mainCatId, catId, vendorId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.ceil(total / PER_PAGE) || 1;

  const openAddToPOModal = useCallback(async (product) => {
    setAddToPOError(null);
    setAddToPOQty(1);
    setAddToPOColorId("");
    try {
      const res = await fetch("/api/dealer/po", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load PO");
      setDraftPOId(data.po?.id || null);
      const colorsRes = await fetch("/api/dealer/colors");
      const colorsData = await colorsRes.json();
      if (colorsData.success && colorsData.colors) {
        setAddToPOColors(colorsData.colors);
      }
      setAddToPOModal(product);
    } catch (err) {
      setAddToPOError(err.message);
    }
  }, []);

  const closeAddToPOModal = useCallback(() => {
    setAddToPOModal(null);
    setAddToPOError(null);
  }, []);

  const submitAddToPO = useCallback(async () => {
    if (!addToPOModal || !draftPOId) return;
    setAddToPOSending(true);
    setAddToPOError(null);
    const color = addToPOColors.find(
      (c) => String(c.ColorID) === String(addToPOColorId)
    );
    try {
      const res = await fetch("/api/dealer/po/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poId: draftPOId,
          productId: addToPOModal.ProductID,
          partNumber: addToPOModal.PartNumber,
          productName: addToPOModal.ProductName,
          quantity: addToPOQty,
          colorId: color ? color.ColorID : null,
          colorName: color ? color.ColorName : null,
          unitPrice: addToPOModal.dealerPrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add");
      closeAddToPOModal();
    } catch (err) {
      setAddToPOError(err.message);
    } finally {
      setAddToPOSending(false);
    }
  }, [
    addToPOModal,
    draftPOId,
    addToPOQty,
    addToPOColorId,
    addToPOColors,
    closeAddToPOModal,
  ]);

  const setRowQty = useCallback((productId, colorId, value) => {
    const raw =
      value === "" || value == null ? "" : String(value).replace(/\D/g, "");
    setRowQtys((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), [colorId]: raw },
    }));
  }, []);

  const setRowAddOn = useCallback((productId, field, value) => {
    setRowAddOns((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), [field]: value },
    }));
  }, []);

  const addRowToPO = useCallback(
    async (product) => {
      const qtys = rowQtys[product.ProductID] || {};
      const addons = rowAddOns[product.ProductID] || {};
      const productColorIds = parseProductColorIds(product.Color);
      const getQty = (cid) => Math.max(0, parseInt(qtys[cid], 10) || 0);
      const toAdd = colorList
        .filter((c) => productColorIds.includes(String(c.ColorID)))
        .filter((c) => getQty(c.ColorID) > 0)
        .map((c) => ({ color: c, qty: getQty(c.ColorID) }));
      if (toAdd.length === 0) return;
      const grease = greaseList.find(
        (g) => String(g.GreaseID) === String(addons.greaseId)
      );
      const anglefinder = anglefinderList.find(
        (a) => String(a.AngleID) === String(addons.anglefinderId)
      );
      const hardware = hardwareList.find(
        (h) => String(h.HardwareID) === String(addons.hardwareId)
      );
      setAddRowSending(product.ProductID);
      setAddToPOError(null);
      try {
        let poId = draftPOId;
        if (!poId) {
          const res = await fetch("/api/dealer/po", { method: "POST" });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to load PO");
          poId = data.po?.id || null;
          setDraftPOId(poId);
        }
        if (!poId) throw new Error("No purchase order");
        for (const { color, qty } of toAdd) {
          const res = await fetch("/api/dealer/po/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              poId,
              productId: product.ProductID,
              partNumber: product.PartNumber,
              productName: product.ProductName,
              quantity: qty,
              colorId: color.ColorID,
              colorName: color.ColorName,
              unitPrice: product.dealerPrice,
              greaseId: grease ? grease.GreaseID : null,
              greaseName: grease ? grease.GreaseName : null,
              anglefinderId: anglefinder ? anglefinder.AngleID : null,
              anglefinderName: anglefinder ? anglefinder.AngleName : null,
              hardwareId: hardware ? hardware.HardwareID : null,
              hardwareName: hardware ? hardware.HardwareName : null,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to add");
        }
        setRowQtys((prev) => {
          const next = { ...prev };
          const pid = product.ProductID;
          if (next[pid]) {
            const nextPid = { ...next[pid] };
            toAdd.forEach(({ color }) => {
              nextPid[color.ColorID] = "";
            });
            next[pid] = nextPid;
          }
          return next;
        });
      } catch (err) {
        setAddToPOError(err.message);
      } finally {
        setAddRowSending(null);
      }
    },
    [
      rowQtys,
      rowAddOns,
      colorList,
      greaseList,
      anglefinderList,
      hardwareList,
      draftPOId,
    ]
  );

  const mainCategoriesForPlatform =
    platformId && platformId !== ALL
      ? (filterOptions.mainCategories || []).filter(
          (m) => String(m.bodyId ?? m.BodyID ?? "") === String(platformId)
        )
      : filterOptions.mainCategories || [];

  const categoriesFiltered =
    mainCatId && mainCatId !== ALL
      ? (filterOptions.categories || []).filter(
          (c) => String(c.MainCatID ?? c.mainCatId ?? "") === String(mainCatId)
        )
      : filterOptions.categories || [];
  const categoriesInMain = categoriesFiltered.filter(
    (c, i, arr) => arr.findIndex((x) => String(x.id) === String(c.id)) === i
  );

  const handleClearFilters = () => {
    setSearch("");
    setPlatformId(ALL);
    setMainCatId(ALL);
    setCatId(ALL);
    setVendorId(ALL);
    setPage(0);
  };

  const hasActiveFilters =
    search ||
    (platformId && platformId !== ALL) ||
    (mainCatId && mainCatId !== ALL) ||
    (catId && catId !== ALL) ||
    (vendorId && vendorId !== ALL);

  return (
    <div className="my-account-content">
      <h5 className="fw-bold mb_30">Dealer Products</h5>

      <div className="dealer-products-filters mb-4">
        <div className="row g-3 align-items-end flex-wrap">
          <div className="col-12 col-sm-6 col-md-4 col-lg-2">
            <label className="form-label small mb-1">Search</label>
            <input
              type="search"
              className="form-control form-control-sm dealer-filter-input rounded"
              placeholder="Part number or product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-6 col-sm-6 col-md-4 col-lg-2">
            <label className="form-label small mb-1">Platform</label>
            <select
              className="form-select form-select-sm dealer-filter-input rounded"
              value={platformId}
              onChange={(e) => {
                setPlatformId(e.target.value);
                setMainCatId(ALL);
                setCatId(ALL);
              }}
              disabled={optionsLoading}
            >
              <option value={ALL}>All</option>
              {(filterOptions.platforms || []).map((b) => {
                const start = b.StartYear ?? b.startYear ?? "";
                const end = b.EndYear ?? b.endYear ?? "";
                const years =
                  start && end
                    ? start === end
                      ? `${start} `
                      : `${start}-${end} `
                    : "";
                return (
                  <option key={b.id} value={b.id}>
                    {years}
                    {b.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="col-6 col-sm-6 col-md-4 col-lg-2">
            <label className="form-label small mb-1">Main category</label>
            <select
              className="form-select form-select-sm dealer-filter-input rounded"
              value={mainCatId}
              onChange={(e) => {
                setMainCatId(e.target.value);
                setCatId(ALL);
              }}
              disabled={optionsLoading}
            >
              <option value={ALL}>All</option>
              {mainCategoriesForPlatform.map((m) => (
                <option key={`${m.bodyId ?? m.BodyID}-${m.id}`} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 col-sm-6 col-md-4 col-lg-2">
            <label className="form-label small mb-1">Category</label>
            <select
              className="form-select form-select-sm dealer-filter-input rounded"
              value={catId}
              onChange={(e) => setCatId(e.target.value)}
              disabled={optionsLoading}
            >
              <option value={ALL}>All</option>
              {(categoriesInMain || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 col-sm-6 col-md-4 col-lg-2">
            <label className="form-label small mb-1">Vendor</label>
            <select
              className="form-select form-select-sm dealer-filter-input rounded"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              disabled={optionsLoading}
            >
              <option value={ALL}>All</option>
              {(filterOptions.vendors || []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-2">
            <label className="form-label small mb-1 d-block">&nbsp;</label>
            <button
              type="button"
              className="btn btn-sm dealer-filter-clear rounded"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
            >
              Clear
            </button>
          </div>
        </div>
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
          {addToPOError && (
            <div className="alert alert-danger py-2 small mb-3" role="alert">
              {addToPOError}
            </div>
          )}
          <div className="dealer-products-table-wrap table-responsive mb-4">
            <table className="table table-bordered dealer-products-table mb-0">
              <thead>
                <tr>
                  <th className="dealer-col-product">Product</th>
                  <th className="dealer-col-part">Part #</th>
                  <th className="dealer-col-name">Name</th>
                  <th className="dealer-col-platform">Platform</th>
                  {(() => {
                    const usedColorIds = new Set();
                    products.forEach((p) =>
                      parseProductColorIds(p.Color).forEach((id) =>
                        usedColorIds.add(String(id))
                      )
                    );
                    const visibleColors = colorList.filter((c) =>
                      usedColorIds.has(String(c.ColorID))
                    );
                    return visibleColors.map((c) => (
                      <th
                        key={c.ColorID}
                        className={`dealer-col-qty ${getColorColumnClass(
                          c.ColorName
                        )}`}
                      >
                        {c.ColorName}
                      </th>
                    ));
                  })()}
                  <th className="dealer-col-addon">Grease</th>
                  <th className="dealer-col-addon">Angle Finder</th>
                  <th className="dealer-col-addon">Hardware</th>
                  <th className="dealer-col-action text-end">Add to PO</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const usedColorIds = new Set();
                  products.forEach((p) =>
                    parseProductColorIds(p.Color).forEach((id) =>
                      usedColorIds.add(String(id))
                    )
                  );
                  const visibleColors = colorList.filter((c) =>
                    usedColorIds.has(String(c.ColorID))
                  );
                  return products.map((p) => {
                    const imgSrc = getProductImageUrl(p);
                    const productColorIds = parseProductColorIds(p.Color);
                    const qtys = rowQtys[p.ProductID] || {};
                    const qtyNum = (cid) =>
                      Math.max(0, parseInt(qtys[cid], 10) || 0);
                    const hasAnyQty = visibleColors.some(
                      (c) =>
                        productColorIds.includes(String(c.ColorID)) &&
                        qtyNum(c.ColorID) > 0
                    );
                    const isSending = addRowSending === p.ProductID;
                    return (
                      <tr key={p.ProductID}>
                        <td className="dealer-col-product align-middle">
                          <Link
                            href={`/product/${p.ProductID}`}
                            className="d-flex align-items-center gap-2 text-decoration-none text-dark"
                          >
                            <span
                              className="dealer-list-img flex-shrink-0"
                              style={{
                                width: 48,
                                height: 48,
                                backgroundColor: "var(--bg-11, #f0f0f0)",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                              }}
                            >
                              {imgSrc ? (
                                <Image
                                  src={imgSrc}
                                  alt=""
                                  width={48}
                                  height={48}
                                  style={{ objectFit: "contain" }}
                                  unoptimized
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <span className="small text-muted">—</span>
                              )}
                            </span>
                            <span className="small fw-semibold text-truncate">
                              {formatPrice(p.dealerPrice)}
                            </span>
                          </Link>
                        </td>
                        <td className="dealer-col-part align-middle small">
                          {p.PartNumber}
                        </td>
                        <td className="dealer-col-name align-middle">
                          <Link
                            href={`/product/${p.ProductID}`}
                            className="text-decoration-none text-dark"
                          >
                            {p.ProductName}
                          </Link>
                        </td>
                        <td className="dealer-col-platform align-middle small">
                          {getPlatformLabel(filterOptions.platforms, p.BodyID)}
                        </td>
                        {visibleColors.map((c) => {
                          const isAvailable = productColorIds.includes(
                            String(c.ColorID)
                          );
                          if (!isAvailable) {
                            return (
                              <td
                                key={c.ColorID}
                                className={`align-middle text-muted ${getColorColumnClass(
                                  c.ColorName
                                )}`}
                              >
                                —
                              </td>
                            );
                          }
                          const val = qtys[c.ColorID];
                          const displayVal =
                            val === undefined || val === null || val === ""
                              ? ""
                              : String(val);
                          return (
                            <td
                              key={c.ColorID}
                              className={`align-middle ${getColorColumnClass(
                                c.ColorName
                              )}`}
                            >
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="form-control form-control-sm dealer-qty-input"
                                value={displayVal}
                                placeholder="Qty"
                                onChange={(e) =>
                                  setRowQty(
                                    p.ProductID,
                                    c.ColorID,
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                          );
                        })}
                        <td className="dealer-col-addon align-middle">
                          <select
                            className="form-select form-select-sm dealer-addon-select"
                            value={
                              (rowAddOns[p.ProductID] || {}).greaseId ?? ""
                            }
                            onChange={(e) =>
                              setRowAddOn(
                                p.ProductID,
                                "greaseId",
                                e.target.value
                              )
                            }
                            disabled={!parseProductAddonIds(p.Grease).length}
                          >
                            <option value="">—</option>
                            {greaseList
                              .filter((g) =>
                                parseProductAddonIds(p.Grease).includes(
                                  String(g.GreaseID)
                                )
                              )
                              .map((g) => (
                                <option key={g.GreaseID} value={g.GreaseID}>
                                  {g.GreaseName}
                                  {g.GreasePrice && g.GreasePrice !== "0"
                                    ? ` (+$${g.GreasePrice})`
                                    : ""}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td className="dealer-col-addon align-middle">
                          <select
                            className="form-select form-select-sm dealer-addon-select"
                            value={
                              (rowAddOns[p.ProductID] || {}).anglefinderId ?? ""
                            }
                            onChange={(e) =>
                              setRowAddOn(
                                p.ProductID,
                                "anglefinderId",
                                e.target.value
                              )
                            }
                            disabled={
                              !parseProductAddonIds(p.AngleFinder).length
                            }
                          >
                            <option value="">—</option>
                            {anglefinderList
                              .filter((a) =>
                                parseProductAddonIds(p.AngleFinder).includes(
                                  String(a.AngleID)
                                )
                              )
                              .map((a) => (
                                <option key={a.AngleID} value={a.AngleID}>
                                  {a.AngleName}
                                  {a.AnglePrice && a.AnglePrice !== "0"
                                    ? ` (+$${a.AnglePrice})`
                                    : ""}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td className="dealer-col-addon align-middle">
                          <select
                            className="form-select form-select-sm dealer-addon-select"
                            value={
                              (rowAddOns[p.ProductID] || {}).hardwareId ?? ""
                            }
                            onChange={(e) =>
                              setRowAddOn(
                                p.ProductID,
                                "hardwareId",
                                e.target.value
                              )
                            }
                            disabled={!parseProductAddonIds(p.Hardware).length}
                          >
                            <option value="">—</option>
                            {hardwareList
                              .filter((h) =>
                                parseProductAddonIds(p.Hardware).includes(
                                  String(h.HardwareID)
                                )
                              )
                              .map((h) => (
                                <option key={h.HardwareID} value={h.HardwareID}>
                                  {h.HardwareName}
                                  {h.HardwarePrice && h.HardwarePrice !== "0"
                                    ? ` (+$${h.HardwarePrice})`
                                    : ""}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td className="dealer-col-action align-middle text-end">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            disabled={!hasAnyQty || isSending}
                            onClick={() => addRowToPO(p)}
                          >
                            {isSending ? "Adding…" : "Add to PO"}
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
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

      {addToPOModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="addToPOModalTitle"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title" id="addToPOModalTitle">
                  Add to Purchase Order
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeAddToPOModal}
                />
              </div>
              <div className="modal-body">
                <p className="small mb-2">
                  {addToPOModal.ProductName} ({addToPOModal.PartNumber})
                </p>
                {addToPOError && (
                  <div className="alert alert-danger py-2 small mb-2">
                    {addToPOError}
                  </div>
                )}
                <div className="mb-2">
                  <label className="form-label small">Quantity</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    min={1}
                    value={addToPOQty}
                    onChange={(e) =>
                      setAddToPOQty(
                        Math.max(1, parseInt(e.target.value, 10) || 1)
                      )
                    }
                  />
                </div>
                <div>
                  <label className="form-label small">Color</label>
                  <select
                    className="form-select form-select-sm"
                    value={addToPOColorId}
                    onChange={(e) => setAddToPOColorId(e.target.value)}
                  >
                    <option value="">—</option>
                    {addToPOColors.map((c) => (
                      <option key={c.ColorID} value={c.ColorID}>
                        {c.ColorName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={closeAddToPOModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={submitAddToPO}
                  disabled={addToPOSending}
                >
                  {addToPOSending ? "Adding…" : "Add to PO"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
