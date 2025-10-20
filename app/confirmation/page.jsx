import OrderConfirmation from "@/components/othersPages/OrderConfirmation";

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

export default function ConfirmationPage() {
  return <OrderConfirmation />;
}
