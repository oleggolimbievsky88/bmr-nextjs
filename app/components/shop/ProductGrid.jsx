"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { parsePrice } from "@/lib/display";

const PLACEHOLDER_PRODUCT = "/brands/bmr/images/placeholder-product.jpg";

function ProductGridImage({ product }) {
  const [src, setSrc] = useState(
    product.ImageSmall
      ? `/images/products/${product.ImageSmall}`
      : "/images/placeholder.jpg",
  );
  return (
    <div className="relative h-48 w-full">
      <Image
        src={src}
        alt={product.ProductName}
        fill
        className="object-contain"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        onError={() => setSrc(PLACEHOLDER_PRODUCT)}
      />
    </div>
  );
}

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return <div className="text-center py-8">No products found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map(
        (product) => (
          console.log("product:", product),
          (
            <div
              key={product.ProductID}
              className="product-card bg-white rounded-lg shadow-md overflow-hidden"
            >
              <Link href={`/product/${product.ProductID}`}>
                <ProductGridImage product={product} />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                    {product.ProductName}
                  </h3>
                  <p className="text-gray-600 mb-2 line-clamp-2">
                    {product?.Description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">
                      ${parsePrice(product?.Price).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Part #: {product.PartNumber}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          )
        ),
      )}
    </div>
  );
}
