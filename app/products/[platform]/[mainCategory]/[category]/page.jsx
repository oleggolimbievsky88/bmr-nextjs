"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ShopLoadmoreOnScroll from "@/components/shop/ShopLoadmoreOnScroll";
import Header2 from "@/components/header/Header";
import PlatformHeader from "@/components/header/PlatformHeader";
import Footer1 from "@/components/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

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

export default function CategoryPage({ params }) {
  const { platform, mainCategory, category } = use(params);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentMainCategory, setCurrentMainCategory] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFeaturedProducts([]); // Clear immediately when category changes
    setLoading(true);

    async function fetchData() {
      try {
        // 1. Fetch platform info and main categories
        const platformRes = await fetch(
          `/api/platform-by-slug?platform=${platform}`,
        );
        if (!platformRes.ok) {
          const errorData = await platformRes.json();
          throw new Error(
            `Platform '${platform}' not found. Please check the URL or try a different platform.`,
          );
        }
        const platformData = await platformRes.json();
        setPlatformInfo(platformData.platformInfo || {});
        const mainCats = platformData.mainCategories || [];
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

        // 2. Fetch subcategories for the selected main category
        const subcatRes = await fetch(
          `/api/platform-maincategory?platform=${platform}&mainCategory=${mainCategory}`,
        );
        if (!subcatRes.ok) throw new Error("Failed to fetch subcategories");
        const subcatData = await subcatRes.json();
        const allCategories = subcatData.categories || [];

        // 3. Find the current category by slug (sanitize both sides for comparison)
        // Decode URL-encoded characters first (e.g., %22 becomes ")
        const decodedCategory = decodeURIComponent(category);
        const sanitizedCategorySlug = sanitizeSlug(decodedCategory);
        const currentCat = allCategories.find((cat) => {
          const dbSlug = cat.CatSlug ?? cat.slug ?? cat.CatNameSlug ?? "";
          const nameSlug = (cat.CatName ?? cat.name ?? "")
            .toString()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");
          return (
            sanitizeSlug(dbSlug) === sanitizedCategorySlug ||
            sanitizeSlug(nameSlug) === sanitizedCategorySlug ||
            nameSlug === sanitizedCategorySlug
          );
        });
        if (!currentCat)
          throw new Error(
            `Category not found for slug "${decodedCategory}". Check the URL or try the main category.`,
          );
        setCurrentCategory(currentCat);

        // Find parent category for breadcrumbs (e.g. Shocks when viewing Koni)
        const parentCategory = currentCat.ParentID
          ? allCategories.find(
              (c) => Number(c.CatID) === Number(currentCat.ParentID),
            )
          : null;
        setParentCategory(parentCategory);

        // Show only sub-categories of the current category that have products (e.g., Viking Stocks under Shocks)
        const subCategoriesOfCurrent = allCategories.filter(
          (c) =>
            c.ParentID &&
            Number(c.ParentID) === Number(currentCat.CatID) &&
            (c.productCount ?? 0) > 0,
        );
        setCategories(subCategoriesOfCurrent);

        // 4. Fetch products - include descendants when viewing a parent (e.g. Shocks) so we show all products under it
        const includeDescendants = subCategoriesOfCurrent.length > 0;
        const query = new URLSearchParams({
          platform,
          mainCategory,
          category: decodedCategory,
          page: 1,
          limit: 12,
          ...(includeDescendants && { includeDescendants: "true" }),
        }).toString();

        const prodRes = await fetch(`/api/products?${query}`);
        if (!prodRes.ok) throw new Error("Failed to fetch products");
        const products = await prodRes.json();
        // console.log("API Response:", products);
        // console.log("Products array:", products.products);
        setFeaturedProducts(products.products || []);
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
            ...(parentCategory
              ? [
                  {
                    label:
                      parentCategory.CatName || parentCategory.name || "Shocks",
                    href: `/products/${platform}/${mainCategory}/${
                      parentCategory.CatSlug ||
                      parentCategory.slug ||
                      (parentCategory.CatName || "")
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                    }`,
                  },
                ]
              : []),
            {
              label:
                currentCategory?.CatName || currentCategory?.name || category,
              href: `/products/${platform}/${mainCategory}/${category}`,
            },
          ]}
        />

        {/* Sub-categories grid (e.g., Viking Stocks under Shocks) */}
        {categories && categories.length > 0 && (
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
        )}

        {/* No products message - when category has no products and no sub-categories */}
        {(!featuredProducts || featuredProducts.length === 0) &&
          (!categories || categories.length === 0) && (
            <section className="mb-5 py-5">
              <div
                className="text-center py-5 px-3"
                style={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: "10px",
                  border: "1px solid #dee2e6",
                }}
              >
                <p className="text-muted mb-3">
                  No products in this category yet.
                </p>
                <Link
                  href={
                    parentCategory
                      ? `/products/${platform}/${mainCategory}/${
                          parentCategory.CatSlug ||
                          (parentCategory.CatName || "")
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                        }`
                      : `/products/${platform}/${mainCategory}`
                  }
                  className="btn btn-primary"
                >
                  Browse{" "}
                  {parentCategory
                    ? parentCategory.CatName || "parent"
                    : "categories"}
                </Link>
              </div>
            </section>
          )}

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
    </div>
  );
}
