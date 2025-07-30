"use client";
import { useEffect, useState } from "react";
import React from "react";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
export default function ProductCard14({ product }) {
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
            data-src={product.imgSrc}
            alt={product.title}
            src={currentImage}
            width={360}
            height={270}
          />
          <Image
            className="lazyload img-hover"
            data-src={product.imgHoverSrc}
            alt={product.title}
            src={product.imgHoverSrc}
            width={360}
            height={270}
          />
        </Link>
        
      </div>
      <div className="card-product-info">
        <Link href={`/product-detail/${product.id}`} className="title link">
          {product.title}
        </Link>
        <span className="price">${product.price.toFixed(2)}</span>
        {product.colors && (
          <ul className="list-color-product">
            {product?.colors.map((color, colorIndex) => (
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
                  data-src={color.imgSrc}
                  alt={color.name}
                  src={color.imgSrc}
                  width={360}
                  height={270}
                />
              </li>
            ))}
          </ul>
        )}
        {product.onSale && (
          <div className="on-sale-wrap text-end">
            <div className="on-sale-item">Sale</div>
          </div>
        )}
      </div>
    </div>
  );
}
