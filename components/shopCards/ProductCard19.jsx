"use client";
import { useState } from "react";
import React from "react";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
export default function ProductCard19({ product, white = true }) {
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
    <div className="card-product style-brown">
      <div className="card-product-wrapper rounded-0">
        <Link href={`/product-detail/${product.id}`} className="product-img">
          <Image
            className="lazyload img-product"
            src={currentImage}
            alt="image-product"
            width={720}
            height={1005}
          />
          <Image
            className="lazyload img-hover"
            src={product.imgHoverSrc}
            alt="image-product"
            width={720}
            height={1005}
          />
        </Link>
        
      </div>
      <div className="card-product-info">
        <Link
          href={`/product-detail/${product.id}`}
          className={`title link font-poppins ${white ? "text-white" : ""}`}
        >
          {product.title}
        </Link>
        <span className={`price font-poppins ${white ? "text-white" : ""}`}>
          ${product.price.toFixed(2)}
        </span>
        <ul className="list-color-product">
          {product.colors.map((color, index) => (
            <li
              key={index}
              className={`list-color-item color-swatch ${
                currentImage == color.imgSrc ? "active" : ""
              }  `}
              onMouseOver={() => setCurrentImage(color.imgSrc)}
            >
              <span className="tooltip">{color.name}</span>
              <span className={`swatch-value ${color.colorClass}`} />
              <Image
                className="lazyload"
                src={color.imgSrc}
                alt="image-product"
                width={720}
                height={1005}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
