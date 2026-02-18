import { brands, getBrandKey } from "@bmr/core/brand";

/**
 * Resolve brand for the current env (NEXT_PUBLIC_BRAND / BRAND).
 */
export function getBrand() {
  const key = getBrandKey();
  const brand = brands[key];
  return brand || brands.bmr;
}

export const brand = getBrand();
