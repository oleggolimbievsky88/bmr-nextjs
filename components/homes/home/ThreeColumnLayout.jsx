// components/ThreeColumnLayout.js

import Link from "next/link";

// components/ThreeColumnLayout.js
export default function ThreeColumnLayout() {
  return (
    <div className="container mt-5">
      <div className="row">
        {[
          {
            img: "/images/logo/Ford_Logo.png",
            title: "FORD",
            link: "/products/new",
          },
          {
            img: "/images/logo/gm_logo.png",
            title: "GM",
            link: "/products/apparel",
          },
          {
            img: "/images/logo/dodge_logo.png",
            title: "Mopar",
            link: "product-giftcard",
          },
        ].map((item, index) => (
          <div key={index} className="col-lg-4 col-md-6 col-sm-12 mb-5 pb-5">
            <Link
              key={index}
              href={`/${item.link}`}
            >
              <div className="card bg-dark text-white border-0 custom-card">
                <img 
                  src={item.img} 
                  className="card-img" 
                  alt={item.title} 
                  style={{ height: "225px", width: "450px", borderRadius: "20px" }}
                />
                <div className="card-img-overlay d-flex flex-column justify-content-end p-3">
                  
                  <h3 className="card-title mt-1 fw-bold">{item.title}</h3>
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
