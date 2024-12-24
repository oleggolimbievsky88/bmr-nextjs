import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Topbar1 from "@/components/header/Topbar1";
import { getPlatformCategories } from "@/lib/queries";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ProductGrid from "@/components/shop/ProductGrid";

export default async function PlatformPage({ params }) {
  const { platformName } = params;
  const categories = await getPlatformCategories(platformName);

  // Format the platform name for display
  const formattedName = platformName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // If the name includes a year range (e.g., "2015-2023-mustang")
  // Format it nicely (e.g., "2015-2023 Mustang")
  const displayName = formattedName.replace(/(\d{4}-\d{4})\s/, '$1 ');

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
      <ProductGrid platformName={platformName} />
      <Footer1 />
    </>
  );
}
