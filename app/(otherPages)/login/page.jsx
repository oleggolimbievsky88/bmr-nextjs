import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import Login from "@/components/othersPages/Login";
import React, { Suspense } from "react";

export const metadata = {
  title:
    "Login | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
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

export default function page() {
  return (
    <>
      <Topbar4 />
      <Header18 showVehicleSearch={false} />
      <PageHeader title="LOGIN" />
      <Suspense fallback={<LoginFallback />}>
        <Login />
      </Suspense>
      <Footer1 />
    </>
  );
}
