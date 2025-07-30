"use client";
import { useState } from "react";
import React from "react";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
export default function ProductCard7({ product }) {
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
    <div className="card-product bg_white radius-20">
      <div className="card-product-wrapper">
        <Link href={`/product-detail/${product.id}`} className="product-img">
          <Image
            className="lazyload img-product"
            src={currentImage}
            alt="image-product"
            width={360}
            height={360}
          />
          <Image
            className="lazyload img-hover"
            src={product.imgHoverSrc}
            alt="image-product"
            width={360}
            height={360}
          />
        </Link>
        
        <div className="on-sale-wrap text-end">
          <div className="on-sale-item">Sale</div>
        </div>
      </div>
      <div className="card-product-info has-padding">
        <Link href={`/product-detail/${product.id}`} className="title link">
          {product.title}
        </Link>
        <span className="price">
          {product.originalPrice ? (
            <>
              <span className="fw-4 text-sale">{product.originalPrice}</span>
              <span className="text_primary">${product.price.toFixed(2)}</span>
            </>
          ) : (
            <>${product.price.toFixed(2)}</>
          )}
        </span>
        <ul className="list-color-product">
          {product.colors?.map((color, colorIndex) => (
            <li
              key={colorIndex}
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
                alt={`image-product-${color.name}`}
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
