import Topbar4 from "@/components/header/Topbar4";
import Header from "@/components/header/Header";
import Footer1 from "@/components/footer/Footer";
import VendorPortalApp from "@/components/vendorPortal/VendorPortalApp";
import { headers } from "next/headers";
import { getVendorBrandFromHost } from "@/lib/vendorPortal/brand";

export const dynamic = "force-dynamic";

export default async function VendorPortalPage() {
  const h = await headers();
  const brand = getVendorBrandFromHost(h.get("host"));

  return (
    <>
      <Topbar4 />
      <Header showVehicleSearch={false} />
      <VendorPortalApp brand={brand} />
      <Footer1 />
    </>
  );
}
