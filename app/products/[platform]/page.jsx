"use client";

import { useEffect, useState, use } from "react";
import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";

export default function PlatformPage({ params }) {
  const { platform } = use(params);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [initialProducts, setInitialProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch platform info and main categories
        const platformRes = await fetch(
          `/api/platform-by-slug?platform=${platform}`
        );
        const platformData = await platformRes.json();

        setPlatformInfo(platformData.platformInfo || {});
        setMainCategories(platformData.mainCategories || []);
        console.log("mainCategories", platformData.mainCategories || []);

        // Fetch initial products for this platform
        const productsRes = await fetch(
          `/api/products?page=1&limit=8&platform=${platform}`,
          { cache: "no-store" }
        );
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setInitialProducts(productsData.products || []);
        }
      } catch (err) {
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
            {
              label: platformInfo
                ? `${platformInfo.startYear}-${platformInfo.endYear} ${platformInfo.name}`
                : platform,
              href: `/products/${platform}`,
            },
          ]}
        />

        {/* Categories Section */}
        <section className="mb-3">
          <CategoryGrid
            categories={mainCategories}
            platform={platform}
            isMainCategory={true}
          />
        </section>

        {/* Sidebar and Products */}
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
            platform={platformInfo}
            products={initialProducts}
            isMainCategory={true}
            mainCategories={mainCategories}
            categories={mainCategories}
            selectedMainCatId={null}
            selectedMainCatSlug={null}
          />
        </section>
      </div>
    </div>
  );
}
