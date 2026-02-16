import Footer1 from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import ResetPasswordClient from "@/components/othersPages/ResetPassword";
import React, { Suspense } from "react";

export const metadata = {
  title:
    "Reset Password | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};

export default function ResetPasswordPage() {
  return (
    <>
      <Topbar4 />
      <Header showVehicleSearch={false} />
      <PageHeader title="RESET PASSWORD" />
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
        <ResetPasswordClient />
      </Suspense>
      <Footer1 />
    </>
  );
}
