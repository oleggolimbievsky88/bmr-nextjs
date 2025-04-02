"use client";

import { useEffect, useState } from "react";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ProductGrid from "@/components/shop/ProductGrid";
import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function PlatformCategoryPage({ params }) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [error, setError] = useState(null);

  const platformSlug = Array.isArray(params.platform)
    ? params.platform[0]
    : params.platform;

  const mainCategory = params.mainCategory;

  // Format the main category name for display
  const formattedCategoryName = mainCategory
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/maincategories/mainCategory?platform=${platformSlug}&mainCategory=${formattedCategoryName}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setCategories(data.categories);
        setProducts(data.products);
        setPlatformInfo(data.platformInfo);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [platformSlug, formattedCategoryName]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <>
      <PlatformHeader
        platformData={{
          HeaderImage: platformInfo?.headerImage,
          Name: platformInfo?.name,
          StartYear: platformInfo?.startYear,
          EndYear: platformInfo?.endYear,
          Image: platformInfo?.image,
        }}
        subtitle={`${formattedCategoryName} Parts & Accessories`}
      />

      <Breadcrumbs params={params} className="mt-0 pt-0 breadcrumbs-custom" />

      <div className="container">
        {/* Categories Section */}
        <section className="mb-5">
          <CategoryGrid
            categories={categories}
            platform={platformSlug}
            isSubCategory={true}
          />
        </section>
        <br />
        <br />
        <br />
        <br />
        {/* Featured Products Section */}
        {products && products.length > 0 && (
          <section
            className="mb-5"
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="text-center mb-4">
              <h2 className="display-6 fw-bold position-relative d-inline-block">
                Featured Products
                <div
                  className="position-absolute start-0 end-0 bottom-0"
                  style={{
                    height: "4px",
                    background: "#FF0000",
                    width: "40%",
                    margin: "0 auto",
                    marginTop: "10px",
                  }}
                ></div>
              </h2>
            </div>
            <ProductGrid products={products} showCategories={false} />
          </section>
        )}
      </div>
    </>
  );
}
