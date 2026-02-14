"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProductImageUrl } from "@/lib/assets";

// Derive base part number for grouping (strips size suffixes)
function getBasePartNumber(partNumber) {
  if (!partNumber) return partNumber;
  let base = String(partNumber).trim();
  // BMR-TSHIRT2XL-GBODY -> BMR-TSHIRT-GBODY
  base = base.replace(
    /BMR-TSHIRT(?:2X|3X|XL|2XL|3XL|XXL|L|M|S|SM)(?=-)/gi,
    "BMR-TSHIRT",
  );
  // BMR-TSHIRT-AF-2X -> BMR-TSHIRT-AF
  base = base.replace(
    /(-(?:AF|F6|LC|S550|S650|GBODY))-(?:2X|3X|XL|2XL|3XL|XXL|L|M|S)$/i,
    "$1",
  );
  // BMR-TSHIRT2X, BMR-TSHIRTL -> BMR-TSHIRT
  base = base.replace(/BMR-TSHIRT(?:2X|3X|XL|2XL|3XL|L|M|S)$/i, "BMR-TSHIRT");
  // BMR-HATSM, BMR-HATLXL -> BMR-HAT
  base = base.replace(/BMR-HAT(?:SM|LXL)$/i, "BMR-HAT");
  return base;
}

// Strip size from product name for display
function getDisplayName(productName) {
  if (!productName) return productName;
  return String(productName)
    .replace(
      /\s*[-–]\s*(2XL|3XL|XXL|XL|2X|3X|XLarge|2XLarge|3XLarge|Large|Small|Medium|Small\/Medium|Large\/XL)\s*$/i,
      "",
    )
    .trim();
}

// Derive size label from PartNumber (matches lib/queries.js getMerchandiseSizeVariants logic)
function getSizeLabel(partNumber) {
  if (!partNumber) return "";
  const up = String(partNumber).toUpperCase();
  const labels = {
    S: "S",
    M: "M",
    L: "L",
    XL: "XL",
    "2X": "2XL",
    "3X": "3XL",
    "2XL": "2XL",
    "3XL": "3XL",
  };
  const m = up.match(/-([SM]|L|XL|2X|3X|2XL|3XL)$/);
  if (m) return labels[m[1]] || m[1];
  const m2 = up.match(
    /BMR-TSHIRT(2XL|3XL|2X|3X|XL|L|M|S)-(?:AF|F6|LC|S550|S650|GBODY)/,
  );
  if (m2) return labels[m2[1]] || m2[1];
  if (up.includes("3X")) return "3XL";
  if (up.includes("2X")) return "2XL";
  if (up.includes("SHIRTXL")) return "XL";
  if (up.includes("SHIRTL")) return "L";
  if (up.includes("SHIRTM")) return "M";
  if (up.includes("SHIRTS")) return "S";
  if (up.includes("HATSM")) return "S/M";
  if (up.includes("HATLXL")) return "L/XL";
  return "";
}

