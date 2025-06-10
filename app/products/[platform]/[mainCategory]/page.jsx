import CategoryGrid from "@/components/shop/CategoryGrid";
import ProductGrid from "@/components/shop/ProductGrid";
import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";

async function fetchCategories(category) {
  const res = await fetch(`/api/maincategories/${category.mainCatId}`, {
    cache: "no-store",
  });
  return res.json();
}

async function fetchProducts(platformId, category) {
  const res = await fetch(`/api/maincategories/${category.mainCatId}`, {
    cache: "no-store",
  });
  return res.json();
}

export default function page({ params }) {
  const { platform, mainCategory } = params;
  return (
    <>
      <div>
        <h1>Platform: {platform}</h1>
        <h1>Main Category: {mainCategory}</h1>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1>Platform: {platform}</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <h1>Main Category: {mainCategory}</h1>
          </div>
          <div className="col-12">
            <CategoryGrid categories={mainCategory} />
          </div>
        </div>
      </div>
    </>
  );
}
