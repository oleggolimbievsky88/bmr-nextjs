import Footer1 from "@/components/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PlatformHeader from "@/components/header/PlatformHeader";
import Header18 from "@/components/header/Header18";
import Topbar4 from "@/components/header/Topbar4";

export default function ProductsLayout({ children }) {
  // Check if the current path includes [platform]
  const isPlatformPage =
    children.props?.childProp?.segment?.includes("platform");

  console.log(children.props?.childProp?.segment);

  return (
    <div>
      <Topbar4 />
      <Header18 />
      <main className="product-page">{children}</main>
      <Footer1 />
    </div>
  );
}
