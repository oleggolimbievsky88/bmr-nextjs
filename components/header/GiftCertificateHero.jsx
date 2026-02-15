import React from "react";
import { getProductImageUrl } from "@/lib/assets";

export default function GiftCertificateHero({ product }) {
  const heroImageUrl =
    product?.ImageLarge || product?.ImageSmall
      ? getProductImageUrl(product.ImageLarge || product.ImageSmall)
      : null;

  return (
    <header className="gift-cards-hero gift-cards-hero-product">
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
        <h1 className="gift-cards-hero-title">
          {product?.ProductName || "Gift Certificate"}
        </h1>
        <p className="gift-cards-hero-tagline">
          Give the gift of better handling
        </p>
      </div>
    </header>
  );
}
