import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Topbar1 from "@/components/header/Topbar1";
import { getPlatformCategories } from "@/lib/queries";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ProductGrid from "@/components/shop/ProductGrid";

export default async function PlatformPage({ params }) {
  const { platformSlug, platformName } = params;
  const categories = await getPlatformCategories(platformName);

  // Format the platform slug for vehicle display
  const formattedVehicleName = platformSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Format the platform name for category display
  const formattedCategoryName = platformName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <>
      <Topbar1 />
      <Header2 />
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
      <CategoryGrid categories={categories} platformName={platformName} />
      {/* <ProductGrid platformName={platformName} /> */}
      <Footer1 />
    </>
  );
}
