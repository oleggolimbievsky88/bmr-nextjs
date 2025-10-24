import OrderConfirmation from "@/components/othersPages/OrderConfirmation";
import Header from "@/components/header/Header";
import Footer1 from "@/components/footer/Footer";

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

export default function ConfirmationPage() {
  return (
    <>
      <Header />
      <OrderConfirmation />
      <Footer1 />
    </>
  );
}
