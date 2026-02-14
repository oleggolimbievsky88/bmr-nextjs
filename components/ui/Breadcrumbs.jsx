"use client"; // This tells Next.js this is a Client Component

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs({ items, params }) {
  const pathname = usePathname();

  // If items are provided, use them; otherwise fall back to URL parsing
  if (items && items.length > 0) {
    return (
      <div className="tf-breadcrumb">
        <div className="container">
          <div className="tf-breadcrumb-wrap d-flex justify-content-center flex-wrap align-items-center">
            <div className="tf-breadcrumb-list">
              {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                  <span
                    key={index}
                    className="d-inline-flex align-items-center"
                  >
                    {index > 0 && <i className="icon icon-arrow-right mx-2" />}
                    {isLast ? (
                      <span className="text breadcrumb-item active">
                        {item.label}
                      </span>
                    ) : /^\/siteart\//.test(item.href) ||
                      (typeof item.href === "string" &&
                        item.href.startsWith("http")) ? (
                      <a
                        href={item.href}
                        className="text breadcrumb-item"
                        {...(typeof item.href === "string" &&
                        item.href.startsWith("http")
                          ? {
                              target: "_blank",
                              rel: "noopener noreferrer",
                            }
                          : {})}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link href={item.href} className="text breadcrumb-item">
                        {item.label}
                      </Link>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to URL parsing (original logic)
  const parts = pathname
    .split("/")
    .filter(Boolean)
    .filter((part) => part !== "products");

  return (
    <div className="tf-breadcrumb">
      <div className="container">
        <div className="tf-breadcrumb-wrap d-flex justify-content-center flex-wrap align-items-center">
          <div className="tf-breadcrumb-list">
            <Link href="/" className="text breadcrumb-item">
              Home
            </Link>
            {parts.map((part, index) => {
              const url = `/products/${parts.slice(0, index + 1).join("/")}`;
              const isLast = index === parts.length - 1;
              return (
                <span key={url} className="d-inline-flex align-items-center">
                  <i className="icon icon-arrow-right mx-2" />
                  {isLast ? (
                    <span className="text breadcrumb-item active">
                      {(() => {
                        const decoded = decodeURIComponent(part);
                        const yearRangeMatch =
                          decoded.match(/^(\d{4})-(\d{4})(.*)/);
                        if (yearRangeMatch) {
                          // Keep dash between years, replace dashes in the rest
                          return `${yearRangeMatch[1]}-${
                            yearRangeMatch[2]
                          }${yearRangeMatch[3].replace(/-/g, " ")}`;
                        }
                        return decoded.replace(/-/g, " ");
                      })()}
                    </span>
                  ) : (
                    <Link href={url} className="text breadcrumb-item">
                      {(() => {
                        const decoded = decodeURIComponent(part);
                        const yearRangeMatch =
                          decoded.match(/^(\d{4})-(\d{4})(.*)/);
                        if (yearRangeMatch) {
                          return `${yearRangeMatch[1]}-${
                            yearRangeMatch[2]
                          }${yearRangeMatch[3].replace(/-/g, " ")}`;
                        }
                        return decoded.replace(/-/g, " ");
                      })()}
                    </Link>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
