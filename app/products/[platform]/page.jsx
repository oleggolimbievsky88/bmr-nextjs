"use client";

import { useEffect, useState, use, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";
import { platformFallbacks } from "@/data/platformFallbacks";

export default function PlatformPage({ params }) {
  const { platform } = use(params);
  const searchParams = useSearchParams();
  const year = useMemo(() => searchParams.get("year") || null, [searchParams]);
  const isUniversalPlatform =
    String(platform || "")
      .trim()
      .toLowerCase() === "universal";
  const [platformInfo, setPlatformInfo] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [initialProducts, setInitialProducts] = useState([]);
  const [defaultMainCategory, setDefaultMainCategory] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("default");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isFallbackPlatform, setIsFallbackPlatform] = useState(false);
  const [fallbackDescription, setFallbackDescription] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsFallbackPlatform(false);
        setFallbackDescription("");
        const platformRes = await fetch(
          `/api/platform-by-slug?platform=${encodeURIComponent(platform)}`,
        );
        const platformData = await platformRes.json();

        if (!platformRes.ok) {
          const fallback = platformFallbacks[platform];
          if (fallback) {
            setPlatformInfo({
              name: fallback.name,
              startYear: fallback.startYear,
              endYear: fallback.endYear,
              slug: fallback.slug,
              headerImage: fallback.headerImage || null,
              image: fallback.image || null,
            });
            setMainCategories([]);
            setDefaultMainCategory(null);
            setInitialProducts([]);
            setIsFallbackPlatform(true);
            setFallbackDescription(fallback.description || "");
            return;
          }
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
          sort,
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
  }, [platform, year, sort]);

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
                ? platformInfo.startYear && platformInfo.endYear
                  ? isUniversalPlatform
                    ? platformInfo.name || platform
                    : `${platformInfo.startYear}-${platformInfo.endYear} ${platformInfo.name}`
                  : platformInfo.name || platform
                : platform,
              href: `/products/${platform}`,
            },
          ]}
        />

        {isFallbackPlatform && (
          <section className="mb-5">
            <div className="text-center py-4">
              <h2 className="mb-3">Platform page coming soon</h2>
              <p className="text-muted mb-4">
                {fallbackDescription ||
                  "We’re still building this platform. Try Search by Vehicle or browse all platforms."}
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <a href="/products" className="btn btn-primary">
                  Browse all platforms
                </a>
                <a href="/contact" className="btn btn-outline-secondary">
                  Contact support
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Categories Section */}
        {!isFallbackPlatform && (
          <section className="mb-3">
            <CategoryGrid
              categories={mainCategories}
              platform={platform}
              isMainCategory={true}
            />
          </section>
        )}

        {/* Sidebar and Products */}
        {!isFallbackPlatform && (
          <section className="mb-5 mt-10">
            <ShopSidebarleft
              platform={platformInfo}
              platformSlug={platform}
              products={initialProducts}
              isMainCategory={true}
              mainCategories={mainCategories}
              categories={mainCategories}
              selectedMainCatId={null}
              selectedMainCatSlug={null}
              applicationYear={year}
              sort={sort}
              onSortChange={setSort}
              filtersOpen={filtersOpen}
              setFiltersOpen={setFiltersOpen}
            />
          </section>
        )}
      </div>
    </div>
  );
}
