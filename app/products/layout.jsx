import Footer1 from "@/components/footer/Footer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PlatformHeader from "@/components/header/PlatformHeader";
import Header18 from "@/components/header/Header18";
import Topbar4 from "@/components/header/Topbar4";
export default function PlatformLayout({ children, params }) {
    return (
        <div>
            <Topbar4 />
            <Header18 />
            <main className="my-4">{children}</main><br />
            <Footer1 />
        </div>
    );
}

