import { Suspense } from "react";
import Footer1 from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import Login from "@/components/othersPages/Login";

export default function AuthLoginPage() {
  return (
    <>
      <Topbar4 />
      <Header showVehicleSearch={false} />
      <PageHeader title="LOGIN" />
      <Suspense
        fallback={
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
        }
      >
        <Login />
      </Suspense>
      <Footer1 />
    </>
  );
}
