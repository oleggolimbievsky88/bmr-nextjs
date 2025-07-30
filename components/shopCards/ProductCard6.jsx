"use client";
import { useState } from "react";
import React from "react";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
export default function ProductCard6({ product }) {
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
    <div
      className={`card-product style-price radius-20 ${
        product.populer ? "bg_black " : ""
      }`}
    >
      <div className="card-product-wrapper">
        <Link href={`/product-detail/${product.id}`} className="product-img">
          {currentImage && (
            <Image
              className="lazyload img-product"
              src={currentImage}
              alt="image-product"
              width={533}
              height={399}
            />
          )}
          {product.imgHoverSrc && (
            <Image
              className="lazyload img-hover"
              src={product.imgHoverSrc}
              alt="image-product"
              width={533}
              height={399}
            />
          )}
        </Link>

        <div className="on-sale-wrap text-end">
          <div
            className={`on-sale-item
              ${product.populer ? "best-seller" : ""}
              ${product.new ? "new" : ""}
              ${product.recommend ? "recommend" : ""}
            `}
          >
            {" "}
            {product.populer ? "Best Seller !" : ""}
            {product.recommend ? "Recommend !" : ""}
            {product.new ? "New !" : ""}
          </div>
        </div>
      </div>
      <div className="card-product-info">
        <Link href={`/shop-collection-list`} className="vendor fw-7 link">
          {product.vendor}
        </Link>
        <Link
          href={`/product-detail/${product.id}`}
          className="title fw-7 link"
        >
          {product.title}
        </Link>
        <ul className="list-color-product">
          {product.colors?.map((color, idx) => (
            <li
              key={idx}
              className={`list-color-item color-swatch ${
                currentImage == color.image ? "active" : ""
              }  `}
              onMouseOver={() => setCurrentImage(color.image)}
            >
              <span className="tooltip">{color.color}</span>
              <span className={`swatch-value ${color.bgColor}`} />
              {color.image && (
                <Image
                  className="lazyload"
                  data-src={color.image}
                  src={color.image}
                  alt="image-product"
                  width={533}
                  height={399}
                />
              )}
            </li>
          ))}
        </ul>
        <div className="price">${product.price.toFixed(2)}</div>
      </div>
      <div className="tf-price-table-contents">
        <ul>
          {product.description?.map((feature, idx) => (
            <li key={idx} className="fw-5 fs-16">
              <i className="icon icon-check" /> {feature}
            </li>
          ))}
        </ul>
        <div className="tf-price-table-btn text-center">
          <Link
            href={`/product-detail/${product.id}`}
            className={`tf-btn btn-md  rounded-full ${
              product.populer ? "btn-light-icon" : "btn-fill btn-icon"
            }  animate-hover-btn`}
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}
