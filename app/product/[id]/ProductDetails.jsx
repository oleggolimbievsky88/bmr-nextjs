"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function ProductDetails({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        const data = await response.json();
        if (data.product) {
          setProduct(data.product);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <div className="error-message">
          Product not found. Please try another product or return to the{" "}
          <Link href="/">homepage</Link>.
        </div>
      </div>
    );
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const imageUrl = product.ImageSmall
    ? `https://bmrsuspension.com/siteart/products/${product.ImageSmall}`
    : "https://bmrsuspension.com/siteart/noimage.jpg";

  return (
    <div className="product-details">
      <div className="tf-breadcrumb">
        <div className="container">
          <div className="tf-breadcrumb-wrap">
            <div className="tf-breadcrumb-list">
              <Link href="/" className="text">
                Home
              </Link>
              <i className="icon icon-arrow-right" />
              <Link href="/products" className="text">
                Products
              </Link>
              <i className="icon icon-arrow-right" />
              <span className="text">{product.ProductName}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="product-main-content">
          <div className="row">
            <div className="col-md-6">
              <div className="product-image-container">
                <div className="product-image-slider">
                  <Swiper
                    modules={[Navigation]}
                    navigation={true}
                    className="product-swiper"
                    slidesPerView={1}
                  >
                    <SwiperSlide>
                      <div className="product-image">
                        <Image
                          src={imageUrl}
                          alt={product.ProductName}
                          width={600}
                          height={600}
                          quality={75}
                          unoptimized={true}
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    </SwiperSlide>
                  </Swiper>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="product-info">
                <h1 className="product-title">{product.ProductName}</h1>
                <div className="product-meta">
                  <div className="product-sku">
                    <span>Part Number:</span> {product.PartNumber}
                  </div>
                </div>

                <div className="product-price">
                  <span className="price">
                    ${parseFloat(product.Price || "0").toFixed(2)}
                  </span>
                  {product.Retail && product.Retail !== product.Price && (
                    <span className="retail-price">
                      ${parseFloat(product.Retail).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="product-description">
                  {product.Description && (
                    <div
                      dangerouslySetInnerHTML={{ __html: product.Description }}
                    />
                  )}
                </div>

                {product.Features && (
                  <div className="product-features">
                    <h3>Features:</h3>
                    <div
                      dangerouslySetInnerHTML={{ __html: product.Features }}
                    />
                  </div>
                )}

                <div className="product-actions">
                  <div className="quantity-selector">
                    <button onClick={() => handleQuantityChange(-1)}>-</button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      min="1"
                    />
                    <button onClick={() => handleQuantityChange(1)}>+</button>
                  </div>

                  <button className="add-to-cart-btn">Add to Cart</button>
                </div>

                {product.Color === "1" && (
                  <div className="product-options">
                    <h3>Color Options:</h3>
                    <div className="color-options">
                      <button className="color-option black"></button>
                      <button className="color-option red"></button>
                    </div>
                  </div>
                )}

                <div className="product-meta-info">
                  {product.UsaMade === 1 && (
                    <div className="made-in-usa">
                      <span>🇺🇸 Proudly Made in the USA</span>
                    </div>
                  )}
                  {product.FreeShipping === "1" && (
                    <div className="free-shipping">
                      <span>📦 Free Shipping</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-details {
          padding: 2rem 0;
        }

        .loading-container,
        .error-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          text-align: center;
        }

        .loading-spinner {
          font-size: 1.2rem;
          color: #666;
        }

        .error-message {
          font-size: 1.2rem;
          color: #666;
          max-width: 600px;
          padding: 2rem;
        }

        .error-message a {
          color: #cc0000;
          text-decoration: underline;
        }

        .product-main-content {
          margin-top: 2rem;
        }

        .row {
          display: flex;
          flex-wrap: wrap;
          margin: -15px;
        }

        .col-md-6 {
          flex: 0 0 50%;
          max-width: 50%;
          padding: 15px;
        }

        .product-image-container {
          background: #f8f8f8;
          border-radius: 8px;
          padding: 1rem;
        }

        .product-image {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .product-info {
          padding: 1rem;
        }

        .product-title {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #333;
        }

        .product-meta {
          margin-bottom: 1rem;
          color: #666;
        }

        .product-price {
          font-size: 1.5rem;
          font-weight: 600;
          color: #cc0000;
          margin-bottom: 1.5rem;
        }

        .retail-price {
          text-decoration: line-through;
          color: #666;
          font-size: 1.2rem;
          margin-left: 1rem;
        }

        .product-description {
          margin-bottom: 1.5rem;
          color: #333;
        }

        .product-features {
          margin-bottom: 1.5rem;
        }

        .product-features h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .product-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .quantity-selector button {
          padding: 0.5rem 1rem;
          background: #f8f8f8;
          border: none;
          cursor: pointer;
        }

        .quantity-selector input {
          width: 60px;
          text-align: center;
          border: none;
          padding: 0.5rem;
        }

        .add-to-cart-btn {
          padding: 0.8rem 2rem;
          background: #cc0000;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .add-to-cart-btn:hover {
          background: #990000;
        }

        .product-options {
          margin-bottom: 1.5rem;
        }

        .color-options {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .color-option {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid #ddd;
          cursor: pointer;
        }

        .color-option.black {
          background: #000;
        }

        .color-option.red {
          background: #cc0000;
        }

        .product-meta-info {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eee;
        }

        .made-in-usa,
        .free-shipping {
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .col-md-6 {
            flex: 0 0 100%;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
