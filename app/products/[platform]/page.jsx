import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";
import ShopLoadmoreOnScroll from "@/components/shop/ShopLoadmoreOnScroll";

export default async function PlatformPage({ params }) {
  const { platform } = await params;
  let platformInfo = null;
  let mainCategories = [];
  let error = null;

  try {
    // Fetch platform info and main categories
    const platformRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/platforms/${platform}`,
      { cache: "no-store" }
    );
    if (!platformRes.ok) throw new Error("Failed to fetch platform info");
    const platformData = await platformRes.json();
    platformInfo = platformData.platformInfo || {};
    mainCategories = platformData.mainCategories || [];
  } catch (err) {
    error = err.message;
  }

  if (error) {
    return <div className="text-center py-5 text-danger">{error}</div>;
  }

  return (
    <div className="p-0 m-0">
      <PlatformHeader
        platformData={{
          HeaderImage: platformInfo?.headerImage,
          Name: platformInfo?.name,
          StartYear: platformInfo?.startYear,
          EndYear: platformInfo?.endYear,
          Image: platformInfo?.image,
          slug: platformInfo?.slug,
        }}
      />

      <div className="container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: platformInfo?.name || platform, href: "#" },
          ]}
        />

        {/* Categories Section */}
        <section className="mb-3">
          <CategoryGrid
            categories={mainCategories}
            platform={platform}
            isMainCategory={true}
          />
        </section>

        {/* Sidebar and Infinite Scroll */}
        <div className="row">
          <div className="col-md-12">
            <ShopSidebarleft
              platform={platformInfo}
              isMainCategory={false}
              mainCategories={mainCategories}
            />
          </div>
          {/* <div className="col-md-9">
						<ShopLoadmoreOnScroll platform={platform} />
					</div> */}
        </div>
      </div>
    </div>
  );
}