export default function BmrMerchandisePage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const groupedProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];
    // Dedupe by PartNumber first — same product can appear under different platforms/CatIDs
    const byPartNumber = new Map();
    for (const p of products) {
      const pn = p.PartNumber || "";
      if (!byPartNumber.has(pn)) byPartNumber.set(pn, p);
    }
    const deduped = Array.from(byPartNumber.values());
    // Then group by base part number (size variants of same design)
    const groups = {};
    for (const p of deduped) {
      const base = getBasePartNumber(p.PartNumber);
      if (!groups[base]) groups[base] = [];
      groups[base].push(p);
    }
    const sizeOrder = ["S", "M", "L", "XL", "2XL", "3XL", "S/M", "L/XL"];
    return Object.values(groups).map((variants) => {
      const first = variants[0];
      const minPrice = Math.min(
        ...variants.map((v) => parseFloat(v.Price) || 0),
      );
      const maxPrice = Math.max(
        ...variants.map((v) => parseFloat(v.Price) || 0),
      );
      const priceStr =
        minPrice === maxPrice
          ? `$${parseFloat(first?.Price || 0).toFixed(2)}`
          : `$${minPrice.toFixed(2)} – $${maxPrice.toFixed(2)}`;
      // variantCount = unique sizes (PartNumbers), not platform dupes
      const uniqueSizes = variants.length;
      // Collect size labels, sorted
      const sizeLabels = variants
        .map((v) => getSizeLabel(v.PartNumber))
        .filter(Boolean);
      const uniqueSizeLabels = [...new Set(sizeLabels)];
      uniqueSizeLabels.sort(
        (a, b) =>
          sizeOrder.indexOf(a) - sizeOrder.indexOf(b) ||
          String(a).localeCompare(String(b)),
      );
      return {
        key: getBasePartNumber(first.PartNumber),
        displayName: getDisplayName(first.ProductName),
        image: first.ImageSmall || first.ImageLarge,
        partNumber: getBasePartNumber(first.PartNumber),
        price: priceStr,
        productId: first.ProductID,
        variantCount: uniqueSizes,
        sizeLabels: uniqueSizeLabels,
      };
    });
  }, [products]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const productsRes = await fetch(
          "/api/products/bmr-merchandise?limit=100",
        );
        const productsData = await productsRes.json();
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        console.error("Error fetching BMR merchandise:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="bmr-merch-page">
      <header className="bmr-merch-hero">
        <div
          className="bmr-merch-hero-bg"
          style={{
            backgroundImage: "url(/images/shop-categories/MerchGradient.jpg)",
          }}
          aria-hidden="true"
        />
        <div className="bmr-merch-hero-overlay" />
        <div className="bmr-merch-hero-inner">
          <span className="bmr-merch-hero-badge">BMR Branded</span>
          <h1 className="bmr-merch-hero-title">Merchandise</h1>
          <p className="bmr-merch-hero-tagline">
            Represent BMR with official gear — tees, hoodies, hats and more
          </p>
        </div>
      </header>

      <section className="bmr-merch-content">
        <div className="bmr-merch-container">
          {isLoading ? (
            <div className="bmr-merch-loading">
              <div className="bmr-merch-spinner" />
              <span>Loading merchandise...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="bmr-merch-empty">
              <div className="bmr-merch-empty-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.93a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.93a2 2 0 0 0-1.34-2.23z" />
                </svg>
              </div>
              <h3 className="bmr-merch-empty-title">Coming Soon</h3>
              <p className="bmr-merch-empty-desc">
                BMR branded merchandise and apparel are on the way. Check back
                soon for tees, hoodies, hats, and more.
              </p>
              <Link href="/products/new" className="bmr-merch-empty-cta">
                Shop New Products
              </Link>
            </div>
          ) : (
            <>
              <div className="bmr-merch-intro">
                <h2 className="bmr-merch-intro-title">Shop BMR Gear</h2>
                <p className="bmr-merch-intro-desc">
                  Show your support with official BMR Suspension apparel and
                  branded merchandise.
                </p>
              </div>

              <div className="bmr-merch-grid">
                {groupedProducts.map((group) => (
                  <Link
                    key={group.key}
                    href={`/product/${group.productId}`}
                    className="bmr-merch-card"
                  >
                    <div className="bmr-merch-card-image-wrap">
                      <Image
                        src={getProductImageUrl(group.image || "noimage.jpg")}
                        alt={group.displayName || "BMR merchandise"}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="bmr-merch-card-image"
                      />
                      <span className="bmr-merch-card-badge">BMR</span>
                      {group.sizeLabels?.length > 0 && (
                        <span className="bmr-merch-card-variants">
                          {group.sizeLabels.join(" • ")}
                        </span>
                      )}
                    </div>
                    <div className="bmr-merch-card-body">
                      <h3 className="bmr-merch-card-title">
                        {group.displayName}
                      </h3>
                      <span className="bmr-merch-card-part">
                        Part #{group.partNumber}
                      </span>
                      {group.sizeLabels?.length > 0 && (
                        <div className="bmr-merch-card-size-tags">
                          {group.sizeLabels.map((label) => (
                            <span
                              key={label}
                              className="bmr-merch-card-size-tag"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="bmr-merch-card-price">
                        {group.price}
                      </span>
                      <span className="bmr-merch-card-cta">View details</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
