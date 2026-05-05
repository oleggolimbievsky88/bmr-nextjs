"use client";

import Link from "next/link";
import { getSiteUrl } from "@bmr/core/url";

export default function Breadcrumbs({ items = [] }) {
  if (!items?.length) return null;

  const baseUrl = getSiteUrl();
  const fallbackPath =
    typeof window !== "undefined" ? window.location.pathname : "/";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items
      .filter((it) => it?.label)
      .map((it, idx) => {
        const href = it?.href || fallbackPath;
        const abs = href.startsWith("http")
          ? href
          : new URL(href, baseUrl).toString();

        return {
          "@type": "ListItem",
          position: idx + 1,
          name: it.label,
          item: abs,
        };
      }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="bm-bc">
        <ol className="bm-bc__list">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;

            return (
              <li key={`${item.label}-${idx}`} className="bm-bc__item">
                {isLast ? (
                  <span
                    className="bm-bc__current"
                    aria-current="page"
                    title={item.label}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    className="bm-bc__link"
                    href={item.href ?? "#"}
                    title={item.label}
                  >
                    {item.label}
                  </Link>
                )}
                {!isLast && (
                  <span className="bm-bc__sep" aria-hidden="true">
                    ›
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
