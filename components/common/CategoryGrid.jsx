"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CategoryGrid({ categories, platformName }) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  return (
    <div className="container-fluid mt-4">
      <div className="row g-4 justify-content-center">
        {categories.map((category) => (
          <div key={category.id} className="col-auto">
            <Link
              href={`/platform/${platformName}?category=${category.id}`}
              className={`category-card ${
                activeCategory === category.id ? "active" : ""
              }`}
            >
              <div className="card h-100">
                <div className="card-body text-center">
                  <h5>{category.name}as</h5>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
