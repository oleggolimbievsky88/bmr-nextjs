"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CategoryGrid({ categories, platformName }) {
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setActiveCategory(params.get("category"));
  }, []);

  return (
    <div className="container-fluid mt-4">
      <div className="row g-4 justify-content-center">
        {categories.map((category) => (
          <div key={category.id} className="col-auto">
            <Link
              href={`/products/${platformName}?category=${category.id}`}
              className={`category-card ${
                activeCategory === String(category.id) ? "active" : ""
              }`}
            >
              <div className="card h-100">
                <div className="card-body text-center">
                  <h5>{category.name}</h5>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
