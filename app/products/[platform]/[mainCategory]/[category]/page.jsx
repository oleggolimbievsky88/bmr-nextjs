import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Topbar1 from "@/components/header/Topbar1";
import CategoryGrid from "@/components/shop/CategoryGrid";
import { getSubCategories } from "@/lib/queries";

export const metadata = {
  title: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default async function PlatformCategoryPage({ params }) {
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

  console.log("🔍 Platform:", platform);
  console.log("📂 Main Category:", mainCategory);

  // Fetch subcategories under the SubCategory category
    const categories = await getSubCategories(platform, mainCategory);

  if (!categories || categories.length === 0) {
    console.warn(`⚠️ No categories found for ${mainCategory}`);
    return <div>No categories available</div>;
  }

  return (
    <>
      <Topbar1 />
      <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">{formattedVehicleName} - {mainCategory}</div>
          <p className="text-center text-1 text_black-2 mt_5">
            Select a category to shop through our latest selection of Suspension & Chassis Parts
          </p>
        </div>
      </div>
      <CategoryGrid categories={categories} platform={platform} />
      <Footer1 />
    </>
  );
}
