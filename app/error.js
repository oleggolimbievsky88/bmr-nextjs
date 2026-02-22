"use client";

import Link from "next/link";

export default function Error({ error, reset }) {
  return (
    <div
      className="container text-center py-5"
      style={{ maxWidth: "480px", margin: "0 auto" }}
    >
      <h2 style={{ marginBottom: "1rem" }}>Something went wrong</h2>
      <p style={{ marginBottom: "1.5rem", color: "var(--black, #333)" }}>
        We couldn’t load this page. The link may be broken, or the product might
        no longer be available.
      </p>
      {error?.message && process.env.NODE_ENV === "development" && (
        <p
          style={{ fontSize: "0.875rem", marginBottom: "1rem", color: "#666" }}
        >
          {error.message}
        </p>
      )}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link href="/" className="btn btn-primary">
          Go to Home
        </Link>
        <button
          type="button"
          onClick={() => reset()}
          className="btn btn-outline-primary"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
