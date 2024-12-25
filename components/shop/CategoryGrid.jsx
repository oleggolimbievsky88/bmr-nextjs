"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CategoryGrid({ platformSlug }) {
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!platformSlug) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/categories?platform=${encodeURIComponent(platformSlug)}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        console.log("Received data:", data);

        if (data.error) {
          throw new Error(data.error);
        }

        setCategories(data.categories || []);
        setMainCategories(data.mainCategories || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [platformSlug]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container-fluid">
      {/* Main Categories */}
      <div className="filter-buttons d-flex justify-content-center gap-3 mb-4">
        {mainCategories.map((category) => (
          <button
            key={category.id}
            className={`btn btn-lg ${
              selectedMainCategory === category.id
                ? "btn-primary active"
                : "btn-outline-primary"
            } shadow-sm rounded-pill px-4 py-2`}
            onClick={() =>
              setSelectedMainCategory(
                selectedMainCategory === category.id ? null : category.id
              )
            }
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Categories (Product Types) */}
      <div className="row g-4 justify-content-center mt-4">
        {categories.map((category) => (
          <div key={category.id} className="col-md-3">
            <Link
              href={`/platform/${platformSlug}/${category.name
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              className="text-decoration-none"
            >
              <div className="card category-card h-100">
                {category.image && (
                  <img
                    src={category.image}
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
  );
}
