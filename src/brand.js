import { brands } from "@bmr/core/brand";
import { getBrandKey, getBrandConfig } from "@/lib/brand";

/**
 * Resolve brand key from env: NEXT_PUBLIC_BRAND then BRAND, default "bmr".
 */
export function getBrand() {
  const key = getBrandKey();
  const brand = brands[key];
  const base = brand || brands.bmr;
  const config = getBrandConfig();
  return {
    ...base,
    key,
    logo: {
      ...base.logo,
      headerPath: config.logoPath,
      footerPath: config.logoPath,
      ...(config.logoHeaderMaxSize && {
        headerMaxSize: config.logoHeaderMaxSize,
      }),
      ...(config.logoFooterMaxSize && {
        footerMaxSize: config.logoFooterMaxSize,
      }),
      alt: base.logo?.alt || `${base.companyName} Logo`,
    },
    defaultOgImagePath: config.ogImagePath,
  };
}

export const brand = getBrand();
