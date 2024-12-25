"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductGrid({ platformName }) {
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!platformName) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/categories?platform=${encodeURIComponent(platformName)}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        console.log("Fetched Data:", data); // Debug log

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
  }, [platformName]);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error)
    return <div className="text-center text-danger p-4">Error: {error}</div>;
  if (!categories.length && !mainCategories.length) {
    return (
      <div className="text-center p-4">
        No categories found for {platformName}
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Main Categories */}
      {mainCategories.length > 0 && (
        <div className="filter-buttons d-flex justify-content-center gap-3 mb-4">
          {mainCategories.map((category) => (
            <button
              key={category.id}
              className={`btn ${
                selectedMainCategory === category.id
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
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
      )}

      {/* Categories Grid */}
      <div className="row g-4 justify-content-center mt-4">
        {categories
          .filter(
            (cat) =>
              !selectedMainCategory ||
              cat.mainCategoryId === selectedMainCategory
          )
          .map((category) => (
            <div key={category.id} className="col-md-3">
              <Link
                href={`/platform/${platformName}/${category.name
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
                  <div className="card-body text-center">
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
