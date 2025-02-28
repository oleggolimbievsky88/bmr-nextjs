import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PlatformHeader from "@/components/header/PlatformHeader";

export default function PlatformLayout({ children, params }) {
    return (
        <div>
            <Header2 />
            <main className="my-4">{children}</main>
            <Footer1 />
        </div>
    );
}
