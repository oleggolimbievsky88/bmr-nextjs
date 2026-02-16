import Footer1 from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import VerifyEmailClient from "@/components/othersPages/VerifyEmail";
import React, { Suspense } from "react";

export const metadata = {
  title:
    "Verify Email | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default function VerifyEmailPage() {
  return (
    <>
      <Topbar4 />
      <Header showVehicleSearch={false} />
      <PageHeader title="VERIFY EMAIL" />
      <Suspense
        fallback={
          <section className="flat-spacing-10">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-6">
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading...</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        }
      >
        <VerifyEmailClient />
      </Suspense>
      <Footer1 />
    </>
  );
}
