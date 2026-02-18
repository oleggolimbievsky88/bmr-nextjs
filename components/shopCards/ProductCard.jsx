"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import CountdownComponent from "../common/Countdown";
import { getProductImageUrl } from "@/lib/assets";
export const ProductCard = ({
  product,
  colorsMap = {},
  cardClassName = "",
}) => {
  const [currentImage, setCurrentImage] = useState(product.imgSrc);
  const { setQuickViewItem } = useContextElement();

  // Debug logging
  // console.log("ProductCard received product:", product);
  // console.log("ProductCard PartNumber:", product?.PartNumber);
  // console.log("ProductCard Price:", product?.Price);

  useEffect(() => {
    setCurrentImage(product.imgSrc);
  }, [product]);

  const imageSrc = product.ImageSmall
    ? getProductImageUrl(product.ImageSmall)
    : getProductImageUrl("noimage.jpg");

  // Color swatch logic
  const colorIds = product.Color ? product.Color.split(",") : [];
  // console.log("Color IDs", colorIds);
  const productColors = colorIds.map((id) => colorsMap[id]).filter(Boolean);

  // console.log("Product Colors", productColors);

  return (
    <Link
      href={`/product/${product.ProductID}`}
      className={`card-product fl-item ${cardClassName}`.trim()}
      key={product.ProductID}
      style={{
        textDecoration: "none",
        color: "inherit",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        minHeight: 220,
        borderRadius: "8px",
      }}
    >
      <div className="card-product-wrapper">
        <div className="product-img">
          <Image
            className="lazyload img-product"
            src={imageSrc}
            alt={product.ProductName || "Product image"}
            width={720}
            height={1005}
          />
        </div>
      </div>
      <div
        className="card-product-info"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          borderRadius: "8px",
        }}
      >
        <span
          className="product-title"
          style={{ fontWeight: "bold", color: "#222", fontSize: "1rem" }}
        >
          {product.ProductName}
        </span>
        <div
          style={{
            color: "#202020",
            fontSize: "0.95em",
            margin: "2px 0 2px 0",
            lineHeight: 1,
          }}
        >
          Part Number: {product.PartNumber}
        </div>
        {product.PlatformName && (
          <div
            style={{
              color: "#333",
              fontSize: "0.85em",
              margin: "2px 0 2px 0",
              lineHeight: 1,
              fontWeight: "500",
              paddingLeft: 8,
              borderLeft: "2px solid var(--primary)",
            }}
          >
            {product.PlatformStartYear && product.PlatformEndYear
              ? `${product.PlatformStartYear}-${product.PlatformEndYear} ${product.PlatformName}`
              : product.PlatformName}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 2,
            justifyContent: "space-between",
          }}
        >
          <span
            className="price"
            style={{
              color: "#1a1a1a",
              fontWeight: 600,
              fontSize: "1.1em",
              marginBottom: 0,
            }}
          >
            ${product.Price ? parseFloat(product.Price).toFixed(2) : "0.00"}
          </span>
          {productColors.length > 0 && (
            <div
              className="list-color-product"
              onClick={(e) => e.stopPropagation()}
              style={{
                pointerEvents: "auto",
                display: "flex",
                gap: 4,
                background: "rgba(255,255,255,0.95)",
                padding: "2px 4px",
                borderRadius: 6,
              }}
            >
              {productColors.map((color) => (
                <span key={color.ColorID} title={color.ColorName}>
                  <img
                    src={
                      color.ColorImgLarge
                        ? `/images/colors/${color.ColorImgLarge}`
                        : `/images/colors/${color.ColorImg}`
                    }
                    alt={color.ColorName}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: "1px solid #ccc",
                      background: "#fff",
                      display: "block",
                    }}
                  />
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
