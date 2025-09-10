"use client";
import { useContextElement } from "@/context/Context";

export default function CartCount() {
  const { cartProducts } = useContextElement();

  return <span>{cartProducts.length} ITEMS</span>;
}
