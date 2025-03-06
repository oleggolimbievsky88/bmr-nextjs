import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PlatformHeader from "@/components/header/PlatformHeader";
import Header18 from "@/components/header/Header18";
export default function PlatformLayout({ children, params }) {
    return (
        <div>
            <Header18 />
            <main className="my-4">{children}</main>
            <Footer1 />
        </div>
    );
}
