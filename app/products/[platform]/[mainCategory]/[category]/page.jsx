"use client";

import { useEffect, useState, use } from "react";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";
import ShopLoadmoreOnScroll from "@/components/shop/ShopLoadmoreOnScroll";
import Header2 from "@/components/header/Header";
import PlatformHeader from "@/components/header/PlatformHeader";
import Footer1 from "@/components/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function CategoryPage({ params }) {
  const { platform, mainCategory, category } = use(params);
  console.log(
    "DEBUG: URL params - category slug:",
    category,
    "type:",
    typeof category
  );
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFeaturedProducts([]); // Clear immediately when category changes
    setLoading(true);

    async function fetchData() {
      try {
        // 1. Fetch platform info and main categories
        const platformRes = await fetch(
          `/api/platform-by-slug?platform=${platform}`
        );
        if (!platformRes.ok) {
          const errorData = await platformRes.json();
          throw new Error(
            `Platform '${platform}' not found. Please check the URL or try a different platform.`
          );
        }
        const platformData = await platformRes.json();
        setPlatformInfo(platformData.platformInfo || {});
        setMainCategories(platformData.mainCategories || []);

        // 2. Fetch subcategories for the selected main category
        const subcatRes = await fetch(
          `/api/platform-maincategory?platform=${platform}&mainCategory=${mainCategory}`
        );
        if (!subcatRes.ok) throw new Error("Failed to fetch subcategories");
        const subcatData = await subcatRes.json();
        setCategories(subcatData.categories || []);

        // 3. Find the current category by slug
        const currentCat = subcatData.categories?.find(
          (cat) => (cat.CatSlug || cat.slug) === category
        );
        if (!currentCat) throw new Error("Category not found");
        setCurrentCategory(currentCat);

        // 4. Fetch products for this category using the resolved category ID
        const query = new URLSearchParams({
          platform,
          mainCategory,
          catid: currentCat.CatID || currentCat.id, // Use the resolved category ID
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
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [platform, mainCategory, category]);

  if (loading) return <div>Loading...</div>;
  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Platform Not Found</h4>
          <p>{error}</p>
          <p>Available platforms:</p>
          <ul>
            <li>
              <a href="/products/1970-1981-f-body">1970-1981 F-Body</a>
            </li>
            <li>
              <a href="/products/1967-1969-f-body">1967-1969 F-Body</a>
            </li>
            <li>
              <a href="/products/1964-1972-a-body">1964-1972 A-Body</a>
            </li>
            <li>
              <a href="/products/1967-1972-chevy-c10">1967-1972 Chevy C10</a>
            </li>
            <li>
              <a href="/products/1968-1974-x-body">1968-1974 X-Body</a>
            </li>
          </ul>
        </div>
      </div>
    );
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
      />

      <div className="container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: platform, href: `/products/${platform}` },
            {
              label: mainCategory,
              href: `/products/${platform}/${mainCategory}`,
            },
            {
              label: currentCategory?.CatName || category,
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
            }}
          >
            {/* <div className="text-center ">
              <h6 className="position-relative">
                <div
                  className="pt-1 pb-0 mt-1 mb-0 fs-3"
                  style={{
                    borderBottom: "1px solid #ccc",
                    width: "30%",
                    textAlign: "center",
                    margin: "0 auto",
                    color: "#202020",
                  }}
                >
                  {currentCategory?.CatName || category}
                </div>
                <div className="position-absolute start-0 end-0 bottom-0"></div>
              </h6>
            </div> */}

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
              selectedCatId={currentCategory?.CatID || currentCategory?.id}
            />
          </section>
        )}
      </div>
      <Footer1 />
    </div>
  );
}
