import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Topbar1 from "@/components/header/Topbar1";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ProductGrid from "@/components/shop/ProductGrid";
import { getPlatformCategories } from "@/lib/queries";

export const metadata = {
  title: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default async function PlatformCategoryPage({ params }) {
  const { platformName, platformCategory } = params;
  const categories = await getPlatformCategories(platformName);

  // Parse the platform name to extract year range and name
  const parts = platformName.split("-");
  let displayName;

  if (parts.length >= 4) {
    // Format: YYYY-YYYY-platform-name
    const yearRange = `${parts[0]}-${parts[1]}`;
    const name = parts.slice(2).join(" ");
    displayName = `${yearRange} ${
      name.charAt(0).toUpperCase() + name.slice(1)
    }`;
  } else {
    displayName = platformName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return (
    <>
      <Topbar1 />
      <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">{displayName}</div>
          <p className="text-center text-2 text_black-2 mt_5">
            Shop through our latest selection of Suspension & Chassis Parts
          </p>
        </div>
      </div>
      <CategoryGrid categories={categories} platformName={platformName} />
      {/* <ProductGrid platformName={platformName} /> */}
      <Footer1 />
    </>
  );
}
