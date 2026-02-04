import React from "react";
import Image from "next/image";

export default function About() {
  return (
    <>
      {/* --- MODERN HEADER SECTION --- */}
      <header
        className="bmr-hero py-5 text-center"
        style={{ borderBottom: "4px solid var(--primary)" }}
      >
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
                When BMR Suspension began back in 1998, it was difficult for
                performance automotive enthusiasts to find suspension products
                that had an innovative design and quality construction at an
                affordable price. BMR turned this market void into a business
                philosophy, and has been serving our customers&apos; needs ever
                since.
              </p>
              <p className="lead text-secondary">
                Currently offering chassis, suspension, and drivetrain products
                for over <strong>50 different vehicles</strong>, BMR is the
                leading suspension manufacturer in many of the market segments
                that it serves.
              </p>
            </div>
            <div className="col-lg-6">
              <div
                className="card bg-secondary bg-opacity-10 p-4 rounded-4"
                style={{ border: "2px solid var(--primary)" }}
              >
                <div className="card-body text-center">
                  <h3
                    className="italic-heavy display-4"
                    style={{ color: "var(--primary)" }}
                  >
                    50+
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
      <section
        className="bg-black py-5"
        style={{
          borderTop: "4px solid var(--primary)",
          borderBottom: "4px solid var(--primary)",
        }}
      >
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
                Whether you are modifying your vehicle for street performance,
                drag racing, or handling applications, BMR Suspension has the
                products that you need. Proudly made in the USA in two
                manufacturing facilities near Tampa, Florida, American workers
                cut, bend, notch, drill, and mill components from American-made
                DOM and chrome-moly steel.
              </p>
            </div>
            <div
              className="col-md-4 border-start"
              style={{ borderColor: "var(--primary)" }}
            >
              <h4 className="italic-heavy" style={{ color: "var(--primary)" }}>
                Precision Finish
              </h4>
              <p className="text-secondary">
                Every product is fixture-welded to maintain consistent quality.
                Workers bead-blast parts and then powder coat them using
                BMR&apos;s in-house powder coating line. Finished parts are then
                assembled, packaged, and shipped to distributors and customers
                like you to get the performance you need right to your door.
              </p>
            </div>
            <div
              className="col-md-4 border-start"
              style={{ borderColor: "var(--primary)" }}
            >
              <h4 className="italic-heavy" style={{ color: "var(--primary)" }}>
                Real Testing
              </h4>
              <p className="text-secondary">
                By manufacturing every product in-house, BMR can ensure the
                highest quality at every stage of the manufacturing process and
                deliver the performance you need right to your door.
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
              <p className="mb-4" style={{ fontSize: "18px" }}>
                BMR Suspension products fit and work so well because they are
                street driven and track tested on BMR project vehicles! Past
                project cars include a 2011 Mustang, a 1968 GTO, a 1994 Camaro,
                a 2018 Challenger, and many more. BMR&apos;s current project
                vehicles include a 1965 Mustang, a 1972 C10, a 2024 Mustang, and
                a 2015 Corvette.
              </p>
              <p className="mb-5" style={{ fontSize: "18px" }}>
                But it is more than just great vehicles involved in testing our
                products: many BMR employees are racers as well and use BMR
                parts to get the extra performance they need to win in a variety
                of racing applications. This love of racing is demonstrated
                every day in BMR&apos;s customer service, design innovation, and
                manufacturing quality!
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
            By continuing to push the envelope in product design innovation and
            manufacturing technology, you can be sure that BMR Suspension will
            continue to offer the most innovative, quality-oriented, and
            affordable suspension products available. When performance is a
            must, rely on BMR Suspension!
          </p>
          <a
            href="/products"
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
