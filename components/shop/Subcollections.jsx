"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Subcollections() {
  const [mainCategories, setMainCategories] = useState([]);

  useEffect(() => {
    const fetchMainCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch main categories");

        const data = await response.json();
        setMainCategories(data.mainCategories || []);
      } catch (err) {
        console.error("Error fetching main categories:", err);
      }
    };

    fetchMainCategories();
  }, []);

  return (
    <section className="flat-spacing-3 pb_0">
      <div className="container">
        <div className="row g-4 justify-content-center mb-4">
          {mainCategories.map((category) => (
            <div key={category.id} className="col-md-3">
              <Link
                href={`/products/${category.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                className="text-decoration-none"
              >
                <div className="card category-card h-100">
                  {category.image && (
                    <img
                      src={`https://www.bmrsuspension.com/siteart/categories/${category.image}`}
                      alt={category.name}
                      className="card-img-top"
                    />
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{category.name}</h5>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
