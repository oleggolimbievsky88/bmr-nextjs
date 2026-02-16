"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Topbar4 from "@/components/header/Topbar4";
import Header from "@/components/header/Header";
import AdminNav from "@/components/admin/AdminNav";
import Footer1 from "@/components/footer/Footer";

export default function AdminLayoutClient({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const isPrintPage = pathname?.includes("/print");

  useEffect(() => {
    if (status === "loading") return;

    // Already logged in as admin on login page -> go to dashboard
    if (isLoginPage && session?.user?.role === "admin") {
      router.replace("/admin");
      return;
    }

    if (isLoginPage) return;

    // Session expired or not admin -> redirect to unified login
    // Defer redirect to avoid React removeChild errors during unmount
    if (!session) {
      const cb =
        pathname && pathname.startsWith("/admin") ? pathname : "/admin";
      const id = setTimeout(
        () => router.replace(`/login?callbackUrl=${encodeURIComponent(cb)}`),
        0,
      );
      return () => clearTimeout(id);
    }

    if (session.user?.role !== "admin") {
      const id = setTimeout(() => router.replace("/"), 0);
      return () => clearTimeout(id);
    }
  }, [session, status, router, isLoginPage, pathname]);

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
        <Header showVehicleSearch={false} />
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
      <Header showVehicleSearch={false} />
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
