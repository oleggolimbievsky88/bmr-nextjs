"use client";

import Link from "next/link";

export default function Breadcrumbs({ items = [] }) {
  if (!items?.length) return null;

  return (
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
  );
}
