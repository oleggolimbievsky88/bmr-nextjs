import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Topbar1 from "@/components/header/Topbar1";
import CategoryGrid from "@/components/shop/CategoryGrid";
import {
  getSubCategories,
  getPlatformInfo,
  getFeaturedProductsByMainCategory,
} from "@/lib/queries";
import PlatformHeader from "@/components/header/PlatformHeader";
import ProductCard from "@/components/shopCards/ProductCard";

export const metadata = {
  title: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default async function CategoryPage({ params }) {
  console.log("🛠 Params received:", params);

  const { platform, mainCategory } = params;

  // Ensure platform is defined before using it
  if (!platform) {
    console.error("⛔ Error: platform is undefined");
    return <div>Error: Platform not found</div>;
  }

  // Format the platform slug for display
  const formattedVehicleName = platform
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const formattedCategoryName = mainCategory
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  console.log("🔍 Platform:", platform);
  console.log("📂 Main Category:", mainCategory);

  // Fetch platform info (if you want to show header image, etc)
  const platformInfo = await getPlatformInfo(platform);

  // Fetch subcategories under the SubCategory category
  const categories = await getSubCategories(platform, mainCategory);

  const featuredProducts = await getFeaturedProductsByMainCategory(
    platform,
    mainCategory
  );

  if (!categories || categories.length === 0) {
    console.warn(`⚠️ No categories found for ${mainCategory}`);
    return <div>No categories available</div>;
  }

  return (
    <>
      <Topbar1 />
      <Header2 />
      <PlatformHeader
        platformData={{
          name: formattedVehicleName,
          headerImage: platformInfo?.headerImage
            ? `/images/headers/${platformInfo.headerImage}`
            : null,
        }}
        title={`${formattedVehicleName} ${formattedCategoryName} Parts`}
      />

      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">
            {formattedVehicleName} - {formattedCategoryName}
          </div>
          <p className="text-center text-1 text-bmr-red mt_5">
            Select a category to shop through our latest selection of Suspension
            & Chassis Parts
          </p>
        </div>
      </div>
      {categories}
      <CategoryGrid categories={categories} platform={platform} />

      {/* Featured Products Section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="featured-products-section">
          <h2 className="text-center mt-5 mb-4">Featured Products</h2>
          <div className="container">
            <div className="row">
              {featuredProducts.map((product) => (
                <div className="col-md-3 mb-4" key={product.ProductID}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <Footer1 />
    </>
  );
}
