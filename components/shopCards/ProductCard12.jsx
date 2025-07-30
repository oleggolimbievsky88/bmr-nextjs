"use client";
import { useState } from "react";
import React from "react";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
export default function ProductCard12({ product }) {
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
            data-src={product.imgSrc}
            alt="image-product"
            src={currentImage}
            width={360}
            height={334}
          />
          <Image
            className="lazyload img-hover"
            data-src={product.imgHoverSrc}
            alt="image-product"
            src={product.imgHoverSrc}
            width={360}
            height={334}
          />
        </Link>
        
        <div className="on-sale-wrap text-end">
          <div className="on-sale-item">Sale</div>
        </div>
      </div>
      <div className="card-product-info text-center">
        <Link href={`/product-detail/${product.id}`} className="title link">
          {product.title}
        </Link>
        <span className="price">
          {product.oldPrice && (
            <span className="old-price">{product.oldPrice}</span>
          )}
          <span className="new-price">${product.price.toFixed(2)}</span>
        </span>
        <ul className="list-color-product justify-content-center">
          {product.colors?.map((color, i) => (
            <li
              key={i}
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
                width={360}
                height={334}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
