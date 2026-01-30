"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const PORTAL_TITLE = "Dealer Portal | BMR Suspension";
import Topbar4 from "@/components/header/Topbar4";
import Header18 from "@/components/header/Header18";
import PageHeader from "@/components/header/PageHeader";
import Footer1 from "@/components/footer/Footer";
import DealerNav from "@/components/dealer/DealerNav";

export default function DealersPortalLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = PORTAL_TITLE;
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace(
        `/login?callbackUrl=${encodeURIComponent(pathname || "/dealers-portal")}`,
      );
      return;
    }

    const role = session.user?.role;
    if (role !== "dealer" && role !== "admin") {
      router.replace("/");
    }
  }, [session, status, router, pathname]);

  if (status === "loading") {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 mb-0">Loading...</p>
        </div>
      </div>
    );
  }

  if (
    !session ||
    (session.user?.role !== "dealer" && session.user?.role !== "admin")
  ) {
    return null;
  }

  return (
    <>
      <Topbar4 />
      <Header18 showVehicleSearch={false} />
      <PageHeader title="Dealer Portal" />
      <section className="flat-spacing-11 account-dashboard">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <DealerNav />
            </div>
            <div className="col-lg-9">{children}</div>
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
