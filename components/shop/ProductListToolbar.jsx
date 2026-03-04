"use client";

import { layouts } from "@/data/shop";

export default function ProductListToolbar({
  total = 0,
  sortValue = "default",
  onSortChange,
  onOpenFilters,
  gridItems,
  onGridChange,
}) {
  const showLayouts = typeof onGridChange === "function" && gridItems != null;

  return (
    <div className="bm-toolbar">
      <div className="bm-toolbar__left">
        <span className="bm-toolbar__count">
          {total.toLocaleString()} items
        </span>
      </div>

      {showLayouts && (
        <div className="bm-toolbar__center d-none d-md-flex">
          <ul className="tf-control-layout bm-toolbar__layouts">
            {layouts.map((layout, index) => (
              <li
                key={index}
                className={`tf-view-layout-switch ${layout.className} ${
                  gridItems === layout.dataValueGrid ? "active" : ""
                }`}
                onClick={() => onGridChange(layout.dataValueGrid)}
              >
                <div className="item">
                  <span className={`icon ${layout.iconClass}`} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bm-toolbar__right">
        <button
          className="bm-btn bm-btn--soft d-lg-none"
          type="button"
          onClick={onOpenFilters}
        >
          Filters
        </button>

        <label className="bm-select">
          <span className="bm-select__label">Sort</span>
          <select
            value={sortValue}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="bm-select__control"
          >
            <option value="default">Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </label>
      </div>
    </div>
  );
}
