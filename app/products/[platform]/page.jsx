"use client";

import { useEffect, useState, use, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";

export default function PlatformPage({ params }) {
  const { platform } = use(params);
  const searchParams = useSearchParams();
  const year = useMemo(() => searchParams.get("year") || null, [searchParams]);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [initialProducts, setInitialProducts] = useState([]);
  const [defaultMainCategory, setDefaultMainCategory] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const platformRes = await fetch(
          `/api/platform-by-slug?platform=${encodeURIComponent(platform)}`,
        );
        const platformData = await platformRes.json();

        if (!platformRes.ok) {
          setPlatformInfo(null);
          setMainCategories([]);
          setDefaultMainCategory(null);
          setError(
            platformData?.message ||
              platformData?.error ||
              "Platform not found",
          );
          return;
        }

        const mainCats = platformData.mainCategories || [];
        setPlatformInfo(platformData.platformInfo ?? null);
        setMainCategories(mainCats);

        // When landing from vehicle search (no main category in URL), default to first main category
        // so products load immediately instead of showing "No items found" until user clicks a category.
        const firstMain = mainCats.length > 0 ? mainCats[0] : null;
        setDefaultMainCategory(firstMain);

        const productsUrl = new URLSearchParams({
          page: "1",
          limit: "8",
          platform: platform,
        });
        if (year) productsUrl.set("year", year);
        if (firstMain?.slug) productsUrl.set("mainCategory", firstMain.slug);
        const productsRes = await fetch(
          `/api/products?${productsUrl.toString()}`,
          { cache: "no-store" },
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
  }, [platform, year]);

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-5 text-danger">{error}</div>;
  }

  if (!platformInfo) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">Platform not found.</p>
        <a href="/products" className="btn btn-primary">
          Browse all platforms
        </a>
      </div>
    );
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
            selectedMainCatId={defaultMainCategory?.id ?? null}
            selectedMainCatSlug={defaultMainCategory?.slug ?? null}
            applicationYear={year}
          />
        </section>
      </div>
    </div>
  );
}
