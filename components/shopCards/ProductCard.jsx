/**
 * Component for displaying a product card.
 * Shows a product card with a image, title, price, and color swatches.
 * Uses the same layout as the main category page but with the category name in the title.
 */
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import CountdownComponent from "../common/Countdown";
import { getProductImageUrl } from "@/lib/assets";
import { parsePrice } from "@/lib/display";

const PLACEHOLDER_PRODUCT = "/brands/bmr/images/placeholder-product.jpg";

export const ProductCard = ({
  product,
  colorsMap = {},
  cardClassName = "",
}) => {
  const [currentImage, setCurrentImage] = useState(product.imgSrc);
  const [imageSrc, setImageSrc] = useState(() => {
    const url =
      product.ImageSmall && product.ImageSmall !== "0"
        ? getProductImageUrl(product.ImageSmall)
        : getProductImageUrl("noimage.jpg");
    return url && url.trim() ? url : PLACEHOLDER_PRODUCT;
  });
  const { setQuickViewItem } = useContextElement();

  // Debug logging
  // console.log("ProductCard received product:", product);
  // console.log("ProductCard PartNumber:", product?.PartNumber);
  // console.log("ProductCard Price:", product?.Price);

  useEffect(() => {
    setCurrentImage(product.imgSrc);
    const url =
      product.ImageSmall && product.ImageSmall !== "0"
        ? getProductImageUrl(product.ImageSmall)
        : getProductImageUrl("noimage.jpg");
    setImageSrc(url && url.trim() ? url : PLACEHOLDER_PRODUCT);
  }, [product]);

  // Color swatch logic
  const colorIds = product.Color ? product.Color.split(",") : [];
  // console.log("Color IDs", colorIds);
  const productColors = colorIds.map((id) => colorsMap[id]).filter(Boolean);

  // console.log("Product Colors", productColors);

  return (
    <Link
      href={`/product/${product.ProductID}`}
      className={`bm-card card-product modern-pcard fl-item ${cardClassName}`.trim()}
      key={product.ProductID}
    >
      <div className="bm-card__img pcard-img card-product-wrapper">
        <div className="product-img">
          <Image
            className="lazyload img-product"
            src={imageSrc && imageSrc.trim() ? imageSrc : PLACEHOLDER_PRODUCT}
            alt={product.ProductName || "Product image"}
            width={720}
            height={1005}
            onError={() => setImageSrc(PLACEHOLDER_PRODUCT)}
          />
        </div>
      </div>
      <div className="bm-card__body pcard-body card-product-info">
        <div className="bm-card__title pcard-title product-title">
          {product.ProductName}
        </div>
        <div className="bm-card__meta pcard-meta">
          Part Number: {product.PartNumber}
        </div>
        {product.PlatformName && (
          <div
            className="bm-card__meta"
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
        <div className="bm-card__row pcard-priceRow">
          <span className="bm-card__price pcard-price price">
            $
            {product.Price != null && product.Price !== ""
              ? parsePrice(product.Price).toFixed(2)
              : "0.00"}
          </span>
          {productColors.length > 0 ? (
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
          ) : null}
        </div>
      </div>
    </Link>
  );
};
