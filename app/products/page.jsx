import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  return (
    <div className="container pt-3 pb-5" style={{ minHeight: "60vh" }}>
      {/* Platform Categories */}
      <div className="row g-4">
        <div className="col-12">
          <div className="text-center">
            <h1
              className="home-title d-inline-block"
              style={{
                lineHeight: "30px",
                marginTop: "30px",
                marginBottom: "5px",
              }}
            >
              Choose Your Platform
            </h1>
            <p className="text-center text_black-2 mt-1 mb-5">
              Select a platform category to browse available parts and products.
            </p>
          </div>
        </div>

        {/* Ford Platform Card */}
        <div className="col-md-6 col-lg-4">
          <Link href="/products/ford" className="text-decoration-none">
            <div className="card h-100 border-0 shadow-sm hover-shadow rounded-4 overflow-hidden">
              <div className="card-body text-center p-4">
                <h3
                  className="card-title text-dark mb-3"
                  style={{ fontWeight: "bold" }}
                >
                  FORD PLATFORMS
                </h3>
                <p className="card-text text-muted">
                  Explore every Ford platform we support. Click to shop parts
                  for Mustangs, Broncos, and more.
                </p>
                <div className="mt-3">
                  <span className="btn btn-danger">View Ford Platforms</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* GM Platform Card */}
        <div className="col-md-6 col-lg-4">
          <Link href="/products/gm" className="text-decoration-none">
            <div className="card h-100 border-0 shadow-sm hover-shadow rounded-4 overflow-hidden">
              <div className="card-body text-center p-4">
                <h3
                  className="card-title text-dark mb-3"
                  style={{ fontWeight: "bold" }}
                >
                  GM PLATFORMS
                </h3>
                <p className="card-text text-muted">
                  Browse GM Late Model, Mid Muscle, and Classic Muscle
                  platforms. Corvettes, Camaros, and more.
                </p>
                <div className="mt-3">
                  <span className="btn btn-danger">View GM Platforms</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Mopar Platform Card */}
        <div className="col-md-6 col-lg-4">
          <Link href="/products/mopar" className="text-decoration-none">
            <div className="card h-100 border-0 shadow-sm hover-shadow rounded-4 overflow-hidden">
              <div className="card-body text-center p-4">
                <h3
                  className="card-title text-dark mb-3"
                  style={{ fontWeight: "bold" }}
                >
                  MOPAR PLATFORMS
                </h3>
                <p className="card-text text-muted">
                  Discover Mopar platforms including Challengers, Chargers, and
                  other Dodge/Chrysler vehicles.
                </p>
                <div className="mt-3">
                  <span className="btn btn-danger">View Mopar Platforms</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
