"use client";
import { useEffect, useState } from "react";
import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";
import ShopLoadmoreOnScroll from "@/components/shop/ShopLoadmoreOnScroll";

export default function PlatformPage({ params }) {
  const [platformInfo, setPlatformInfo] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch platform info and main categories
        const platformRes = await fetch(`/api/platforms/${params.platform}`);
        if (!platformRes.ok) throw new Error("Failed to fetch platform info");
        const platformData = await platformRes.json();
        setPlatformInfo(platformData.platformInfo || {});
        setMainCategories(platformData.mainCategories || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.platform]);

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
            { label: platformInfo?.name || params.platform, href: "#" },
          ]}
        />

        {/* Categories Section */}
        <section className="mb-3">
          <CategoryGrid
            categories={mainCategories}
            platform={params.platform}
            isMainCategory={true}
          />
        </section>

        {/* Sidebar and Infinite Scroll */}
        <div className="row">
          <div className="col-md-3">
            <ShopSidebarleft
              platform={platformInfo}
              categories={mainCategories}
              isMainCategory={true}
              mainCategories={mainCategories}
            />
          </div>
          <div className="col-md-9">
            {/* <ShopLoadmoreOnScroll platform={params.platform} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
