"use client";

import React, { useState, useEffect } from "react";
import { showToast } from "@/utlis/showToast";

function filterColorsByProduct(allColors, productColorField) {
  if (!productColorField || productColorField === "0") return [];
  const availableColorIds = productColorField
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id !== "0");
  return allColors.filter((color) =>
    availableColorIds.includes(color.ColorID?.toString()),
  );
}

export default function CartEditModal({
  show,
  onClose,
  item,
  cartIndex,
  onSave,
}) {
  const [product, setProduct] = useState(null);
  const [colorOptions, setColorOptions] = useState([]);
  const [greaseOptions, setGreaseOptions] = useState([]);
  const [anglefinderOptions, setAnglefinderOptions] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedGrease, setSelectedGrease] = useState(null);
  const [selectedAnglefinder, setSelectedAnglefinder] = useState(null);
  const [selectedHardwarePacks, setSelectedHardwarePacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!show || !item?.ProductID) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [productRes, colorsRes, greaseRes, anglefinderRes] =
          await Promise.all([
            fetch(`/api/product-by-id?id=${item.ProductID}`),
            fetch("/api/colors"),
            fetch("/api/grease"),
            fetch("/api/anglefinder"),
          ]);

        if (!productRes.ok) throw new Error("Product fetch failed");
        const productData = await productRes.json();
        const prod = productData.product;
        setProduct(prod);

        const colorsData = colorsRes.ok
          ? await colorsRes.json()
          : { success: false };
        const greaseData = greaseRes.ok
          ? await greaseRes.json()
          : { success: false };
        const anglefinderData = anglefinderRes.ok
          ? await anglefinderRes.json()
          : { success: false };

        if (
          colorsData.success &&
          colorsData.colors?.length > 0 &&
          prod?.Color
        ) {
          setColorOptions(filterColorsByProduct(colorsData.colors, prod.Color));
        } else {
          setColorOptions([]);
        }

        if (
          greaseData.success &&
          greaseData.grease?.length > 0 &&
          prod?.Grease &&
          prod.Grease !== "0"
        ) {
          setGreaseOptions(greaseData.grease);
        } else {
          setGreaseOptions([]);
        }

        if (
          anglefinderData.success &&
          anglefinderData.anglefinder?.length > 0 &&
          prod?.AngleFinder &&
          prod.AngleFinder !== "0"
        ) {
          setAnglefinderOptions(anglefinderData.anglefinder);
        } else {
          setAnglefinderOptions([]);
        }

        setSelectedColor(item.selectedColor ?? null);
        setSelectedGrease(item.selectedGrease ?? null);
        setSelectedAnglefinder(item.selectedAnglefinder ?? null);
        setSelectedHardwarePacks(
          Array.isArray(item.selectedHardwarePacks)
            ? [...item.selectedHardwarePacks]
            : [],
        );
      } catch (err) {
        console.error("CartEditModal fetch error:", err);
        showToast("Could not load product options", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [show, item?.ProductID]);

  const handleSave = (e) => {
    e.preventDefault();
    if (cartIndex == null || typeof onSave !== "function") return;

    const hasColorOptions = colorOptions.length > 0;
    const hasGreaseOptions = greaseOptions.length > 0;
    const hasAngleOptions = anglefinderOptions.length > 0;

    if (hasColorOptions && !selectedColor) {
      showToast("Please select a color", "error");
      return;
    }
    if (hasGreaseOptions && selectedGrease === undefined) {
      showToast("Please select a grease option", "error");
      return;
    }
    if (hasAngleOptions && selectedAnglefinder === undefined) {
      showToast("Please select an angle finder option", "error");
      return;
    }

    setSaving(true);
    onSave(cartIndex, {
      selectedColor: selectedColor ?? null,
      selectedGrease: selectedGrease ?? null,
      selectedAnglefinder: selectedAnglefinder ?? null,
      selectedHardware: null,
      selectedHardwarePacks: selectedHardwarePacks,
    });
    showToast("Cart item updated", "success");
    setSaving(false);
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content">
          <div className="modal-header py-2">
            <h5 className="modal-title">Edit Product</h5>
            <button
              type="button"
              className="btn-close btn-close-sm"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body p-3">
            {loading ? (
              <p className="mb-0">Loading options…</p>
            ) : (
              <form onSubmit={handleSave}>
                {item?.ProductName && (
                  <p className="small text-muted mb-2">{item.ProductName}</p>
                )}

                {colorOptions.length > 0 && (
                  <div className="mb-2">
                    <label className="form-label small fw-6 mb-1">Color</label>
                    <div className="d-flex flex-wrap gap-1">
                      {colorOptions.map((color) => (
                        <label
                          key={color.ColorID || color.id}
                          className="small me-2"
                        >
                          <input
                            type="radio"
                            name="cart-edit-color"
                            checked={
                              (selectedColor?.ColorID ?? selectedColor?.id) ===
                              (color.ColorID ?? color.id)
                            }
                            onChange={() => setSelectedColor(color)}
                          />
                          <span className="ms-1">
                            {color.ColorName || color.value}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {greaseOptions.length > 0 && (
                  <div className="mb-2">
                    <label className="form-label small fw-6 mb-1">Grease</label>
                    <div className="d-flex flex-column gap-0">
                      <label className="small">
                        <input
                          type="radio"
                          name="cart-edit-grease"
                          checked={selectedGrease === null}
                          onChange={() => setSelectedGrease(null)}
                        />
                        <span className="ms-1">No Thanks</span>
                      </label>
                      {greaseOptions.map((g) => (
                        <label key={g.GreaseID || g.id} className="small">
                          <input
                            type="radio"
                            name="cart-edit-grease"
                            checked={selectedGrease?.GreaseID === g.GreaseID}
                            onChange={() => setSelectedGrease(g)}
                          />
                          <span className="ms-1">
                            {g.GreaseName || g.value}
                            {(g.GreasePrice || g.price) !== "0" &&
                              ` (+$${g.GreasePrice || g.price})`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {anglefinderOptions.length > 0 && (
                  <div className="mb-2">
                    <label className="form-label small fw-6 mb-1">
                      Angle Finder
                    </label>
                    <div className="d-flex flex-column gap-0">
                      <label className="small">
                        <input
                          type="radio"
                          name="cart-edit-anglefinder"
                          checked={selectedAnglefinder === null}
                          onChange={() => setSelectedAnglefinder(null)}
                        />
                        <span className="ms-1">No Thanks</span>
                      </label>
                      {anglefinderOptions.map((af) => (
                        <label key={af.AngleID} className="small">
                          <input
                            type="radio"
                            name="cart-edit-anglefinder"
                            checked={
                              selectedAnglefinder?.AngleID === af.AngleID
                            }
                            onChange={() => setSelectedAnglefinder(af)}
                          />
                          <span className="ms-1">
                            {af.AngleName}
                            {af.AnglePrice !== "0" && ` (+$${af.AnglePrice})`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {product?.hardwarePackProducts?.length > 0 && (
                  <div className="mb-2">
                    <label className="form-label small fw-6 mb-1">
                      Hardware
                    </label>
                    <div className="d-flex flex-column gap-0">
                      <label className="small">
                        <input
                          type="radio"
                          name="cart-edit-hardware"
                          checked={selectedHardwarePacks.length === 0}
                          onChange={() => setSelectedHardwarePacks([])}
                        />
                        <span className="ms-1">No Thanks</span>
                      </label>
                      {product.hardwarePackProducts.map((pack) => {
                        const isSelected = selectedHardwarePacks.some(
                          (p) => p.ProductID === pack.ProductID,
                        );
                        return (
                          <label key={pack.ProductID} className="small">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedHardwarePacks((prev) =>
                                  isSelected
                                    ? prev.filter(
                                        (p) => p.ProductID !== pack.ProductID,
                                      )
                                    : [...prev, pack],
                                );
                              }}
                            />
                            <span className="ms-1">
                              {pack.ProductName}
                              {pack.Price &&
                                parseFloat(pack.Price) > 0 &&
                                ` (+$${parseFloat(pack.Price).toFixed(2)})`}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="d-flex gap-2 mt-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
