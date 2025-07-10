"use client";
import { useEffect, useState } from "react";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ProductGrid from "@/components/shop/ProductGrid";
import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";
import ShopLoadmoreOnScroll from "@/components/shop/ShopLoadmoreOnScroll";

export default function CategoryPage({ params }) {
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch platform info and main categories (for sidebar/header)
        const platformRes = await fetch(`/api/platforms/${params.platform}`);
        if (!platformRes.ok) throw new Error("Failed to fetch platform info");
        const platformData = await platformRes.json();
        setPlatformInfo(platformData.platformInfo || {});
        setMainCategories(platformData.mainCategories || []);

        // Fetch subcategories for the selected main category (for sidebar)
        const subcatRes = await fetch(
          `/api/platforms/${params.platform}/${params.mainCategory}`
        );
        if (!subcatRes.ok) throw new Error("Failed to fetch subcategories");
        const subcatData = await subcatRes.json();
        setCategories(subcatData.categories || []);

        // Fetch products for this platform/mainCategory/category
        const query = new URLSearchParams({
          platform: params.platform,
          mainCategory: params.mainCategory,
          category: params.category,
          page: 1,
          limit: 12,
        }).toString();

        const prodRes = await fetch(`/api/products?${query}`);
        if (!prodRes.ok) throw new Error("Failed to fetch products");
        const products = await prodRes.json();
        setFeaturedProducts(products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.platform, params.mainCategory, params.category]);

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
            { label: params.platform, href: `/products/${params.platform}` },
            {
              label: params.mainCategory,
              href: `/products/${params.platform}/${params.mainCategory}`,
            },
            {
              label: params.category,
              href: `/products/${params.platform}/${params.mainCategory}/${params.category}`,
            },
          ]}
        />

        {/* Featured Products Section */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="mb-5 mt-10">
            <ShopSidebarleft
              categories={categories}
              platform={platformInfo}
              isMainCategory={false}
              products={featuredProducts}
              mainCategories={mainCategories}
              selectedMainCatId={params.mainCategory}
              selectedProductType={featuredProducts.catId}
              selectedMainCatSlug={params.mainCategory}
            />
          </section>
        )}

        {/* Infinite Scroll Product List */}
        <ShopLoadmoreOnScroll
          platformSlug={params.platform}
          mainCategorySlug={params.mainCategory}
          categorySlug={params.category}
        />
      </div>
    </div>
  );
}
