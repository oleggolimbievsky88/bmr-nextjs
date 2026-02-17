"use client";

import React, { createContext, useContext, useMemo } from "react";
import { resolveAssetUrl } from "@bmr/core/brand";

const BrandContext = createContext(null);

export function BrandProvider({ brand, children }) {
  const value = useMemo(() => {
    if (!brand) return null;

    const assetsBaseUrl = brand.assetsBaseUrl || "";
    const headerLogoUrl = resolveAssetUrl({
      assetsBaseUrl,
      path: brand.logo?.headerPath,
    });
    const footerLogoUrl = resolveAssetUrl({
      assetsBaseUrl,
      path: brand.logo?.footerPath || brand.logo?.headerPath,
    });

    return {
      ...brand,
      assetsBaseUrl,
      logo: {
        ...brand.logo,
        headerUrl: headerLogoUrl,
        footerUrl: footerLogoUrl,
      },
    };
  }, [brand]);

  return (
    <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
  );
}

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) {
    throw new Error("useBrand() must be used inside <BrandProvider />");
  }
  return ctx;
}
