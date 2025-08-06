"use client";
import { useEffect, useState, use } from "react";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ProductGrid from "@/components/shop/ProductGrid";
import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";
import ShopLoadmoreOnScroll from "@/components/shop/ShopLoadmoreOnScroll";

export default function MainCategoryPage({ params }) {
  const { platform, mainCategory } = use(params);

  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch main categories for the platform
        const mainCatRes = await fetch(
          `/api/platform-by-slug?platform=${platform}`
        );
        const mainCatData = await mainCatRes.json();
        setMainCategories(mainCatData.mainCategories || []);

        // Fetch subcategories and products for the selected main category
        const res = await fetch(
          `/api/platform-maincategory?platform=${platform}&mainCategory=${mainCategory}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const { categories, products, platformInfo } = await res.json();
        setCategories(categories);
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
          />
        </section>

        {/* Featured Products Section */}
        {products && products.length > 0 && (
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
              <h6 className="position-relative">
                <div
                  className="pt-1 pb-0 mt-1 mb-0 fs-3"
                  style={{
                    borderBottom: "1px solid #ccc",
                    width: "20%",
                    textAlign: "center",
                    margin: "0 auto",
                    color: "#202020",
                  }}
                >
                  <h6 className="position-relative  text-capitalize">
                    {mainCategory}
                  </h6>
                </div>
                <div className="position-absolute start-0 end-0 bottom-0"></div>
              </h6>
            </div> */}

            <ShopSidebarleft
              categories={categories}
              platform={platformInfo}
              isMainCategory={false}
              mainCategories={mainCategories}
              products={products}
              selectedMainCatId={mainCategory}
              selectedProductType={products.catId}
              selectedMainCatSlug={mainCategory}
            />
          </section>
        )}
      </div>
    </div>
  );
}
