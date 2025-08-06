import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";

export default async function PlatformPage({ params }) {
  const { platform } = await params;
  let platformInfo = null;
  let mainCategories = [];
  let initialProducts = [];
  let error = null;

  try {
    // Fetch platform info and main categories
    // Fetch main categories for the platform
    const platformRes = await fetch(`/api/platforms/${platform}/`);
    const platformData = await platformRes.json();

    platformInfo = platformData.platformInfo || {};
    mainCategories = platformData.mainCategories || [];
    console.log("mainCategories", mainCategories);

    // Fetch initial products for this platform
    const productsRes = await fetch(
      `/api/products?page=1&limit=8&platform=${platform}`,
      { cache: "no-store" }
    );
    if (productsRes.ok) {
      const productsData = await productsRes.json();
      initialProducts = productsData.products || [];
    }
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

        {/* Sidebar and Products */}
        <section
          className="mb-5 mt-10"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            border: "1px solid #ddd",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <ShopSidebarleft
            platform={platformInfo}
            products={initialProducts}
            isMainCategory={true}
            mainCategories={mainCategories}
            categories={mainCategories}
            selectedMainCatId={null}
            selectedMainCatSlug={null}
          />
        </section>
      </div>
    </div>
  );
}
