"use client";

import { useEffect } from "react";

export default function AdminError({ error }) {
  useEffect(() => {
    // Only auto-redirect for *auth* failures.
    // Redirecting on any runtime/UI error creates redirect loops (e.g. DOM removeChild errors).
    const msg = String(error?.message || "");
    const looksLikeAuth =
      /unauthorized|jwt|token|session|signin|callback/i.test(msg);
    if (!looksLikeAuth) return;
    const callbackUrl = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    window.location.href = `/login?callbackUrl=${callbackUrl}`;
  }, [error]);

  const message = String(error?.message || "");

  return (
    <div className="container text-center py-5">
      <h2>Something went wrong</h2>
      <p className="text-muted">
        {message ? message : "An unexpected error occurred on this admin page."}
      </p>
      <button
        onClick={() => {
          window.location.reload();
        }}
        className="btn btn-outline-dark mt-3"
      >
        Reload page
      </button>
      <div className="mt-3">
        <a href="/login" className="btn btn-primary">
          Go to login
        </a>
      </div>
    </div>
  );
}
