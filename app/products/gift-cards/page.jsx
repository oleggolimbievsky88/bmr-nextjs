"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProductImageUrl } from "@/lib/assets";

export default function GiftCardsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const heroImageUrl =
    products.length > 0
      ? getProductImageUrl(
          products[0].ImageLarge || products[0].ImageSmall || "noimage.jpg",
        )
      : null;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const productsRes = await fetch(
          "/api/products/gift-certificates?limit=50",
        );
        const productsData = await productsRes.json();
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        console.error("Error fetching gift certificates:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="gift-cards-page">
      <header className="gift-cards-hero">
        {heroImageUrl && (
          <div
            className="gift-cards-hero-bg"
            style={{ backgroundImage: `url(${heroImageUrl})` }}
            aria-hidden="true"
          />
        )}
        <div className="gift-cards-hero-overlay" />
        <div className="gift-cards-hero-inner">
          <span className="gift-cards-hero-badge">BMR Gift Certificates</span>
          <h1 className="gift-cards-hero-title">Gift Cards</h1>
          <p className="gift-cards-hero-tagline">
            Give the gift of better handling
          </p>
        </div>
      </header>

      <section className="gift-cards-content">
        <div className="gift-cards-container">
          {isLoading ? (
            <div className="gift-cards-loading">
              <div className="gift-cards-spinner" />
              <span>Loading gift certificates...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="gift-cards-empty">
              <h3>No gift cards available</h3>
              <p>Check back soon for BMR Suspension gift certificates.</p>
            </div>
          ) : (
            <>
              <div className="gift-cards-intro">
                <h2 className="gift-cards-intro-title">Choose your amount</h2>
                <p className="gift-cards-intro-desc">
                  Select a certificate value below — perfect for the performance
                  enthusiast in your life.
                </p>
              </div>

              <div className="gift-cards-grid">
                {products.map((product) => (
                  <Link
                    key={product.ProductID}
                    href={`/product/${product.ProductID}`}
                    className="gift-card-item"
                  >
                    <div className="gift-card-image-wrap">
                      <Image
                        src={getProductImageUrl(
                          product.ImageSmall ||
                            product.ImageLarge ||
                            "noimage.jpg",
                        )}
                        alt={product.ProductName || "Gift certificate"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="gift-card-image"
                      />
                    </div>
                    <div className="gift-card-body">
                      <h3 className="gift-card-title">{product.ProductName}</h3>
                      <span className="gift-card-part">
                        Part #{product.PartNumber}
                      </span>
                      <span className="gift-card-price">
                        $
                        {product.Price
                          ? parseFloat(product.Price).toFixed(2)
                          : "0.00"}
                      </span>
                      <span className="gift-card-cta">View details</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
