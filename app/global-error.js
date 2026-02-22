"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body
        style={{
          fontFamily: "Albert Sans, sans-serif",
          padding: "2rem",
          margin: 0,
        }}
      >
        <div
          style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center" }}
        >
          <h2 style={{ marginBottom: "1rem" }}>Something went wrong</h2>
          <p style={{ marginBottom: "1.5rem", color: "#333" }}>
            We couldn’t load this page. The link may be broken, or the product
            might no longer be available.
          </p>
          {error?.message && process.env.NODE_ENV === "development" && (
            <p
              style={{
                fontSize: "0.875rem",
                marginBottom: "1rem",
                color: "#666",
              }}
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
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                backgroundColor: "var(--primary, #000)",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "4px",
              }}
            >
              Go to Home
            </a>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #333",
                background: "transparent",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
