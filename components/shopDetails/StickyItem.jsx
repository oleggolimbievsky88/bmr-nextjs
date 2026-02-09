"use client";
import { options } from "@/data/singleProductOptions";
import Image from "next/image";
import React from "react";
import Quantity from "./Quantity";
import { useContextElement } from "@/context/Context";
import { getProductImageUrl } from "@/lib/assets";

export default function StickyItem({ soldOut = false, product }) {
  const { addProductToCart, isAddedToCartProducts } = useContextElement();

  if (!product) return null;

  return (
    <div className="tf-sticky-btn-atc">
      <div className="container">
        <div className="tf-height-observer w-100 d-flex align-items-center">
          <div className="tf-sticky-atc-product d-flex align-items-center">
            <div className="tf-sticky-atc-img">
              <Image
                className="lazyloaded"
                data-src={getProductImageUrl(product?.ImageLarge)}
                alt={product?.ProductName || "Product image"}
                src={getProductImageUrl(product?.ImageLarge)}
                width={770}
                height={1075}
                unoptimized={true}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getProductImageUrl("noimage.jpg");
                }}
              />
            </div>
            <div className="tf-sticky-atc-title fw-5 d-xl-block d-none">
              {product?.ProductName}
            </div>
          </div>
          <div className="tf-sticky-atc-infos">
            <form onSubmit={(e) => e.preventDefault()} className="">
              <div className="tf-sticky-atc-variant-price text-center">
                <select className="tf-select">
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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
                    onClick={() => addProductToCart(product.ProductID)}
                    className="tf-btn btn-fill radius-3 justify-content-center fw-6 fs-14 flex-grow-1 animate-hover-btn"
                  >
                    <span>
                      {isAddedToCartProducts(product.ProductID)
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
