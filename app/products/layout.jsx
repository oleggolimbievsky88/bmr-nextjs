import Footer1 from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar4 from "@/components/header/Topbar4";

export default function ProductsLayout({ children }) {
  return (
    <div>
      <Topbar4 />
      <Header showVehicleSearch={true} />
      <main className="product-page">{children}</main>
      <Footer1 />
    </div>
  );
}
