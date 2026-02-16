"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const PORTAL_TITLE = "Dealer Portal | BMR Suspension";
import Topbar4 from "@/components/header/Topbar4";
import Header from "@/components/header/Header";
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
    <div className="dealers-portal-page">
      <Topbar4 />
      <Header showVehicleSearch={false} />
      <PageHeader title="Dealer Portal" />
      <nav className="dealer-nav-top">
        <div className="container-wide">
          <DealerNav />
        </div>
      </nav>
      <section className="flat-spacing-11 account-dashboard">
        <div className="container-wide">{children}</div>
      </section>
      <Footer1 />
    </div>
  );
}
