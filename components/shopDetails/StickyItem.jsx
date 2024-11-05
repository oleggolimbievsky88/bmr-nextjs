"use client";
import { colors, options } from "@/data/singleProductOptions";
import Image from "next/image";
import React from "react";
import Quantity from "./Quantity";
import { products4 } from "@/data/products";
import { useContextElement } from "@/context/Context";

export default function StickyItem({ product, soldOut = false }) {
  const { addProductToCart, isAddedToCartProducts } = useContextElement();

  const productImageSrc = product?.ImageLarge
    ? `https://bmrsuspension.com/siteart/products/${product?.ImageLarge}`
    : "/default-product-image.jpg"; // Default image path in /public folder
  return (
    <div className="tf-sticky-btn-atc">
      <div className="container">
        <div className="tf-height-observer w-100 d-flex align-items-center">
          <div className="tf-sticky-atc-product d-flex align-items-center">
            <div className="tf-sticky-atc-img">
              <Image
                className="lazyloaded"
                alt={product?.ProductName || "Product image"} // Use product name as alt text or a default value
                src={productImageSrc} // Use fallback if ImageLarge is undefined
                width={770}
                height={1075}
              />
            </div>
            <div className="tf-sticky-atc-title fw-5 d-xl-block d-none">
              {product?.ProductName || "Product Name"}
            </div>
          </div>
          <div className="tf-sticky-atc-infos">
            <form onSubmit={(e) => e.preventDefault()} className="">
              <div className="tf-sticky-atc-variant-price text-center">
                <select className="tf-select">
                  {colors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="tf-sticky-atc-btns">
                <div className="tf-product-info-quantity">
                  <Quantity />
                </div>
                {soldOut ? (
                  <a className="tf-btn btns-sold-out cursor-not-allowed btn-fill radius-3 justify-content-center fw-6 fs-14 flex-grow-1 animate-hover-btn ">
                    <span>Sold out</span>
                  </a>
                ) : (
                  <a
                    onClick={() => addProductToCart(product?.ProductID)}
                    className="tf-btn btn-fill radius-3 justify-content-center fw-6 fs-14 flex-grow-1 animate-hover-btn"
                  >
                    <span>
                      {isAddedToCartProducts(product?.ProductID)
                        ? "Already Added"
                        : "Add to cart"}
                    </span>
                  </a>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
