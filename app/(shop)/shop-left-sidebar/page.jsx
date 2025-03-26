import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Topbar1 from "@/components/header/Topbar1";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";
import { getAllProducts, getCategories, getBodyCategories } from "@/lib/queries";

export const metadata = {
  title: "Shop Left Sidebar | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default async function Page() {
  // Fetch initial data
  const [products, categories, platforms] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getBodyCategories()
  ]);
  return (
    <>
      <Topbar1 /> <Header2 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="row">
            <div className="col-12">
              <div className="heading text-center">New Arrival</div>
              <p className="text-center text-2 text_black-2 mt_5">
                Shop through our latest selection of Fashion
              </p>
            </div>
          </div>
        </div>
      </div>
      <ShopSidebarleft 
        initialProducts={products} 
        categories={categories}
        platforms={platforms}
      />
      <Footer1 />
    </>
  );
}
