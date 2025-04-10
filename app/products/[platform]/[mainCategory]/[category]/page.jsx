import {
  getProducts,
  getCategories,
  getBrands,
  getPlatforms,
} from "@/lib/queries";
import dynamic from "next/dynamic";

// Import the client component
const ShopContent = dynamic(() => import("@/components/shop/ShopContent"), {
  ssr: true,
});

export default async function CategoryPage({ params }) {
  console.log("Category Page Params:", params);

  try {
    // Fetch data from database with the additional category filter
    const products = await getProducts(
      params.platform,
      params.mainCategory,
      params.category
    );

    console.log("Products found:", products?.length || 0);

    if (!products || products.length === 0) {
      console.log("No products found for:", {
        platform: params.platform,
        mainCategory: params.mainCategory,
        category: params.category,
      });
    }

    const categories = await getCategories(params.platform);
    const brands = await getBrands();
    const platforms = await getPlatforms();

    console.log("Categories:", categories);
    console.log("Brands:", brands);
    console.log("Platforms:", platforms);
    console.log("Products:", products);

    return (
      <>
        <section className="flat-spacing-1">
          <div className="container">
            <ShopContent
              initialProducts={products}
              categories={categories}
              brands={brands}
              platforms={platforms}
            />
          </div>
        </section>
        <div className="btn-sidebar-style2">
          <button
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebarmobile"
            aria-controls="offcanvas"
          >
            <i className="icon icon-sidebar-2" />
          </button>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error in CategoryPage:", error);
    return (
      <div className="container py-8">
        <div className="alert alert-danger">
          Error loading products. Please try again later.
        </div>
      </div>
    );
  }
}
