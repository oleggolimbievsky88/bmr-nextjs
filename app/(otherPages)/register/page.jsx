import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import Register from "@/components/othersPages/Register";
import { pageMeta } from "@/lib/metadata";

const title =
  "Register | BMR Suspension - Performance Racing Suspension & Chassis Parts";
const description =
  "Create your BMR Suspension account. Manage orders, addresses, and wishlist. Performance suspension and chassis parts for Mustang, Camaro, GM, Mopar.";

const { openGraph, twitter } = pageMeta({
  path: "/register",
  title,
  description,
});

export const metadata = {
  title,
  description,
  openGraph,
  twitter,
};

export default function page() {
  return (
    <>
      <Topbar4 />
      <Header18 showVehicleSearch={false} />
      <PageHeader title="REGISTER" />
      <Register />
      <Footer1 />
    </>
  );
}
