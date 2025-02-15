import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Topbar1 from "@/components/header/Topbar1";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ProductGrid from "@/components/shop/ProductGrid";
import { getPlatformBySlug } from "@/lib/queries";

export const metadata = {
  title: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default async function PlatformPage({ params }) {
  const { platformSlug } = params;
  const platform = await getPlatformBySlug(platformSlug);

  if (!platform) {
    return <div>Platform not found</div>;
  }

  // Format the display name based on the platform data
  const displayName =
    platform.startYear && platform.endYear && platform.startYear !== "0"
      ? `${platform.startYear}${
          platform.startYear !== platform.endYear ? "-" + platform.endYear : ""
        } ${platform.name}`
      : platform.name;

  return (
    <>
      <Topbar1 />
      <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">{displayName}</div>
          <p className="text-center text-2 text_black-2 mt_5">
            Select a category to shop through our latest selection of Suspension
            & Chassis Parts
          </p>
        </div>
      </div>
      <CategoryGrid platformSlug={platformSlug} />
      <ProductGrid platformSlug={platformSlug} />
      <Footer1 />
    </>
  );
}
