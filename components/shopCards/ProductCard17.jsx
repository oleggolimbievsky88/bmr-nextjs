"use client";
import { useState } from "react";
import React from "react";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
export default function ProductCard17({ product }) {
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
    <div key={product.id} className="card-product type-line-padding">
      <div className="card-product-wrapper">
        <Link href={`/product-detail/${product.id}`} className="product-img">
          <Image
            className="lazyload img-product"
            data-src={product.imgSrc}
            alt="image-product"
            src={currentImage}
            width={668}
            height={707}
          />
          <Image
            className="lazyload img-hover"
            data-src={product.imgHoverSrc}
            alt="image-product"
            src={product.imgHoverSrc}
            width={668}
            height={707}
          />
        </Link>
        
      </div>
      <div className="card-product-info">
        <Link
          href={`/product-detail/${product.id}`}
          className="title link fw-7 fs-14"
        >
          {product.title}
        </Link>
        <span className="price">${product.price.toFixed(2)}</span>
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
                data-src={color.imgSrc}
                alt="image-product"
                src={color.imgSrc}
                width={668}
                height={707}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
