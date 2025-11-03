import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import Topbar4 from "@/components/header/Topbar4";
import Topbar1 from "../header/Topbar1";
import Topbar2 from "../header/Topbar2";

export default function ProductPageLayout({ children }) {
  return (
    <div>
      <Topbar4 />
      <Header18 />
      <main className="product-page">{children}</main>
      <Footer1 />
    </div>
  );
}
