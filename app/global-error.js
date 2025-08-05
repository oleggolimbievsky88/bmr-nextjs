"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div className="container text-center py-5">
          <h2>Something went wrong!</h2>
          <p>{error?.message || "An error occurred"}</p>
          <button onClick={() => reset()} className="btn btn-primary">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
