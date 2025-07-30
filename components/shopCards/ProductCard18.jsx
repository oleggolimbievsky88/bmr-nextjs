"use client";
import { useEffect, useState } from "react";
import React from "react";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
export default function ProductCard18({ product }) {
  const [currentImage, setCurrentImage] = useState(product.imgSrc);
  const { setQuickViewItem } = useContextElement();
  const {
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();
  useEffect(() => {
    setCurrentImage(product.imgSrc);
  }, [product]);

  return (
    <div className="card-product">
      <div className="card-product-wrapper">
        <Link href={`/product-detail/${product.id}`} className="product-img">
          <Image
            className="lazyload img-product"
            src={currentImage}
            alt="image-product"
            width={360}
            height={450}
          />
          <Image
            className="lazyload img-hover"
            src={product.imgHoverSrc}
            alt="image-product"
            width={360}
            height={450}
          />
        </Link>
        
        <div className="size-list">
          <span>S</span>
          <span>M</span>
          <span>L</span>
          <span>XL</span>
        </div>
      </div>
      <div className="card-product-info">
        <Link href={`/product-detail/${product.id}`} className="title link">
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
                src={color.imgSrc}
                alt="image-product"
                width={360}
                height={450}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
