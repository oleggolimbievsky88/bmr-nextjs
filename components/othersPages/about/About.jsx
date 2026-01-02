import React from "react";
import Image from "next/image";

export default function About() {
  return (
    <>
      {/* --- MODERN HEADER SECTION --- */}
      <header className="bmr-hero py-5 text-center border-bottom border-secondary">
        <div className="container py-3 animate__animated animate__fadeIn">
          <h6
            className="fw-bold tracking-widest d-block mb-2"
            style={{ color: "var(--primary)" }}
          >
            ESTABLISHED 1998
          </h6>
          <h1 className=" italic-heavy mb-0">
            <span className="color-white" style={{ color: "white" }}>
              WE ARE
            </span>{" "}
            <span className="color-primary" style={{ color: "var(--primary)" }}>
              BMR SUSPENSION
            </span>
          </h1>
          <div
            className="mx-auto mt-3"
            style={{
              width: "80px",
              height: "6px",
              backgroundColor: "var(--primary)",
            }}
          ></div>
        </div>
      </header>

      {/* --- PHILOSOPHY SECTION --- */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h2 className="italic-heavy h1 border-red-thick mb-4">
                Innovative Design. <br />
                Quality Construction.
              </h2>
              <p className="lead mb-4">
                Since 1998, BMR Suspension has been serving the needs of
                performance automotive enthusiasts by filling the market void
                for innovative, affordable suspension products.
              </p>
              <p className="lead text-secondary">
                Currently offering products for{" "}
                <strong>22 different vehicles</strong>, BMR is the leading
                suspension manufacturer in many of the market segments it
                serves.
              </p>
            </div>
            <div className="col-lg-6">
              <div className="card bg-secondary bg-opacity-10 border-secondary p-4 rounded-4">
                <div className="card-body text-center">
                  <h3
                    className="italic-heavy display-4"
                    style={{ color: "var(--primary)" }}
                  >
                    22+
                  </h3>
                  <p className="text-uppercase tracking-wider fw-bold">
                    Vehicle Platforms Supported
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- MANUFACTURING SECTION --- */}
      <section className="bg-black py-5 border-top border-bottom border-secondary">
        <div className="container">
          <div className="row mb-5">
            <div className="col-md-8">
              <h2 className="italic-heavy display-5">
                American Made.{" "}
                <span
                  style={{
                    color: "white",
                    margin: "0 auto",
                    padding: "0px 10px !important",
                  }}
                >
                  Track Proven.
                </span>
              </h2>
            </div>
          </div>
          <div className="row g-4 text-center text-md-start">
            <div className="col-md-4">
              <h4 className="italic-heavy" style={{ color: "var(--primary)" }}>
                In-House Quality
              </h4>
              <p className="text-secondary">
                American workers cut, bend, and mill components from
                American-made DOM and chrome-moly steel near Tampa, Florida.
              </p>
            </div>
            <div className="col-md-4 border-start border-secondary">
              <h4 className="italic-heavy" style={{ color: "var(--primary)" }}>
                Precision Finish
              </h4>
              <p className="text-secondary">
                Every product is fixture-welded and powdercoated using BMR's
                in-house powdercoating line for total quality control.
              </p>
            </div>
            <div className="col-md-4 border-start border-secondary">
              <h4 className="italic-heavy" style={{ color: "var(--primary)" }}>
                Real Testing
              </h4>
              <p className="text-secondary">
                Products are street driven and track tested on our massive fleet
                of project vehicles to ensure perfect fitment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- EMPLOYEES & PASSION SECTION --- */}
      <section className="py-5">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <h2 className="italic-heavy">Built by Racers for Racers</h2>
              <p className="mb-5" style={{ fontSize: "18px" }}>
                Virtually every BMR employee is a racer or hot rodder. This love
                of racing is demonstrated everyday in BMR's customer service,
                design innovation, and manufacturing quality. From 1960s muscle
                cars to modern 2016+ Camaros, we live and breathe performance.
              </p>

              <div className="d-flex flex-wrap justify-content-center gap-2">
                {[
                  "Drag Racing",
                  "Street Performance",
                  "Handling Applications",
                  "American Steel",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="badge rounded-pill border px-3 py-2"
                    style={{
                      borderColor: "var(--primary)",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <footer className="container pb-5">
        <div
          className="text-white p-5 rounded-5 text-center shadow-lg"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <h2 className="italic-heavy display-4 mb-3">Push the Envelope</h2>
          <p className="mb-4 opacity-75" style={{ fontSize: "18px" }}>
            When performance is a must, rely on BMR Suspension!
          </p>
          <a
            href="/shop"
            className="btn btn-light btn-lg px-5 py-3 fw-black italic-heavy"
            style={{ color: "var(--primary)" }}
          >
            Shop the Catalog
          </a>
        </div>
      </footer>

      <section>
        <div className="container">
          <div className="tf-grid-layout md-col-2 tf-img-with-text style-4">
            <div className="tf-content-wrap px-0 d-flex justify-content-center w-100">
              <div>
                <h4 className="italic-heavy fw-5">Our Mission</h4>
                <div className="text">
                  Our mission is to provide innovative, quality-oriented, and
                  affordable suspension and chassis products for performance
                  automotive enthusiasts. Whether you're building a street
                  performance vehicle, a hardcore drag racer, or a handling
                  application, BMR Suspension has the products you need. We
                  believe in American manufacturing, precision engineering, and
                  testing every product on our own vehicles before it reaches
                  your garage.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="flat-image-text-section">
        <div className="container">
          <div className="tf-grid-layout md-col-2 tf-img-with-text style-4">
            <div className="tf-content-wrap px-0 d-flex justify-content-center w-100">
              <div>
                <h4 className="italic-heavy fw-5">Established - 1998</h4>
                <div className="text">
                  BMR Suspension was founded in 1998 to fill a void in the
                  performance automotive market. At the time, it was difficult
                  for enthusiasts to find suspension products that combined
                  innovative design, quality construction, and affordable
                  pricing. BMR turned this market need into a business
                  philosophy, and has been serving our customers' needs ever
                  since.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <style>{`
        .tracking-widest {
          letter-spacing: 0.3em;
        }
        .tracking-wider {
          letter-spacing: 0.1em;
        }
        .fw-black {
          font-weight: 900;
        }
          .text-secondary{
            font-size:15px;
          }
        .text {
          font-size:16px;
        }
        @media (max-width:992px){
            .text-secondary{
            font-size:13px;
          }
        }

      `}</style>
    </>
  );
}
