"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import CountdownComponent from "../common/Countdown";
export const ProductCardWishlist = ({ product }) => {
  const [currentImage, setCurrentImage] = useState(product.imgSrc);
  const { setQuickViewItem } = useContextElement();
  const {
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    removeFromWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();

  return (
    <div className="card-product fl-item" key={product.id}>
      <div className="card-product-wrapper">
        <Link href={`/product-detail/${product.id}`} className="product-img">
          {currentImage && (
            <Image
              className="lazyload img-product"
              data-src={product.imgSrc}
              src={currentImage}
              alt="image-product"
              width={720}
              height={1005}
            />
          )}
          {(product.imgHoverSrc || product.imgSrc) && (
            <Image
              className="lazyload img-hover"
              data-src={
                product.imgHoverSrc ? product.imgHoverSrc : product.imgSrc
              }
              src={product.imgHoverSrc ? product.imgHoverSrc : product.imgSrc}
              alt="image-product"
              width={720}
              height={1005}
            />
          )}
        </Link>
        

        
        {product.countdown && (
          <div className="countdown-box">
            <div className="js-countdown">
              <CountdownComponent />
            </div>
          </div>
        )}
        {product.sizes && (
          <div className="size-list">
            {product.sizes.map((size) => (
              <span key={size}>{size}</span>
            ))}
          </div>
        )}
      </div>
      <div className="card-product-info">
        <Link href={`/product-detail/${product.id}`} className="title link">
          {product.title}
        </Link>
        <span className="price">${product.price.toFixed(2)}</span>
        {product.colors && (
          <ul className="list-color-product">
            {product.colors.map((color) => (
              <li
                className={`list-color-item color-swatch ${
                  currentImage == color.imgSrc ? "active" : ""
                } `}
                key={color.name}
                onMouseOver={() => setCurrentImage(color.imgSrc)}
              >
                <span className="tooltip">{color.name}</span>
                <span className={`swatch-value ${color.colorClass}`} />
                {color.imgSrc && (
                  <Image
                    className="lazyload"
                    data-src={color.imgSrc}
                    src={color.imgSrc}
                    alt="image-product"
                    width={720}
                    height={1005}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
