"use client";
import { use, useEffect, useState } from "react";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ProductGrid from "@/components/shop/ProductGrid";
import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";
import ShopLoadmoreOnScroll from "@/components/shop/ShopLoadmoreOnScroll";

export default function CategoryPage({ params }) {
  const { platform, mainCategory, category } = use(params);
  console.log(
    "DEBUG: URL params - category:",
    category,
    "type:",
    typeof category
  );
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFeaturedProducts([]); // Clear immediately when category changes
    setLoading(true);
    /*
      This useEffect runs whenever the platform, mainCategory, or category changes.
      It defines and calls an async function, fetchData, which does the following:

      1. Fetches platform information and its main categories from `/api/platforms/${platform}`.
         - If the fetch fails, it throws an error.
         - On success, it updates the state with platform info and main categories.

      2. Fetches subcategories for the selected main category from `/api/platforms/${platform}/${mainCategory}`.
         - If the fetch fails, it throws an error.
         - On success, it updates the state with the list of subcategories.

      3. Fetches products for the current platform, mainCategory, and category from `/api/products` with query parameters.
         - The query includes platform, mainCategory, catid, page=1, and limit=12.
         - If the fetch fails, it throws an error.
         - On success, it updates the state with the list of products.

      4. If any error occurs during these fetches, it sets the error state.
      5. Finally, it sets loading to false, regardless of success or error.
    */

    const fetchData = async () => {
      try {
        // 1. Fetch platform info and main categories
        const platformRes = await fetch(`/api/platforms/${platform}`);
        if (!platformRes.ok) throw new Error("Failed to fetch platform info");
        const platformData = await platformRes.json();
        setPlatformInfo(platformData.platformInfo || {});
        setMainCategories(platformData.mainCategories || []);

        // 2. Fetch subcategories for the selected main category
        const subcatRes = await fetch(
          `/api/platforms/${platform}/${mainCategory}`
        );
        if (!subcatRes.ok) throw new Error("Failed to fetch subcategories");
        const subcatData = await subcatRes.json();
        setCategories(subcatData.categories || []);

        // 3. Fetch products for this platform/mainCategory/category
        const query = new URLSearchParams({
          platform,
          mainCategory,
          catid: category, // use category param as catid for now
          page: 1,
          limit: 12,
        }).toString();

        const prodRes = await fetch(`/api/products?${query}`);
        if (!prodRes.ok) throw new Error("Failed to fetch products");
        const products = await prodRes.json();
        console.log("API Response:", products);
        console.log("Products array:", products.products);
        setFeaturedProducts(products.products || []);
        console.log("Setting featuredProducts to:", products.products || []);
        console.log(
          "Current featuredProducts:",
          featuredProducts.map((p) => ({ id: p.ProductID, catid: p.CatID }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }

      console.log(
        "Current featuredProducts:",
        featuredProducts.map((p) => ({ id: p.ProductID, catid: p.CatID }))
      );
    };
    fetchData();
  }, [platform, mainCategory, category]);

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-5 text-danger">{error}</div>;
  }

  return (
    <div className="p-0 m-0">
      <PlatformHeader
        platformData={{
          HeaderImage: platformInfo?.headerImage,
          Name: platformInfo?.name,
          StartYear: platformInfo?.startYear,
          EndYear: platformInfo?.endYear,
          Image: platformInfo?.image,
          slug: platformInfo?.slug,
        }}
      />

      <div className="container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: platform, href: `/products/${platform}` },
            {
              label: mainCategory,
              href: `/products/${platform}/${mainCategory}`,
            },
            {
              label: category,
              href: `/products/${platform}/${mainCategory}/${category}`,
            },
          ]}
        />

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
            <ShopSidebarleft
              categories={categories}
              platform={platformInfo}
              isMainCategory={false}
              products={featuredProducts}
              mainCategories={mainCategories}
              selectedMainCatId={mainCategory}
              selectedProductType={featuredProducts.catId}
              selectedMainCatSlug={mainCategory}
              selectedCatSlug={category}
              selectedCatId={Number(category)} // Convert string to number
            />
            console.log("DEBUG: Passing selectedCatId to ShopSidebarleft:",
            category);
          </section>
        )}

        {/* Infinite Scroll Product List */}
        {/* <ShopLoadmoreOnScroll
          platformSlug={platform}
          mainCategorySlug={mainCategory}
          categorySlug={category}
        /> */}
      </div>
    </div>
  );
}
