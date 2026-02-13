"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Topbar4 from "@/components/header/Topbar4";
import Header18 from "@/components/header/Header18";
import AdminNav from "@/components/admin/AdminNav";
import Footer1 from "@/components/footer/Footer";

export default function AdminLayout({ children }) {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const isPrintPage = pathname?.includes("/print");

  // Refetch session when admin tab regains focus (e.g. after overnight)
  useEffect(() => {
    if (isLoginPage) return;
    const onFocus = () => updateSession?.();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isLoginPage, updateSession]);

  useEffect(() => {
    if (status === "loading") return;

    // Already logged in as admin on login page -> go to dashboard
    if (isLoginPage && session?.user?.role === "admin") {
      router.replace("/admin");
      return;
    }

    if (isLoginPage) return;

    // Session expired or not admin -> redirect to unified login
    if (!session) {
      const cb =
        pathname && pathname.startsWith("/admin") ? pathname : "/admin";
      router.replace(`/login?callbackUrl=${encodeURIComponent(cb)}`);
      return;
    }

    if (session.user?.role !== "admin") {
      router.replace("/");
      return;
    }
  }, [session, status, router, isLoginPage]);

  if (isLoginPage) {
    // Already logged in as admin: show loading while redirecting to dashboard
    if (status === "authenticated" && session?.user?.role === "admin") {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 mb-0">Redirecting...</p>
          </div>
        </div>
      );
    }
    return (
      <>
        <Topbar4 />
        <Header18 showVehicleSearch={false} />
        <main className="admin-page">
          <div className="container-wide">{children}</div>
        </main>
        <Footer1 />
      </>
    );
  }

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

  if (!session || session.user?.role !== "admin") {
    return null;
  }

  // Print pages should not have header/footer
  if (isPrintPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Topbar4 />
      <Header18 showVehicleSearch={false} />
      <AdminNav user={session.user} />
      <main className="admin-page">
        <div className="container-wide">{children}</div>
      </main>
      <Footer1 />
      <div
        id="toast-container"
        className="toast-container admin-toast-container position-fixed top-0 end-0 p-3"
        style={{ zIndex: 1090 }}
        aria-live="polite"
      />
    </>
  );
}
