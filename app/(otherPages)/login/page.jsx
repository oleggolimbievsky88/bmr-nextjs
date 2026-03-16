import { Suspense } from "react";
import LoginRedirectClient from "./LoginRedirectClient";

export default function LoginRedirectPage() {
  return (
    <Suspense fallback={<LoginRedirectFallback />}>
      <LoginRedirectClient />
    </Suspense>
  );
}

function LoginRedirectFallback() {
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
