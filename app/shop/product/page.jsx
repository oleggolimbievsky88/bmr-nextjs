"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductDetailPage({ params }) {
  const [selectedColor, setSelectedColor] = useState("Red");
  const [addGrease, setAddGrease] = useState(false);
  const [addAngleFinder, setAddAngleFinder] = useState(false);

  console.log("params", params);

  // Dummy product data for development
  const product = {
    id: 1,
    name: "Delrin Bushing Kit for Front Control Arms",
    description:
      "High performance polyurethane bushings for improved handling and durability",
    platform: "2010-2015 Camaro",
    basePrice: 89.99,
    images: ["/images/product1.jpg"],
    colors: ["Red", "Black", "Blue"],
    additionalOptions: [
      { name: "Grease", price: 4.99 },
      { name: "Angle Finder", price: 9.99 },
    ],
    features: [
      "Made from high-quality materials",
      "Improves handling and performance",
      "Easy installation",
      "Made in USA",
    ],
  };

  const calculateTotalPrice = () => {
    let total = product.basePrice;
    if (addGrease) total += product.additionalOptions[0].price;
    if (addAngleFinder) total += product.additionalOptions[1].price;
    return total.toFixed(2);
  };

  return (
    <div className="container product-detail-page">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href={`/products/${params.platform}`}>{params.platform}</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href={`/products/${params.platform}/${params.category}`}>
              {params.category}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-md-6">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={500}
            height={500}
            className="img-fluid"
          />
        </div>
        <div className="col-md-6">
          <h1>{product.name}</h1>
          <p className="product-platform">{product.platform}</p>
          <p className="product-description">{product.description}</p>

          <div className="product-options">
            <h3>Color</h3>
            <div className="color-selection">
              {product.colors.map((color) => (
                <button
                  key={color}
                  className={`btn color-btn ${
                    selectedColor === color ? "selected" : ""
                  }`}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>

            <div className="additional-options">
              {product.additionalOptions.map((option) => (
                <div key={option.name} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`add-${option.name.toLowerCase().replace(/\s+/g, "-")}`}
                    checked={
                      option.name === "Grease" ? addGrease : addAngleFinder
                    }
                    onChange={() =>
                      option.name === "Grease"
                        ? setAddGrease(!addGrease)
                        : setAddAngleFinder(!addAngleFinder)
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`add-${option.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    Add {option.name} (+${option.price})
                  </label>
                </div>
              ))}
            </div>

            <div className="product-price">
              <h2>${calculateTotalPrice()}</h2>
            </div>

            <button className="btn btn-primary add-to-cart-btn">
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <div className="product-details mt-5">
        <ul className="nav nav-tabs" id="productTabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
              id="description-tab"
              data-bs-toggle="tab"
              data-bs-target="#description"
              type="button"
              role="tab"
            >
              Description
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="applications-tab"
              data-bs-toggle="tab"
              data-bs-target="#applications"
              type="button"
              role="tab"
            >
              Applications
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="installation-tab"
              data-bs-toggle="tab"
              data-bs-target="#installation"
              type="button"
              role="tab"
            >
              Installation
            </button>
          </li>
        </ul>
        <div className="tab-content" id="productTabContent">
          <div
            className="tab-pane fade show active"
            id="description"
            role="tabpanel"
          >
            <ul>
              {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="tab-pane fade" id="applications" role="tabpanel">
            <p>Fits 1997-2004 C5 Corvettes</p>
          </div>
          <div className="tab-pane fade" id="installation" role="tabpanel">
            <p>
              2-3 hour installation time. Professional installation recommended.
            </p>
          </div>
        </div>
      </div>

      <section className="related-products mt-5">
        <h3>YOU MAY ALSO LIKE...</h3>
        <div className="row">
          {/* Similar to the image's related products section */}
          {[
            {
              name: "Motor Mount Kit, Delrin",
              price: 129.99,
              image: "/path/to/related1.jpg",
            },
            {
              name: "Front/Rear Control Arm Delrin Bushing Kit",
              price: 79.99,
              image: "/path/to/related2.jpg",
            },
            {
              name: 'Brake Kit for 15" Conversion',
              price: 599.99,
              image: "/path/to/related3.jpg",
            },
          ].map((relatedProduct, index) => (
            <div key={index} className="col-4">
              <div className="related-product-item">
                <Image
                  src={relatedProduct.image}
                  alt={relatedProduct.name}
                  width={300}
                  height={300}
                  className="img-fluid"
                />
                <p>{relatedProduct.name}</p>
                <p>${relatedProduct.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
