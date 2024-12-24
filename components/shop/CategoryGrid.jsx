"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CategoryGrid({ categories, platformName }) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  return (
    <div className="container-fluid">
      <div className="filter-buttons d-flex justify-content-center gap-3 mb-4">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`btn ${activeCategory === String(category.id) ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => {
              // Update URL with selected category
              const url = new URL(window.location);
              url.searchParams.set("category", category.id);
              window.history.pushState({}, "", url);
            }}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
