/**
 * Brand config and asset paths (namespaced under /brands/<brand>/).
 * Use getBrandKey() for env-driven brand; use getBrandConfig() for current brand config.
 */

/**
 * Reads process.env.NEXT_PUBLIC_BRAND then process.env.BRAND; defaults to "bmr".
 */
export function getBrandKey() {
  return process.env.NEXT_PUBLIC_BRAND || process.env.BRAND || "bmr";
}

export const brandConfig = {
  bmr: {
    name: "BMR Suspension",
    companyName: "BMR Suspension",
    siteName: "BMR Suspension",
    logoPath: "/brands/bmr/images/logo/BMR-Logo-White.png",
    logoHeaderMaxSize: { maxWidth: "200px", maxHeight: "50px" },
    logoFooterMaxSize: { maxWidth: "240px", maxHeight: "60px" },
    faviconPath: "/brands/bmr/favicons/favicon.svg",
    ogImagePath: "/brands/bmr/images/logo/BMR-Logo.jpg",
    themeColor: "#c8102e",
    /** Button/badge background (header search button, cart/wishlist badges) */
    buttonBadgeColor: "#c8102e",
    /** Text color on buttons/badges using buttonBadgeColor */
    buttonBadgeTextColor: "#ffffff",
    /** Text color on primary-colored buttons (e.g. red SEARCH button) */
    primaryButtonTextColor: "#ffffff",
    defaultTitle: "BMR Suspension | Performance Suspension & Chassis Parts",
    defaultDescription:
      "BMR Suspension manufactures high-performance suspension and chassis parts for Mustang, Camaro, GM, Mopar, and more. Shop rear control arms, sway bars, springs, and race-proven components.",
  },
  controlfreak: {
    name: "Control Freak Suspension",
    companyName: "Control Freak Suspension",
    siteName: "Control Freak Suspension",
    logoPath: "/brands/controlfreak/images/logo/ControlFreakSuspensionLogo.png",
    logoHeaderMaxSize: { maxWidth: "145px", maxHeight: "70px" },
    logoFooterMaxSize: { maxWidth: "240px", maxHeight: "60px" },
    faviconPath: "/brands/controlfreak/favicons/controlfreaksuspension.svg",
    ogImagePath: "/brands/controlfreak/images/CFS_logo.png",
    themeColor: "#ffec01",
    /** Button/badge background (header search button, cart/wishlist badges) */
    buttonBadgeColor: "#ffec01",
    /** Text color on buttons/badges using buttonBadgeColor */
    buttonBadgeTextColor: "#000000",
    /** Text color on primary-colored buttons (e.g. yellow SEARCH button) */
    primaryButtonTextColor: "#000000",
    defaultTitle:
      "Control Freak Suspension | Performance Suspension & Chassis Parts",
    defaultDescription:
      "Control Freak Suspension offers high-performance suspension and chassis parts engineered for serious handling and traction.",
  },
};

/**
 * Returns the config object for the current brand (from env).
 */
export function getBrandConfig() {
  const key = getBrandKey();
  const config = brandConfig[key];
  return config || brandConfig.bmr;
}
