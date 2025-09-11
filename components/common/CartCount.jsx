"use client";
import { useContextElement } from "@/context/Context";

export default function CartCount() {
  const { cartProducts } = useContextElement();

  return (
    <span>
      {cartProducts.length == 1
        ? cartProducts.length + " ITEM"
        : cartProducts.length + " ITEMS"}
    </span>
  );
}
