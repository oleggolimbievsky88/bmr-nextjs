"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Admin login is now unified with /login.
 * Redirect to /login with callbackUrl for backwards compatibility.
 */
export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?callbackUrl=/admin");
  }, [router]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 mb-0">Redirecting to login...</p>
      </div>
    </div>
  );
}
