"use client"; // This tells Next.js this is a Client Component

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs({ params }) {
  const pathname = usePathname();
  const parts = pathname
    .split("/")
    .filter(Boolean)
    .filter((part) => part !== "products");

  return (
    <div className="tf-breadcrumb">
      <div className="container">
        <div className="tf-breadcrumb-wrap d-flex justify-content-between flex-wrap align-items-center">
          <div className="tf-breadcrumb-list">
            <Link href="/" className="text breadcrumb-item">
              Home
            </Link>
            {parts.map((part, index) => {
              const url = `/${parts.slice(0, index + 1).join("/")}`;
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
