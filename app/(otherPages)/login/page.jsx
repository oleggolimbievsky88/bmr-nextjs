import Footer1 from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import Login from "@/components/othersPages/Login";
import { pageMeta } from "@bmr/core/seo";
import { brand } from "@/src/brand";
import React, { Suspense } from "react";

const title = `Login | ${brand.companyName} - Performance Racing Suspension & Chassis Parts`;
const description = `Log in to your ${brand.companyName} account. Manage orders, addresses, and wishlist. Performance suspension and chassis parts for Mustang, Camaro, GM, Mopar.`;

const { openGraph, twitter } = pageMeta({
  brand,
  path: "/login",
  title,
  description,
});

export const metadata = {
  title,
  description,
  openGraph,
  twitter,
};

function LoginFallback() {
  return (
    <section className="flat-spacing-10">
      <div className="container">
        <div className="text-center py-5">
          <div
            className="spinner-border text-danger"
            role="status"
            aria-hidden="true"
          />
          <p className="mt-2 mb-0">Loading...</p>
        </div>
      </div>
    </section>
  );
}

export default async function page({ searchParams }) {
  const params =
    typeof searchParams?.then === "function"
      ? await searchParams
      : searchParams || {};
  const callbackUrl = params?.callbackUrl || "";
  const isDealerPortal =
    typeof callbackUrl === "string" && callbackUrl.includes("/dealers-portal");
  const pageTitle = isDealerPortal ? "DEALER PORTAL" : "LOGIN";

  return (
    <>
      <Topbar4 />
      <Header showVehicleSearch={false} />
      <PageHeader title={pageTitle} />
      <Suspense fallback={<LoginFallback />}>
        <Login />
      </Suspense>
      <Footer1 />
    </>
  );
}
