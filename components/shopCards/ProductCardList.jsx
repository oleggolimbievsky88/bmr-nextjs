"use client";
import { useState } from "react";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import { getProductImageUrl } from "@/lib/assets";

const PLACEHOLDER_PRODUCT = "/brands/bmr/images/placeholder-product.jpg";

export default function ProductCardList({ product, colorsMap = {} }) {
  const {
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();
  const [imageSrc, setImageSrc] = useState(() =>
    product.ImageSmall
      ? getProductImageUrl(product.ImageSmall)
      : getProductImageUrl("noimage.jpg"),
  );
  const shortDescription =
    product.Description && product.Description.length > 200
      ? product.Description.slice(0, 200) + "..."
      : product.Description;
  const colorIds = product.Color ? product.Color.split(",") : [];
  const productColors = colorIds.map((id) => colorsMap[id]).filter(Boolean);
  return (
    <div className="card-product list-layout">
      <div className="card-product-wrapper">
        <Link href={`/product/${product.ProductID}`} className="product-img">
          <Image
            className="lazyload img-product"
            src={imageSrc}
            alt={product.ProductName || "Product image"}
            width={720}
            height={1005}
            onError={() => setImageSrc(PLACEHOLDER_PRODUCT)}
          />
        </Link>
      </div>
      <div className="card-product-info">
        <Link href={`/product/${product.ProductID}`} className="title link">
          <span style={{ fontWeight: "bold", paddingTop: "10px" }}>
            {product.ProductName}
          </span>
        </Link>
        <div
          style={{
            color: "#888",
            fontSize: "0.95em",
            margin: "0px",
            lineHeight: 1,
          }}
        >
          Part Number: {product.PartNumber}
        </div>
        <span className="price">${parseFloat(product.Price).toFixed(2)}</span>
        {shortDescription && <p className="description">{shortDescription}</p>}
        {productColors.length > 0 && (
          <div className="list-color-product">
            {productColors.map((color) => (
              <span key={color.ColorID} title={color.ColorName}>
                <img
                  src={`/images/colors/${color.ColorImg}`}
                  alt={color.ColorName}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "15%",
                    border: "1px solid #ccc",
                    marginRight: 4,
                  }}
                />
              </span>
            ))}
          </div>
        )}
        {product.sizes && (
          <div className="size-list">
            {product.sizes.map((size) => (
              <span key={size}>{size}</span>
            ))}
          </div>
        )}
        <Link
          href={`/product/${product.ProductID}`}
          className="btn btn-outline-danger btn-view-more-details mt-2"
          style={{ alignSelf: "flex-start" }}
        >
          View details
        </Link>
      </div>
    </div>
  );
}
