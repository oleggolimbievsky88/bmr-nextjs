"use client";
import { useState } from "react";
import React from "react";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
export default function ProductCaed16({ product }) {
  const [currentImage, setCurrentImage] = useState(product.imgSrc);
  const { setQuickViewItem } = useContextElement();
  const {
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();
  return (
    <div className="card-product">
      <div className="card-product-wrapper">
        <Link href={`/product-detail/${product.id}`} className="product-img">
          <Image
            className="lazyload img-product"
            src={currentImage}
            alt="image-product"
            width={533}
            height={533}
          />
          <Image
            className="lazyload img-hover"
            data-src={product.imgHoverSrc}
            alt="image-product"
            src={product.imgHoverSrc}
            width={533}
            height={533}
          />
        </Link>
        
      </div>
      <div className="card-product-info text-center">
        <Link
          href={`/product-detail/${product.id}`}
          className="title link fw-8 fs-14"
        >
          {product.title}
        </Link>
        <span className="price">${product.price.toFixed(2)}</span>
        {product.colors.length > 0 && (
          <ul className="list-color-product justify-content-center">
            {product.colors.map((color, i) => (
              <li
                className={`list-color-item color-swatch ${
                  currentImage == color.imgSrc ? "active" : ""
                } `}
                onMouseOver={() => setCurrentImage(color.imgSrc)}
                key={i}
              >
                <span className="tooltip">{color.name}</span>
                <span className={`swatch-value ${color.colorClass}`} />
                <Image
                  className="lazyload"
                  data-src={color.imgSrc}
                  alt="image-product"
                  src={color.imgSrc}
                  width={533}
                  height={533}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
