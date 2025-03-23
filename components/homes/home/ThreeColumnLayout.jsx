// components/ThreeColumnLayout.js

import Link from "next/link";

// components/ThreeColumnLayout.js
export default function ThreeColumnLayout() {
  return (
    <div className="container three-column-layout">
      <div className="row">
        {[
          {
            img: "/images/logo/Ford_Logo.png",
            title: "FORD",
            link: "products/ford",
          },
          {
            img: "/images/logo/gm_logo.png",
            title: "GM",
            link: "products/gm",
          },
          {
            img: "/images/logo/dodge_logo.png",
            title: "Dodge",
            link: "products/mopar",
          },
        ].map((item, index) => (
          <div key={index} className="col-lg-4 col-md-6 col-sm-12">
            <Link key={index} href={`/${item.link}`}>
              <div className="card text-white border-0 custom-card">
                <img
                  src={item.img}
                  className="card-img"
                  alt={item.title}
                  style={{
                    height: "210px",
                    width: "450px",
                    borderRadius: "20px",
                    padding: "20px",
                  }}
                />
                <div className="card-img-overlay d-flex flex-column justify-content-end p-3 image-responsive">
                  <h2 className="card-title mt-0 pt-0 fw-bolder letter-spacing-1 text-white">
                    {item.title}
                  </h2>
                  <span className="shop-now">SHOP NOW</span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
