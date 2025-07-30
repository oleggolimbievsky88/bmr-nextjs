"use client";
import { useState } from "react";
import React from "react";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
export default function ProductCard9({ product }) {
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
    <div className="card-product style-line-hover">
      <div className="card-product-wrapper">
        <Link href={`/product-detail/${product.id}`} className="product-img">
          <Image
            className="lazyload img-product"
            data-src={product.imgSrc}
            alt="image-product"
            src={currentImage}
            width={360}
            height={470}
          />
          <Image
            className="lazyload img-hover"
            data-src={product.imgHoverSrc}
            alt="image-product"
            src={product.imgHoverSrc}
            width={360}
            height={470}
          />
        </Link>
        
      </div>
      <div className="card-product-info">
        <Link
          href={`/product-detail/${product.id}`}
          className="title link fs-14 fw-7 text-uppercase"
        >
          {product.title}
        </Link>
        <span className="price">${product.price.toFixed(2)}</span>
        {product.colors?.length > 0 && (
          <ul className="list-color-product">
            {product.colors.map((color, colorIndex) => (
              <li
                key={colorIndex}
                className={`list-color-item color-swatch ${
                  currentImage == color.imgSrc ? "active" : ""
                }  `}
                onMouseOver={() => setCurrentImage(color.imgSrc)}
              >
                <span className="tooltip">
                  {color.tooltip ? color.tooltip : color.name}
                </span>
                <span className={`swatch-value ${color.colorClass}`} />
                {color.imgSrc && (
                  <Image
                    className="lazyload"
                    data-src={color.imgSrc}
                    alt="image-product"
                    src={color.imgSrc}
                    width={360}
                    height={470}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
