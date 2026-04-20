export const VENDOR_BRANDS = {
  bmr: {
    key: "bmr",
    name: "BMR Suspension",
    hostnames: ["vendors.bmrsuspension.com"],
    logoPath: "/brands/bmr/images/logo/BMR-Logo-White.png",
    r2PrefixEnv: "VENDOR_R2_PREFIX_BMR",
    defaultR2Prefix: "bmr/",
  },
  controlfreak: {
    key: "controlfreak",
    name: "Control Freak Suspension",
    hostnames: ["vendors.controlfreaksuspension.com"],
    logoPath: "/brands/controlfreak/images/logo/ControlFreakSuspensionLogo.png",
    r2PrefixEnv: "VENDOR_R2_PREFIX_CONTROLFREAK",
    defaultR2Prefix: "controlfreak/",
  },
  heidts: {
    key: "heidts",
    name: "Heidts Suspension",
    hostnames: ["vendors.heidts.com"],
    logoPath: "/brands/heidts/images/logo/HEIDTS_logo.png",
    r2PrefixEnv: "VENDOR_R2_PREFIX_HEIDTS",
    defaultR2Prefix: "heidts/",
  },
};

export function getVendorBrandFromHost(host) {
  const hostname = String(host || "")
    .split(":")[0]
    .trim()
    .toLowerCase();

  for (const brand of Object.values(VENDOR_BRANDS)) {
    if (brand.hostnames.includes(hostname)) return brand;
  }

  // Local dev / unknown host fallback
  const fallback = (process.env.DEFAULT_VENDOR_BRAND || "bmr")
    .trim()
    .toLowerCase();
  return VENDOR_BRANDS[fallback] || VENDOR_BRANDS.bmr;
}

export function getVendorBrandPublicSiteUrl(brandOrKey) {
  const brand =
    typeof brandOrKey === "string"
      ? VENDOR_BRANDS[brandOrKey]
      : brandOrKey || null;
  const hostname = String(brand?.hostnames?.[0] || "")
    .trim()
    .toLowerCase();
  if (!hostname) return "/";

  const base = hostname.replace(/^vendors\./, "");
  return `https://${base}/`;
}

export function getBrandR2Prefix(brandKey) {
  const brand = VENDOR_BRANDS[brandKey] || VENDOR_BRANDS.bmr;
  const raw = (process.env[brand.r2PrefixEnv] || brand.defaultR2Prefix || "")
    .trim()
    .replace(/^\/+/, "");
  return raw && raw.endsWith("/") ? raw : `${raw}/`;
}
