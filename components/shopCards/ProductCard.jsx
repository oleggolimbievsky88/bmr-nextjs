"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProductImageUrl } from "@/lib/assets";
import { parsePrice } from "@/lib/display";

const PLACEHOLDER_PRODUCT = "/brands/bmr/images/placeholder-product.jpg";

export const ProductCard = ({
  product,
  colorsMap = {},
  cardClassName = "",
}) => {
  const [imageSrc, setImageSrc] = useState(() => {
    const url =
      product.ImageSmall && product.ImageSmall !== "0"
        ? getProductImageUrl(product.ImageSmall)
        : getProductImageUrl("noimage.jpg");
    return url && url.trim() ? url : PLACEHOLDER_PRODUCT;
  });

  useEffect(() => {
    const url =
      product.ImageSmall && product.ImageSmall !== "0"
        ? getProductImageUrl(product.ImageSmall)
        : getProductImageUrl("noimage.jpg");
    setImageSrc(url && url.trim() ? url : PLACEHOLDER_PRODUCT);
  }, [product]);

  const colorIds = product.Color ? product.Color.split(",") : [];
  const productColors = colorIds.map((id) => colorsMap[id]).filter(Boolean);

  const fitmentStart =
    product.PlatformStartYear ||
    product.platformStartYear ||
    product.platform_start_year;

  const fitmentEnd =
    product.PlatformEndYear ||
    product.platformEndYear ||
    product.platform_end_year;

  const fitmentLabel =
    fitmentStart && fitmentEnd ? `Fits: ${fitmentStart}-${fitmentEnd}` : null;

  return (
    <Link
      href={`/product/${product.ProductID}`}
      className={`bm-card card-product modern-pcard fl-item ${cardClassName}`.trim()}
    >
      <div className="bm-card__img pcard-img card-product-wrapper">
        <div className="product-img">
          <Image
            className="lazyload img-product"
            src={imageSrc && imageSrc.trim() ? imageSrc : PLACEHOLDER_PRODUCT}
            alt={product.ProductName || "Product image"}
            width={720}
            height={720}
            onError={() => setImageSrc(PLACEHOLDER_PRODUCT)}
          />
        </div>
      </div>

      <div className="bm-card__body pcard-body card-product-info">
        <div className="bm-card__title pcard-title product-title">
          {product.ProductName}
        </div>

        {fitmentLabel && <div className="bm-fitmentBadge">{fitmentLabel}</div>}

        <div className="bm-card__meta pcard-meta">
          Part Number: {product.PartNumber}
        </div>

        <div className="bm-card__footer">
          <span className="bm-card__price pcard-price price">
            $
            {product.Price != null && product.Price !== ""
              ? parsePrice(product.Price).toFixed(2)
              : "0.00"}
          </span>

          {productColors.length > 0 ? (
            <div
              className="bm-card__swatches"
              onClick={(e) => e.stopPropagation()}
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
                    className="bm-card__swatch"
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
