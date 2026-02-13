"use client";

import { useEffect } from "react";

export default function AdminError({ error }) {
  useEffect(() => {
    // Redirect to login on any admin error - typically caused by expired session
    // after long inactivity (DOM errors, fetch failures, etc.)
    if (typeof window !== "undefined") {
      const callbackUrl = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      window.location.href = `/login?callbackUrl=${callbackUrl}`;
    }
  }, [error]);

  return (
    <div className="container text-center py-5">
      <h2>Session expired</h2>
      <p>Redirecting to login...</p>
      <p className="text-muted small">
        If you are not redirected, <a href="/login">click here to log in</a>.
      </p>
      <button
        onClick={() => {
          const cb = encodeURIComponent(
            window.location.pathname + window.location.search,
          );
          window.location.href = `/login?callbackUrl=${cb}`;
        }}
        className="btn btn-primary mt-3"
      >
        Go to login
      </button>
    </div>
  );
}
