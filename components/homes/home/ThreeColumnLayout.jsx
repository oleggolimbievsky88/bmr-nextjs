// components/ThreeColumnLayout.js

import Link from "next/link";

// components/ThreeColumnLayout.js
export default function ThreeColumnLayout() {
  return (
    <div className="container mt-5">
      <div className="row">
        {[
          {
            img: "/images/shop-categories/NewProductsGradient.jpg",
            title: "NEW PRODUCTS",
            link: "/products/new",
          },
          {
            img: "/images/shop-categories/MerchGradient.jpg",
            title: "BMR MERCHANDISE",
            link: "/products/apparel",
          },
          {
            img: "/images/shop-categories/GiftCardsGradient.jpg",
            title: "BMR GIFT CARDS",
            link: "product-giftcard",
          },
        ].map((item, index) => (
          <div key={index} className="col-lg-4 col-md-6 col-sm-12 mb-4">
            <Link
              key={index}
              href={`/${item.link.toLowerCase().replace(" ", "-")}`}
            >
              <div className="card bg-dark text-white border-0 custom-card">
                <img src={item.img} className="card-img" alt={item.title} />
                <div className="card-img-overlay d-flex flex-column justify-content-end p-3">
                  <span className="shop-now">SHOP NOW</span>
                  <h5 className="card-title mt-1 fw-bold">{item.title}</h5>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
