/**
 * Sidebar component for PLP pages (categories + filters).
 */
import React, { useMemo } from "react";
import Link from "next/link";

const DEFAULT_OPEN_ATTR_GROUPS = 2;

export default function Sidebar({
  mainCategories = [],
  categories = [],
  productTypeCategories = null,
  products = [],
  platform = "",
  platformSlug: platformSlugProp = null,
  selectedMainCatSlug = null,
  selectedCatId = null,
  attributeFilterOptions = [],
  selectedAttributeFilters = {},
  onAttributeFilterChange,
}) {
  const platformSlug =
    platformSlugProp != null && platformSlugProp !== ""
      ? platformSlugProp
      : platform?.slug || platform;

  const [showAllAttrFilters, setShowAllAttrFilters] = React.useState(false);

  const hasActiveFilters = useMemo(() => {
    const obj = selectedAttributeFilters || {};
    return Object.keys(obj).some((k) => Array.isArray(obj[k]) && obj[k].length);
  }, [selectedAttributeFilters]);

  const appliedFilterChips = useMemo(() => {
    if (!attributeFilterOptions?.length) return [];
    const selectedSet = selectedAttributeFilters || {};
    const chips = [];
    attributeFilterOptions.forEach((group) => {
      const selectedValues = selectedSet[group.attributeSlug] || [];
      if (!selectedValues.length) return;
      const valuesByValue = new Map(
        (group.values || []).map((item) => [String(item.value), item]),
      );
      selectedValues.forEach((value) => {
        const item = valuesByValue.get(String(value)) || {};
        const label =
          item?.label != null && String(item.label).trim() !== ""
            ? String(item.label)
            : String(value ?? "");
        chips.push({
          key: `${group.attributeSlug}:${value}`,
          groupSlug: group.attributeSlug,
          value,
          label: `${group.attributeLabel}: ${label}`,
        });
      });
    });
    return chips;
  }, [attributeFilterOptions, selectedAttributeFilters]);

  const clearAllFilters = () => {
    if (!onAttributeFilterChange) return;
    const obj = selectedAttributeFilters || {};
    Object.keys(obj).forEach((slug) => {
      (obj[slug] || []).forEach((val) =>
        onAttributeFilterChange(slug, val, false),
      );
    });
  };

  // Product Types list: prefer productTypeCategories when provided
  const productTypes =
    productTypeCategories != null && productTypeCategories.length > 0
      ? productTypeCategories
      : categories;

  const productTypesWithCount = (productTypes || []).filter(
    (c) => (c.productCount ?? 0) > 0,
  );

  return (
    <aside className="tf-shop-sidebar wrap-sidebar-mobile summit-sidebar plpSidebarCard">
      <div className="bm-filterPanel">
        <div className="bm-filterPanel__header">
          <div className="bm-filterPanel__title">Filters</div>
          {hasActiveFilters && (
            <button
              type="button"
              className="bm-linkBtn"
              onClick={clearAllFilters}
              title="Clear all filters"
            >
              Clear all
            </button>
          )}
        </div>

        {hasActiveFilters && appliedFilterChips.length > 0 && (
          <div className="bm-filterChips">
            {appliedFilterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className="bm-chip"
                onClick={() =>
                  onAttributeFilterChange?.(chip.groupSlug, chip.value, false)
                }
              >
                {chip.label} <span aria-hidden>×</span>
              </button>
            ))}
          </div>
        )}

        <div className="bm-filterPanel__section">
          {/* Main Categories */}
          <div className="plpFacet">
            <button
              className="plpFacetHead"
              type="button"
              data-bs-target="#categories"
              data-bs-toggle="collapse"
              aria-expanded="true"
              aria-controls="categories"
            >
              <span className="plpFacetTitle">Categories</span>
              <span className="plpChevron" aria-hidden />
            </button>

            <div id="categories" className="collapse show">
              <ul className="plpList">
                {mainCategories?.length ? (
                  mainCategories.map((cat, index) => {
                    const catSlug =
                      cat.slug || cat.name?.toLowerCase().replace(/\s+/g, "-");
                    const isActive =
                      selectedMainCatSlug && selectedMainCatSlug === catSlug;

                    return (
                      <li key={cat.id || index}>
                        <Link
                          href={`/products/${platformSlug}/${cat.slug}`}
                          className={`plpLinkRow ${isActive ? "is-active" : ""}`}
                        >
                          <span className="plpLinkText">{cat.name}</span>
                          <span className="plpCount bm-countPill">
                            {cat.productCount || 0}
                          </span>
                        </Link>
                      </li>
                    );
                  })
                ) : (
                  <li className="plpEmpty">No categories found</li>
                )}
              </ul>
            </div>
          </div>

          {/* Product Types */}
          {productTypesWithCount.length > 0 && (
            <div className="plpFacet">
              <button
                className="plpFacetHead"
                type="button"
                data-bs-target="#product-types"
                data-bs-toggle="collapse"
                aria-expanded="true"
                aria-controls="product-types"
              >
                <span className="plpFacetTitle">Product Types</span>
                <span className="plpChevron" aria-hidden />
              </button>

              <div id="product-types" className="collapse show">
                <ul className="plpList">
                  {productTypesWithCount.map((c, index) => {
                    const catId = c.id || c.CatID;
                    const catName = c.name || c.CatName || "";
                    const catSlug =
                      c.CatSlug ||
                      c.slug ||
                      c.CatNameSlug ||
                      (catName && catName.toLowerCase().replace(/\s+/g, "-"));
                    const isActive =
                      selectedCatId === catId ||
                      selectedCatId === String(catId);
                    // Product type page URL: /products/{platform}/{mainCategory}/{categorySlug}
                    const productTypeHref =
                      platformSlug && selectedMainCatSlug && catSlug
                        ? `/products/${platformSlug}/${selectedMainCatSlug}/${catSlug}`
                        : null;

                    return (
                      <li key={catId || index}>
                        <Link
                          href={productTypeHref || "#"}
                          className={`plpLinkRow ${isActive ? "is-active" : ""}`}
                        >
                          <span className="plpLinkText">
                            {c.name || c.CatName}
                          </span>
                          <span className="plpCount bm-countPill">
                            {c.productCount || 0}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {/* Attribute filters */}
          {attributeFilterOptions?.length > 0 &&
            onAttributeFilterChange &&
            (() => {
              const selectedSet = selectedAttributeFilters || {};
              const selectedGroupsCount = Object.keys(selectedSet).filter(
                (k) => (selectedSet[k] || []).length > 0,
              ).length;

              return (
                <div className="plpFacetGroup">
                  <div className="plpFacetGroupHead">
                    <h5 className="sidebar-section-title mb-0">Filters</h5>

                    {attributeFilterOptions.length >
                      DEFAULT_OPEN_ATTR_GROUPS && (
                      <button
                        type="button"
                        className="plpMiniBtn"
                        onClick={() => setShowAllAttrFilters((v) => !v)}
                      >
                        {showAllAttrFilters ? "Collapse" : "Show all"}
                        {selectedGroupsCount > 0
                          ? ` (${selectedGroupsCount})`
                          : ""}
                      </button>
                    )}
                  </div>

                  {attributeFilterOptions.map((group, idx) => {
                    const selected = selectedSet[group.attributeSlug] || [];

                    const isOpenByDefault =
                      showAllAttrFilters ||
                      idx < DEFAULT_OPEN_ATTR_GROUPS ||
                      selected.length > 0;

                    return (
                      <div key={group.attributeSlug} className="plpFacet">
                        <button
                          className="plpFacetHead"
                          type="button"
                          data-bs-target={`#attr-${group.attributeSlug}`}
                          data-bs-toggle="collapse"
                          aria-expanded={isOpenByDefault ? "true" : "false"}
                          aria-controls={`attr-${group.attributeSlug}`}
                        >
                          <span className="plpFacetTitle">
                            {group.attributeLabel}
                          </span>

                          {selected.length > 0 && (
                            <span className="plpPillCount bm-countPill">
                              {selected.length}
                            </span>
                          )}

                          <span className="plpChevron" aria-hidden />
                        </button>

                        <div
                          id={`attr-${group.attributeSlug}`}
                          className={`collapse ${isOpenByDefault ? "show" : ""}`}
                        >
                          <ul className="plpFilterList">
                            {(group.values || []).map((item) => {
                              const checked = selected.includes(item.value);
                              const label =
                                item?.label != null &&
                                String(item.label).trim() !== ""
                                  ? String(item.label)
                                  : String(item.value ?? "");

                              return (
                                <li
                                  key={`${group.attributeSlug}-${item.value}`}
                                >
                                  <label
                                    className={`plpCheckRow ${
                                      checked ? "is-checked" : ""
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) =>
                                        onAttributeFilterChange(
                                          group.attributeSlug,
                                          item.value,
                                          e.target.checked,
                                        )
                                      }
                                    />
                                    <span className="plpCheckLabel">
                                      {label}
                                    </span>
                                    <span className="plpCount bm-countPill">
                                      {item.count}
                                    </span>
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

          {/* Shipping & Delivery */}
          <div className="plpFacet">
            <button
              className="plpFacetHead"
              type="button"
              data-bs-target="#shipping"
              data-bs-toggle="collapse"
              aria-expanded="true"
              aria-controls="shipping"
            >
              <span className="plpFacetTitle">Shipping &amp; Delivery</span>
              <span className="plpChevron" aria-hidden />
            </button>

            <div id="shipping" className="collapse show">
              <ul className="plpIconList">
                <li className="plpIconItem">
                  <div className="plpIconBubble" aria-hidden>
                    🚚
                  </div>
                  <div>
                    <div className="plpIconTitle">Free shipping</div>
                    <div className="plpIconDesc">
                      Free shipping for all US orders
                    </div>
                  </div>
                </li>
                <li className="plpIconItem">
                  <div className="plpIconBubble" aria-hidden>
                    🛟
                  </div>
                  <div>
                    <div className="plpIconTitle">Premium Support</div>
                    <div className="plpIconDesc">Support M–F 9am–5pm EST</div>
                  </div>
                </li>
                <li className="plpIconItem">
                  <div className="plpIconBubble" aria-hidden>
                    ↩️
                  </div>
                  <div>
                    <div className="plpIconTitle">90 Days Return</div>
                    <div className="plpIconDesc">
                      15% restocking fee may apply
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
