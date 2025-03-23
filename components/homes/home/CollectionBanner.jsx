import React from "react";
import Image from "next/image";
import Link from "next/link";
export default function CollectionBanner() {
  return (
    <section>
      <div className="container">
        <div className="tf-grid-layout bg_blue-5 gap-0 rounded-0 md-col-2 tf-img-with-text style-3">
          <div
            className="tf-content-wrap"
            style={{ backgroundColor: "var(--bs-grey)" }}
          >
            <div>
              <h2 className="heading wow fadeInUp" data-wow-delay="0s">
                2024 Mustang
              </h2>
              <div
                className="description text_black-2 wow fadeInUp"
                data-wow-delay="0s"
              >
                <p>
                  Upgrading your 2024 Mustang with BMR Suspension aftermarket
                  products delivers a significant boost in performance,
                  handling, and overall driving experience.
                </p>
                <br />
                <p>
                  Designed specifically for high-performance applications, BMR
                  Suspension components enhance cornering, stability, and ride
                  comfort, making them ideal for both daily driving and track
                  use.
                </p>
                <br />
                <p>
                  Engineered for strength and precision, these suspension
                  upgrades help you maximize the full potential of your Mustang,
                  offering improved traction, reduced body roll, and greater
                  control.
                </p>
              </div>
              <Link
                href={`/shop-collection-list`}
                className="tf-btn btn-outline-dark radius-3 link justify-content-center wow fadeInUp"
                data-wow-delay="0s"
              >
                Shop Collection
              </Link>
            </div>
          </div>
          <div className="tf-image-wrap">
            <Image
              className="lazyload"
              data-src="/images/platforms/2024_mustang_1x1.jpg"
              alt="collection-img"
              src="/images/platforms/2024_mustang_1x1.jpg"
              width={800}
              height={598}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
