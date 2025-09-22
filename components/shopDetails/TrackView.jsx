"use client";

import { useEffect } from "react";
import { trackProductView } from "@/utlis/trackProductView";

export default function TrackView({ productId }) {
  useEffect(() => {
    if (!productId) return;
    trackProductView(productId);
  }, [productId]);

  return null;
}
