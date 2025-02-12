"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CategoryGrid({ platformSlug }) {
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [platformImage, setPlatformImage] = useState(null);
  const [mainCategoryImage, setMainCategoryImage] = useState(null);

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
        setMainCategoryImage(data.image || []);
        setVehicle(data.vehicle || null);
        setPlatformImage(data.platformImage || null);
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
      {/* setVehicle("2024 Mustang"); */}
      {/* Vehicle Information */}
      {vehicle && (
        <div className="vehicle-info text-center mb-4">
          <h4>{vehicle.name}</h4>
          <p>{vehicle.description}</p>
        </div>
      )}

      {/* Main Categories */}
      <div className="filter-buttons d-flex justify-content-center gap-3 mb-4">
        {mainCategories.map((category) => (
          <div key={category.id}>
            <button
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
            <img
              src={`https://www.bmrsuspension.com/siteart/categories/${mainCatecatgoryImage}`}
              alt={category.name}
            />
          </div>
        ))}
      </div>

      {/* Banner with Platform Image */}
      {platformImage && (
        <div
          className="banner mb-4"
          style={{
            backgroundImage: `url(${platformImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "200px",
          }}
        />
      )}

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
                {1 && (
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
  );
}
