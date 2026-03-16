"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginRedirectClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");
    const recover = searchParams.get("recover");
    if (callbackUrl) params.set("callbackUrl", callbackUrl);
    if (recover) params.set("recover", recover);
    const query = params.toString();
    router.replace(`/auth/login${query ? `?${query}` : ""}`);
  }, [router, searchParams]);

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
