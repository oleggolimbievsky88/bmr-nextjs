import Footer1 from "@/components/footer/Footer";
import Header2 from "@/components/header/Header";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function ProductsLayout({ children, params }) {
    const { platform, mainCategory, category } = params;
    return (
        <>
            <Header2 />
            <Breadcrumbs params={params} />
            <main className="my-4">{children}</main>
            <Footer1 />
        </>
    );
}
