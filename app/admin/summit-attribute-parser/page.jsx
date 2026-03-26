"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { showToast } from "@/utlis/showToast";

const parseSummitAttributes = (input) => {
  if (!input || typeof input !== "string") return [];
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const items = [];
  let pendingLabel = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex !== -1) {
      const label = trimmed.slice(0, colonIndex).trim();
      const value = trimmed.slice(colonIndex + 1).trim();
      if (label) {
        if (value) {
          items.push({ label, value });
          pendingLabel = "";
        } else {
          pendingLabel = label;
        }
        continue;
      }
    }
    if (pendingLabel) {
      items.push({ label: pendingLabel, value: trimmed });
      pendingLabel = "";
    } else if (items.length > 0) {
      items[items.length - 1].value =
        `${items[items.length - 1].value} ${trimmed}`;
    }
  }

  const deduped = new Map();
  for (const item of items) {
    const label = String(item.label || "")
      .trim()
      .replace(/:$/, "");
    const value = String(item.value || "").trim();
    if (!label || !value) continue;
    deduped.set(label.toLowerCase(), { label, value });
  }
  return Array.from(deduped.values());
};

export default function AdminSummitAttributeParserPage() {
  const [attributeCategories, setAttributeCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [summitPasteText, setSummitPasteText] = useState("");
  const [summitPasteError, setSummitPasteError] = useState("");
  const [summitPasteSuccess, setSummitPasteSuccess] = useState("");
  const [summitPasteApplying, setSummitPasteApplying] = useState(false);
  const [summitPromoteTextToSelect, setSummitPromoteTextToSelect] =
    useState(true);
  const [summitParseSummary, setSummitParseSummary] = useState(null);

  const [attributeCategoryId, setAttributeCategoryId] = useState("");
  const [attributeSetName, setAttributeSetName] = useState("");

  const summitParsed = useMemo(
    () => parseSummitAttributes(summitPasteText),
    [summitPasteText],
  );

  const fetchAttributeCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch("/api/admin/attribute-categories");
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.attributeCategories) {
        setAttributeCategories(data.attributeCategories);
      } else {
        setAttributeCategories([]);
      }
    } catch (err) {
      console.error("Error fetching attribute categories:", err);
      setAttributeCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchAttributeCategories();
  }, []);

  const handleApplySummitAttributes = async () => {
    setSummitPasteError("");
    setSummitPasteSuccess("");
    setSummitParseSummary(null);

    if (summitParsed.length === 0) {
      const msg = "No attributes detected in the pasted text.";
      setSummitPasteError(msg);
      showToast(msg, "error");
      return;
    }

    setSummitPasteApplying(true);
    try {
      const res = await fetch("/api/admin/summit-parser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attributeCategoryId: attributeCategoryId || null,
          items: summitParsed,
          promoteTextToSelect: summitPromoteTextToSelect,
          productContext: {
            categoryName: attributeSetName || "",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Paste failed");

      if (data.attributeCategoryCreated) {
        fetchAttributeCategories();
      }
      if (data.attributeCategoryId) {
        setAttributeCategoryId(String(data.attributeCategoryId));
      }
      if (data.summary) {
        setSummitParseSummary(data.summary);
      }

      const createdLabel = data.attributeCategoryName
        ? `Attribute set: ${data.attributeCategoryName}. `
        : "";
      const newAttrs = Array.isArray(data.summary?.newCategories)
        ? data.summary.newCategories.length
        : 0;
      const msg = `${createdLabel}Processed ${summitParsed.length} attributes (${newAttrs} new fields).`;
      setSummitPasteSuccess(msg);
      showToast(msg, "success");
    } catch (err) {
      setSummitPasteError(err.message);
      showToast(err.message, "error");
    } finally {
      setSummitPasteApplying(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Summit Attribute Parser</h1>
          <p className="text-muted mb-0 small">
            Use this page to create an attribute set and all attribute fields
            before creating products.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Link
            href="/admin/attribute-categories"
            className="btn btn-outline-secondary rounded-pill px-3"
          >
            Manage Attribute Categories
          </Link>
          <Link
            href="/admin/products?create=1"
            className="btn btn-dark rounded-pill px-3"
          >
            Create Product
          </Link>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <div className="mb-2 fw-semibold">Target attribute set</div>
              <div className="mb-3">
                <label className="form-label small mb-1">
                  Use an existing attribute set (optional)
                </label>
                <select
                  className="form-select"
                  value={attributeCategoryId}
                  onChange={(e) => setAttributeCategoryId(e.target.value)}
                  disabled={loadingCategories}
                >
                  <option value="">Create / auto-select</option>
                  {attributeCategories.map((ac) => (
                    <option key={ac.id} value={ac.id}>
                      {ac.name}
                    </option>
                  ))}
                </select>
                <div className="form-text">
                  Leave blank to let the parser create (or re-use) an attribute
                  set based on the pasted text.
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small mb-1">
                  Attribute set name override (optional)
                </label>
                <input
                  className="form-control"
                  value={attributeSetName}
                  onChange={(e) => setAttributeSetName(e.target.value)}
                  placeholder="e.g. Front Suspension Packages"
                />
                <div className="form-text">
                  Useful when you want a consistent set name even if Summit uses
                  different labels.
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="rounded-4 border bg-light p-3 h-100">
                <div className="small text-muted mb-1">
                  Recommended workflow
                </div>
                <ol className="mb-0 ps-3 small">
                  <li>Paste Summit attributes</li>
                  <li>Apply to create missing fields</li>
                  <li>Click into the attribute set to review/edit fields</li>
                  <li>Create products using the prepared attribute set</li>
                </ol>
              </div>
            </div>
          </div>

          <hr className="my-4" />

          <div className="admin-form-group">
            <label className="fw-semibold">Paste Summit attributes</label>
            <textarea
              className="form-control font-monospace"
              rows={10}
              value={summitPasteText}
              onChange={(e) => setSummitPasteText(e.target.value)}
              placeholder={`Brand:\nBMR Suspension\nManufacturer's Part Number:\nAA001R`}
            />
            <div className="form-text">
              Supports &quot;Label: Value&quot; or label + next line value
              formats.
            </div>
          </div>

          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2 mt-3">
            <button
              type="button"
              className="btn btn-primary rounded-pill px-4"
              onClick={handleApplySummitAttributes}
              disabled={summitPasteApplying || summitParsed.length === 0}
            >
              {summitPasteApplying ? "Applying..." : "Apply"}
            </button>
            <div className="form-check ms-md-1">
              <input
                className="form-check-input"
                type="checkbox"
                id="summit-promote-select-standalone"
                checked={summitPromoteTextToSelect}
                onChange={(e) => setSummitPromoteTextToSelect(e.target.checked)}
              />
              <label
                className="form-check-label"
                htmlFor="summit-promote-select-standalone"
              >
                Convert text attributes to selects when new values are found
              </label>
            </div>
            {summitParsed.length > 0 && (
              <span className="text-muted small">
                {summitParsed.length} attributes detected
              </span>
            )}
          </div>

          {summitPasteError && (
            <div className="alert alert-danger mt-3 mb-0" role="alert">
              {summitPasteError}
            </div>
          )}
          {summitPasteSuccess && (
            <div className="alert alert-success mt-3 mb-0" role="alert">
              {summitPasteSuccess}
            </div>
          )}

          {summitParseSummary && (
            <div className="mt-3 rounded-4 border bg-light p-3">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                <div className="fw-semibold">Parser Results</div>
                {summitParseSummary.attributeCategoryId && (
                  <Link
                    href={`/admin/attribute-categories/${summitParseSummary.attributeCategoryId}`}
                    className="btn btn-sm btn-dark rounded-pill"
                  >
                    Open Attribute Set
                  </Link>
                )}
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <div className="small text-muted text-uppercase fw-semibold mb-1">
                    Existing Fields Found
                  </div>
                  <ul className="list-unstyled mb-0 small">
                    {(summitParseSummary.existingCategories || []).length >
                    0 ? (
                      summitParseSummary.existingCategories.map((item) => (
                        <li key={item}>{item}</li>
                      ))
                    ) : (
                      <li className="text-muted">None</li>
                    )}
                  </ul>
                </div>
                <div className="col-12 col-md-4">
                  <div className="small text-muted text-uppercase fw-semibold mb-1">
                    New Fields Created
                  </div>
                  <ul className="list-unstyled mb-0 small">
                    {(summitParseSummary.newCategories || []).length > 0 ? (
                      summitParseSummary.newCategories.map((item) => (
                        <li key={item}>{item}</li>
                      ))
                    ) : (
                      <li className="text-muted">None</li>
                    )}
                  </ul>
                </div>
                <div className="col-12 col-md-4">
                  <div className="small text-muted text-uppercase fw-semibold mb-1">
                    Example Values Parsed
                  </div>
                  <ul className="list-unstyled mb-0 small">
                    {(summitParseSummary.valuesAttached || []).length > 0 ? (
                      summitParseSummary.valuesAttached
                        .slice(0, 12)
                        .map((item, idx) => (
                          <li key={`${item.label}-${idx}`}>
                            {item.label}: {item.value}
                          </li>
                        ))
                    ) : (
                      <li className="text-muted">None</li>
                    )}
                  </ul>
                  {(summitParseSummary.valuesAttached || []).length > 12 && (
                    <div className="text-muted small mt-1">
                      +{summitParseSummary.valuesAttached.length - 12} more…
                    </div>
                  )}
                </div>
              </div>

              <div className="small text-muted mt-2">
                Tip: open the attribute set to adjust field types (select /
                multiselect) and options.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
