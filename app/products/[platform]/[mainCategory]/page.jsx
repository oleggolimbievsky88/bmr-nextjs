"use client";
import { useEffect, useState, use } from "react";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ProductGrid from "@/components/shop/ProductGrid";
import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";
import ShopLoadmoreOnScroll from "@/components/shop/ShopLoadmoreOnScroll";

// Sanitize slug by removing/replacing special characters
const sanitizeSlug = (slug) => {
  if (!slug) return "";
  return slug
    .toLowerCase()
    .replace(/["""]/g, "") // Remove double quotes (regular and smart quotes)
    .replace(/[''']/g, "") // Remove single quotes (regular and smart quotes)
    .replace(/[^\w\s-]/g, "") // Remove any other special characters except word chars, spaces, and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};

export default function MainCategoryPage({ params }) {
  const { platform, mainCategory } = use(params);

  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [currentMainCategory, setCurrentMainCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch main categories for the platform
        const mainCatRes = await fetch(
          `/api/platform-by-slug?platform=${encodeURIComponent(platform)}`,
        );
        const mainCatData = await mainCatRes.json();
        const mainCats = mainCatData.mainCategories || [];
        setMainCategories(mainCats);

        // Find the current main category by slug
        // Decode URL-encoded characters first (e.g., %22 becomes ")
        const decodedMainCategory = decodeURIComponent(mainCategory);
        const sanitizedMainCatSlug = sanitizeSlug(decodedMainCategory);
        const mainCat = mainCats.find((mc) => {
          const mcSlug = mc.slug || mc.MainCatSlug || mc.name;
          return sanitizeSlug(mcSlug) === sanitizedMainCatSlug;
        });
        if (mainCat) {
          setCurrentMainCategory(mainCat);
        }

        // Fetch subcategories and products for the selected main category
        const res = await fetch(
          `/api/platform-maincategory?platform=${encodeURIComponent(platform)}&mainCategory=${encodeURIComponent(mainCategory)}`,
        );
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const { categories, products, platformInfo } = await res.json();
        // Only show top-level categories (ParentID 0 or null) - sub-categories appear when you drill into a parent
        const topLevelCategories = (categories || []).filter(
          (c) => !c.ParentID || c.ParentID === 0,
        );
        setCategories(topLevelCategories);
        setProducts(products);
        setPlatformInfo(platformInfo);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [platform, mainCategory]);

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-5 text-danger">{error}</div>;
  }

  return (
    <div className="p-0 m-0 container-fluid">
      <PlatformHeader
        platformData={{
          HeaderImage: platformInfo?.headerImage,
          Name: platformInfo?.name,
          StartYear: platformInfo?.startYear,
          EndYear: platformInfo?.endYear,
          Image: platformInfo?.image,
          slug: platformInfo?.slug,
          mainCategory: mainCategory ? mainCategory : null,
        }}
        mainCategoryName={
          currentMainCategory?.name || currentMainCategory?.MainCatName || null
        }
      />

      <div className="container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            {
              label: platformInfo
                ? `${platformInfo.startYear}-${platformInfo.endYear} ${platformInfo.name}`
                : platform,
              href: `/products/${platform}`,
            },
            {
              label:
                currentMainCategory?.name ||
                currentMainCategory?.MainCatName ||
                mainCategory,
              href: `/products/${platform}/${mainCategory}`,
            },
          ]}
        />

        {/* Categories Section */}
        <section className="mb-5">
          <CategoryGrid
            mainCategory={mainCategory}
            mainCategories={mainCategories}
            categories={categories}
            platform={platform}
            isMainCategory={false}
            isSubCategory={true}
            hideEmpty={false}
          />
        </section>

        {/* Featured Products Section - always show so ShopLoadmoreOnScroll can fetch when initial products are empty */}
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
            mainCategories={mainCategories}
            products={products || []}
            selectedMainCatId={mainCategory}
            selectedProductType={products?.catId}
            selectedMainCatSlug={mainCategory}
          />
        </section>
      </div>
    </div>
  );
}
