"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ProductGrid({ platformName }) {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  useEffect(() => {
    const fetchProductTypes = async () => {
      if (!platformName) return;

      setLoading(true);
      try {
        const url = `/api/product-types?platform=${encodeURIComponent(
          platformName
        )}${category ? `&category=${encodeURIComponent(category)}` : ""}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch product types");
        const data = await response.json();
        setProductTypes(data);
      } catch (error) {
        console.error("Error fetching product types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductTypes();
  }, [platformName, category]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container-fluid mt-4">
      <div className="row g-4 justify-content-center">
        {productTypes.map((type) => (
          <div key={type.id} className="col-md-3">
            <Link
              href={`/platform/${platformName}/${type.slug}`}
              className="text-decoration-none"
            >
              <div className="card product-type-card h-100">
                {type.image && (
                  <img
                    src={type.image}
                    alt={type.name}
                    className="card-img-top"
                  />
                )}
                <div className="card-body text-center">
                  <h5 className="card-title">{type.name}</h5>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
