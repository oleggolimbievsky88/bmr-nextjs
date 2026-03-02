"use client";

import React, { useMemo, useState } from "react";

function normalizeValue(attr) {
  if (!attr) return "";
  if (attr.type === "boolean") {
    const v = String(attr.value ?? "")
      .toLowerCase()
      .trim();
    if (v === "1" || v === "yes" || v === "true") return "Yes";
    if (v === "0" || v === "no" || v === "false") return "No";
    return attr.value;
  }
  return attr.displayValue ?? attr.value;
}

export default function ProductSpecsCard({
  attributes = [],
  title = "Specifications",
  initialCount = 6,
}) {
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(() => {
    return (Array.isArray(attributes) ? attributes : [])
      .map((a) => ({
        slug: String(a?.slug ?? "").trim(),
        label: String(a?.label ?? "").trim(),
        value: String(normalizeValue(a) ?? "").trim(),
      }))
      .filter((x) => x.label && x.value);
  }, [attributes]);

  if (!rows.length) return null;

  const showToggle = rows.length > initialCount;
  const visible = expanded ? rows : rows.slice(0, initialCount);

  return (
    <section className="pdpSpecsCard">
      <header className="pdpSpecsCard__header">
        <h4 className="pdpSpecsCard__title">{title}</h4>

        {showToggle && (
          <button
            type="button"
            className="pdpSpecsCard__toggle"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : `Show all (${rows.length})`}
            <span
              className={`pdpSpecsCard__chev ${expanded ? "isOpen" : ""}`}
            />
          </button>
        )}
      </header>

      <div className="pdpSpecsCard__grid">
        {visible.map((r) => (
          <div className="pdpSpecItem" key={r.slug || r.label}>
            <div className="pdpSpecItem__label">{r.label}</div>
            <div className="pdpSpecItem__value">{r.value}</div>
          </div>
        ))}
      </div>

      {showToggle && !expanded && (
        <div className="pdpSpecsCard__fade" aria-hidden="true" />
      )}
    </section>
  );
}
