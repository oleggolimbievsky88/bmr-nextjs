"use client";

import ProductSkeleton from "@/components/ui/ProductSkeleton";

export default function Loading() {
  return (
    <div className="container py-5">
      <div
        style={{
          height: "32px",
          width: "200px",
          backgroundColor: "#e0e0e0",
          margin: "0 auto 40px",
          borderRadius: "4px",
        }}
      ></div>
      <ProductSkeleton count={12} />
    </div>
  );
}
