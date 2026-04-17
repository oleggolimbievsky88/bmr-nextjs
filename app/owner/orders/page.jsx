import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getBrandConfig } from "@/lib/brandConfig";
import OwnerOrdersClient from "./OwnerOrdersClient";

const OWNER_CUSTOMER_ID = 54727;

export default async function OwnerOrdersPage() {
  const session = await getServerSession(authOptions);
  const customerId = session?.user?.id ? parseInt(session.user.id, 10) : null;

  if (!customerId || customerId !== OWNER_CUSTOMER_ID) {
    notFound();
  }

  const config = await getBrandConfig();
  const initialBrand =
    config?.key && typeof config.key === "string"
      ? config.key.trim().toLowerCase()
      : "bmr";

  return (
    <OwnerOrdersClient
      ownerCustomerId={OWNER_CUSTOMER_ID}
      initialBrand={initialBrand}
    />
  );
}
