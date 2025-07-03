"use client";
import { useEffect, useState } from "react";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ProductGrid from "@/components/shop/ProductGrid";
import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";

export default function MainCategoryPage({ params }) {
  console.log("🛠 Params received:", params);

  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch main categories for the platform
        const mainCatRes = await fetch(`/api/platforms/${params.platform}`);
        const mainCatData = await mainCatRes.json();
        setMainCategories(mainCatData.mainCategories || []);

        // Fetch subcategories and products for the selected main category
        const res = await fetch(
          `/api/platforms/${params.platform}/${params.mainCategory}`
        );
        if (!res.ok) throw new Error("Failed to fetch data");
        const { categories, products, platformInfo } = await res.json();
        setCategories(categories);
        setFeaturedProducts(products);
        setPlatformInfo(platformInfo);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.platform, params.mainCategory]);

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-5 text-danger">{error}</div>;
  }

  console.log("platformInfo:", platformInfo);

  return (
    <div className="p-0 m-0">
      <PlatformHeader
        platformData={{
          HeaderImage: platformInfo?.headerImage,
          Name: platformInfo?.name,
          StartYear: platformInfo?.startYear,
          EndYear: platformInfo?.endYear,
          Image: platformInfo?.image,
        }}
      />

      <div className="container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: params.platform, href: `/products/${params.platform}` },
            {
              label: params.mainCategory,
              href: `/products/${params.platform}/${params.mainCategory}`,
            },
          ]}
        />

        {/* Categories Section */}
        <section className="mb-5">
          <CategoryGrid
            mainCategory={params.mainCategory}
            mainCategories={mainCategories}
            categories={categories}
            platform={params.platform}
            isMainCategory={false}
            isSubCategory={true}
          />
        </section>
        <br />
        <br />

        {/* Featured Products Section */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section
            className="mb-5 mt-10"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              border: "1px solid #ddd",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* <div className="text-center mb-4">
              <h2 className="display-6 position-relative d-inline-block header-main-title">
                Featured Products
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
              </h2>
            </div> */}

            <ShopSidebarleft
              categories={categories}
              platform={platformInfo}
              isMainCategory={false}
              products={featuredProducts}
              mainCategories={mainCategories}
              selectedMainCatId={params.mainCategory}
              selectedProductType={featuredProducts.catId}
            />
          </section>
        )}
      </div>
    </div>
  );
}
