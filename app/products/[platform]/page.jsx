"use client";
import { useEffect, useState } from "react";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ProductGrid from "@/components/shop/ProductGrid";
import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";
import ShopFilter from "@/components/shop/ShopFilter";
import { categories } from "@/data/blogs";

export default function PlatformPage({ params }) {
  const { platform } = params;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/platforms/${platform}`);
        if (!response.ok) {
          throw new Error("Failed to fetch platform data");
        }
        const result = await response.json();
        console.log("Fetched Data:", result); // Debug log
        setData(result);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [platform]);

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (error || !data) {
    return (
      <div className="text-center py-5 text-danger">
        Error loading platform data
      </div>
    );
  }

  const { mainCategories, platformInfo, featuredProducts } = data;

  return (
    <div className="p-0 m-0">
      <PlatformHeader
        platformData={{
          HeaderImage: platformInfo?.headerImage,
          Name: platformInfo?.name,
          StartYear: platformInfo?.startYear,
          EndYear: platformInfo?.endYear,
          Image: platformInfo?.platformImage,
        }}
      />

      <div className="container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: platformInfo?.name || platform, href: "#" },
          ]}
        />

        {/* Categories Section */}
        <section className="mb-5">
          <CategoryGrid
            categories={mainCategories}
            platform={platform}
            isMainCategory={true}
          />
        </section>

        {/* Featured Products Section */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section
            className="mb-5 mt-10"
            style={{
              backgroundColor: "#f8f9fa",
              padding: "30px",
              marginTop: "60px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* <div className="text-center mb-4">
                <div
                  className="position-absolute start-0 end-0 bottom-0"
                  style={{
                    height: "4px",
                    backgroundColor: "var(--bmr-red)",
                    width: "80%",
                    margin: "0 auto",
                    marginTop: "10px",
                  }}
                ></div>
            </div> */}
            <br />
            <br />
            <br />
            {/* <ProductGrid products={featuredProducts} /> */}
            <ShopSidebarleft
              platform={platformInfo}
              isMainCategory={true}
              products={featuredProducts}
              setProducts={featuredProducts}
              categories={categories}
              mainCategories={mainCategories}
              selectedMainCatId={null}
              selectedCatId={null}
            />
          </section>
        )}
      </div>
    </div>
  );
}
