import CategoryGrid from "@/components/shop/CategoryGrid";
import { getPlatformCategories } from "@/lib/queries";

export const metadata = {
  title: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default async function PlatformCategoryPage({ params }) {
  console.log("🛠 Params received:", params);

  const platformSlug = Array.isArray(params.platform) 
    ? params.platform[0] 
    : params.platform;

  const mainCategory = params.mainCategory;
  const categories = await getPlatformCategories(platformSlug);

  // Safely format the platform slug
  const formattedVehicleName = platformSlug 
    ? platformSlug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Unknown Platform";

  // Format the main category name for display
  const formattedCategoryName = mainCategory
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Fetch subcategories under the main category
  if (!categories || categories.length === 0) {
    console.warn(`⚠️ No categories found for ${mainCategory}`);
    return <div>No categories available</div>;
  }

  return (
    <>
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">
            {formattedVehicleName}
            <br />
            <span className="category-name">{formattedCategoryName}</span>
          </div>
          <p className="text-center text-2 text_black-2 mt_5">
            Check out our latest selection of Suspension & Chassis Parts!
          </p>
        </div>
      </div>
      <CategoryGrid 
        categories={categories} 
        platform={platformSlug} 
        isSubCategory={true} 
      />
    </>
  );
}
