import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Topbar1 from "@/components/header/Topbar1";
import { getPlatformCategories } from "@/lib/queries";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ProductGrid from "@/components/shop/ProductGrid";

export default async function PlatformPage({ params }) {
  const { platformSlug, platformName } = params;

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

  const categories = await getPlatformCategories(platformSlug);
  console.log("categories=%o", categories);

  return (
    <>
      <Topbar1 />
      <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">
            <img
              src={`https://bmrsuspension.com/siteart/cars/${categories.image}`}
              alt={categories.name}
              style={{ width: "175px", height: "100px" }}
            />{" "}
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
        categoriesSlug={categories.slug}
        platformSlug={platformSlug}
      />
      {/* <ProductGrid platformName={platformName} /> */}
      <Footer1 />
    </>
  );
}
