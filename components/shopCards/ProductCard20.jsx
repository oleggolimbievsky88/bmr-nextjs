"use client";
import { useState } from "react";
import React from "react";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
export default function ProductCard20({ product }) {
  const [currentImage, setCurrentImage] = useState(product.imgSrc);
  const {
    setQuickViewItem,
    addProductToCart,
    isAddedToCartProducts,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();
  return (
    <div className="card-product">
      <div className="card-product-wrapper rounded-0">
        <Link href={`/product-detail/${product.id}`} className="product-img">
          <Image
            className="lazyload img-product"
            data-src={product.imgSrc}
            alt={product.alt}
            src={currentImage}
            width={360}
            height={360}
          />
          <Image
            className="lazyload img-hover"
            data-src={product.imgHoverSrc}
            alt={product.alt}
            src={product.imgHoverSrc}
            width={360}
            height={360}
          />
        </Link>
        
        <div className="on-sale-wrap text-end">
          <div className="on-sale-item">-1%</div>
        </div>
      </div>
      <div className="card-product-info">
        <Link
          href={`/product-detail/${product.id}`}
          className="title link fw-8"
        >
          {product.title}
        </Link>
        <span className="price fw-6">${product.price.toFixed(2)}</span>
        <ul className="list-color-product">
          {product.colors.map((color, index) => (
            <li
              key={index}
              className={`list-color-item color-swatch ${
                currentImage == color.imgSrc ? "active" : ""
              }  `}
              onMouseOver={() => setCurrentImage(color.imgSrc)}
            >
              <span className="tooltip">{color.tooltip}</span>
              <span className={`swatch-value ${color.colorClass}`} />
              <Image
                className="lazyload"
                data-src={color.imgSrc}
                alt={product.alt}
                src={color.imgSrc}
                width={360}
                height={360}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
