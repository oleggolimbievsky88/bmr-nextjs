import React from "react";
import Image from "next/image";

export default function About() {
  return (
    <>
      <section>
        <div className="container">
          <div className="tf-grid-layout md-col-2 tf-img-with-text style-4">
            <div className="tf-content-wrap px-0 d-flex justify-content-center w-100">
              <div>
                <h4>Our Mission</h4>
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
            {/* <div className="grid-img-group">
              <div className="tf-image-wrap box-img item-1">
                <div className="img-style">
                  <Image
                    className="lazyload"
                    src="/images/collections/collection-71.jpg"
                    data-=""
                    alt="BMR Project Vehicle"
                    width={337}
                    height={388}
                  />
                </div>
              </div>
              <div className="tf-image-wrap box-img item-2">
                <div className="img-style">
                  <Image
                    className="lazyload"
                    src="/images/collections/collection-70.jpg"
                    data-=""
                    alt="BMR Suspension Parts"
                    width={400}
                    height={438}
                  />
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>
      <section className="flat-image-text-section">
        <div className="container">
          <div className="tf-grid-layout md-col-2 tf-img-with-text style-4">
            {/* <div className="tf-image-wrap">
							<Image
								className="lazyload w-100"
								data-src="/images/collections/collection-69.jpg"
								alt="BMR Manufacturing Facility"
								src="/images/collections/collection-69.jpg"
								width={600}
								height={499}
							/>
						</div> */}
            <div className="tf-content-wrap px-0 d-flex justify-content-center w-100">
              <div>
                <h4>Established - 1998</h4>
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
    </>
  );
}
