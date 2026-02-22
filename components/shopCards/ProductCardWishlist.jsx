"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import CountdownComponent from "../common/Countdown";
import { getProductImageUrl } from "@/lib/assets";
import { parsePrice } from "@/lib/display";

function getProductDisplay(product) {
  const id = product.ProductID ?? product.id;
  const imgSrc =
    product.imgSrc ||
    (product.ImageLarge || product.ImageSmall
      ? getProductImageUrl(product.ImageLarge || product.ImageSmall)
      : "");
  const imgHoverSrc =
    product.imgHoverSrc ||
    (product.ImageSmall ? getProductImageUrl(product.ImageSmall) : imgSrc);
  const title = product.ProductName ?? product.title ?? "";
  const price =
    product.Price != null && product.Price !== ""
      ? parsePrice(product.Price).toFixed(2)
      : product.price != null
        ? parsePrice(product.price).toFixed(2)
        : "0.00";
  return { id, imgSrc, imgHoverSrc, title, price };
}

export const ProductCardWishlist = ({ product }) => {
  const d = getProductDisplay(product);
  const [currentImage, setCurrentImage] = useState(d.imgSrc);
  const { addToWishlist } = useContextElement();

  return (
    <div className="card-product fl-item" key={d.id}>
      <div className="card-product-wrapper">
        <Link href={`/product/${d.id}`} className="product-img">
          {d.imgSrc && (
            <Image
              className="lazyload img-product"
              data-src={d.imgSrc}
              src={currentImage || d.imgSrc}
              alt={d.title}
              width={720}
              height={1005}
            />
          )}
          {(d.imgHoverSrc || d.imgSrc) && d.imgHoverSrc !== d.imgSrc && (
            <Image
              className="lazyload img-hover"
              data-src={d.imgHoverSrc}
              src={d.imgHoverSrc}
              alt=""
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
        <Link href={`/product/${d.id}`} className="title link">
          {d.title}
        </Link>
        <span className="price">${d.price}</span>
        <button
          type="button"
          onClick={() => addToWishlist(d.id)}
          className="btn btn-sm btn-outline-secondary mt-2"
          aria-label="Remove from wishlist"
        >
          Remove
        </button>
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
