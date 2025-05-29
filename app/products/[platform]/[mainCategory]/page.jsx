"use client";

import { useEffect, useState } from "react";
import CategoryGrid from "@/components/shop/CategoryGrid";
import ProductGrid from "@/components/shop/ProductGrid";
import PlatformHeader from "@/components/header/PlatformHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ShopSidebarleft from "@/components/shop/ShopSidebarleft";

async function fetchCategories(category) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/by-main-category?mainCatId=${category.mainCatId}`
  );
  return res.json();
}

async function fetchProducts(platformId, category) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/by-platform-main-category?platformId=${platformId}&mainCatId=${category.mainCatId}`
  );
  return res.json();
}
