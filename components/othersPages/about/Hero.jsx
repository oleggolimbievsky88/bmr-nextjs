import React from "react";
import Image from "next/image";
export default function Hero() {
  return (
    <section className="tf-slideshow about-us-page position-relative">
      <div className="banner-wrapper">
        <Image
          className="lazyload"
          src="/images/slider/about-banner-01.jpg"
          data-=""
          alt="image-collection"
          width={2000}
          height={1262}
        />
        <div className="box-content text-center">
          <div className="container">
            <h1 className="title text-danger">BMR Suspension</h1>
            <div className="text-black">
              <h5>We have the suspension and chassis components for your race car, hot rod, or truck.</h5>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
