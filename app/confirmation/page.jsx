import OrderConfirmation from "@/components/othersPages/OrderConfirmation";
import Header from "@/components/header/Header";
import Footer1 from "@/components/footer/Footer";
import { getBrandConfig } from "@/lib/brandConfig";

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

export default async function ConfirmationPage() {
  const brand = await getBrandConfig();
  return (
    <>
      <Header />
      <OrderConfirmation brand={brand} />
      <Footer1 />
    </>
  );
}
