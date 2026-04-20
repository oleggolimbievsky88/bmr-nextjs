import { getSiteUrl } from "../url/getSiteUrl.js";

/**
 * Reads process.env.NEXT_PUBLIC_BRAND then process.env.BRAND; defaults to "bmr".
 */
export function getBrandKey() {
  return process.env.NEXT_PUBLIC_BRAND || process.env.BRAND || "bmr";
}

/**
 * Deep merge: target is mutated, source overrides. Arrays are replaced, not merged.
 */
export function deepMerge(target, source) {
  if (!source || typeof source !== "object") return target;
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    if (
      srcVal !== null &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal)
    ) {
      if (!(key in target) || typeof target[key] !== "object") {
        target[key] = {};
      }
      deepMerge(target[key], srcVal);
    } else {
      target[key] = srcVal;
    }
  }
  return target;
}

/**
 * Sync fallback: returns brand from file only (no DB). Use getBrandConfig() for DB merge.
 */
export function getBrandConfigSync() {
  const key = getBrandKey();
  const brand = defaultBrands[key];
  return brand || defaultBrands.bmr;
}

export const defaultBrands = {
  bmr: {
    key: "bmr",
    name: "BMR Suspension",
    companyName: "BMR Suspension",
    /** Short name for inline use (e.g. "Check out the latest from BMR!") */
    companyNameShort: "BMR",
    siteUrl: getSiteUrl(),
    assetsBaseUrl: process.env.NEXT_PUBLIC_ASSETS_BASE_URL || "",

    logo: {
      headerPath:
        process.env.NEXT_PUBLIC_HEADER_LOGO ||
        "/brands/bmr/images/logo/BMR-Logo-White.png",
      footerPath:
        process.env.NEXT_PUBLIC_FOOTER_LOGO ||
        "/brands/bmr/images/logo/BMR-Logo-White.png",
      headerMaxSize: { maxWidth: "200px", maxHeight: "50px" },
      footerMaxSize: { maxWidth: "240px", maxHeight: "60px" },
      alt: "BMR Logo",
    },

    contact: {
      addressLines: ["1033 Pine Chase Ave", "Lakeland, FL 33815"],
      email: "sales@bmrsuspension.com",
      phoneDisplay: "(813) 986-9302",
      phoneTel: "8139869302",
    },

    social: {
      facebook: "https://www.facebook.com/BMRSuspensionInc/",
      instagram: "https://www.instagram.com/bmrsuspension/",
      youtube: "https://www.youtube.com/@BMRSuspension",
      tiktok: "https://www.tiktok.com/@bmrsuspension",
    },

    copyrightName: "BMR Suspension",

    themeColor: "#fe0000",
    faviconPath: "/brands/bmr/favicons/favicon.svg",
    ogImagePath: "/brands/bmr/images/logo/BMR-Logo.jpg",
    defaultOgImagePath: "/og/bmr-og.jpg",
    envOgImageUrlKey: "NEXT_PUBLIC_OG_IMAGE_URL",

    /** Button/badge background (header search button, cart/wishlist badges) */
    buttonBadgeColor: "#fe0000",
    /** Text color on buttons/badges using buttonBadgeColor */
    buttonBadgeTextColor: "#ffffff",
    /** Text color on primary-colored buttons (e.g. red SEARCH button) */
    primaryButtonTextColor: "#ffffff",

    /** Assurance bar (features section) background */
    assuranceBarBackgroundColor: "#f5f5f5",
    /** Assurance bar text and border color */
    assuranceBarTextColor: "#1a1a1a",

    /** Top features bar items. Each: { iconClass, title, description } */
    assuranceBarItems: [
      {
        iconClass: "icon-shipping",
        title: "Free Shipping",
        description:
          "Free shipping to the 48 continental U.S. states on all BMR products.",
      },
      {
        iconClass: "icon-payment fs-22",
        title: "Flexible Payment",
        description: "Pay with Credit, Debit, or PayPal",
      },
      {
        iconClass: "icon-return fs-20",
        title: "90 Day Returns",
        description: "Subject to a 15% restocking fee",
      },
      {
        iconClass: "icon-suport",
        title: "Premium Support",
        description: "Outstanding premium support",
      },
    ],

    defaultTitle: "BMR Suspension | Performance Suspension & Chassis Parts",
    defaultDescription:
      "BMR Suspension manufactures high-performance suspension and chassis parts for Mustang, Camaro, GM, Mopar, and more. Shop rear control arms, sway bars, springs, and race-proven components.",

    /** Homepage "Shop by Category" cards. items: [{ href, title, subtitle, img }] */
    shopByCategory: {
      sectionTitle: "Shop by Category",
      sectionSubtitle:
        "Browse our New Products, BMR Merchandise, and Gift Cards.",
      items: [
        {
          href: "/products/new",
          title: "New Products",
          subtitle: "Latest releases",
          img: "/images/shop-categories/NewProductsGradient.jpg",
        },
        {
          href: "/products/bmr-merchandise",
          title: "BMR Merchandise",
          subtitle: "Apparel & more",
          img: "/images/shop-categories/MerchGradient.jpg",
        },
        {
          href: "/products/gift-cards",
          title: "BMR Gift Cards",
          subtitle: "Perfect gift",
          img: "/images/shop-categories/GiftCardsGradient.jpg",
        },
      ],
    },

    sameAs: [],
  },

  /**
   * Control Freak Suspension
   */

  controlfreak: {
    key: "controlfreak",
    name: "Control Freak Suspension",
    companyName: "Control Freak Suspension",
    /** Short name for inline use (e.g. "Check out the latest from Control Freak!") */
    companyNameShort: "Control Freak",
    siteUrl: getSiteUrl(),
    assetsBaseUrl: process.env.NEXT_PUBLIC_ASSETS_BASE_URL || "",

    logo: {
      headerPath:
        process.env.NEXT_PUBLIC_HEADER_LOGO ||
        "/brands/controlfreak/images/logo/ControlFreakSuspensionLogo.png",
      footerPath:
        process.env.NEXT_PUBLIC_FOOTER_LOGO ||
        "/brands/controlfreak/images/logo/ControlFreakSuspensionLogo.png",
      headerMaxSize: { maxWidth: "145px", maxHeight: "70px" },
      footerMaxSize: { maxWidth: "240px", maxHeight: "70px" },
      alt: "Control Freak Logo",
    },
    contact: {
      addressLines: ["1033 Pine Chase Ave", "Lakeland, FL 33815"],
      email: "sales@freakride.com",
      phoneDisplay: "(407) 696-2772",
      phoneTel: "4076962772",
    },

    social: {},

    copyrightName: "Control Freak Suspension",

    themeColor: "#ffec01",
    faviconPath: "/brands/controlfreak/favicons/ControlFreakLogo.svg",
    ogImagePath: "/brands/controlfreak/images/CFS_logo.png",
    defaultOgImagePath: "/og/controlfreak-og.jpg",
    envOgImageUrlKey: "NEXT_PUBLIC_OG_IMAGE_URL",

    /** Button/badge background (header search button, cart/wishlist badges) */
    buttonBadgeColor: "#ffec01",
    /** Text color on buttons/badges using buttonBadgeColor */
    buttonBadgeTextColor: "#000000",
    /** Text color on primary-colored buttons (e.g. yellow SEARCH button) */
    primaryButtonTextColor: "#000000",

    /** Assurance bar (features section) background */
    assuranceBarBackgroundColor: "#ffec01",
    /** Assurance bar text and border color */
    assuranceBarTextColor: "#000000",

    /** Top features bar items. Each: { iconClass, title, description } */
    assuranceBarItems: [
      {
        iconClass: "icon-shipping",
        title: "Free Shipping",
        description: "Free shipping on all Control Freak products.",
      },
      {
        iconClass: "icon-payment fs-22",
        title: "Flexible Payment",
        description: "Pay with Credit, Debit, or PayPal",
      },
      {
        iconClass: "icon-return fs-20",
        title: "90 Day Returns",
        description: "Subject to a 15% restocking fee",
      },
      {
        iconClass: "icon-suport",
        title: "Tech Help",
        description: "8:30-5:30 PM EST",
      },
    ],

    defaultTitle:
      "Control Freak Suspension | World Class Suspensions for the Best Price",
    defaultDescription:
      "Control Freak Suspension offers World Class Suspensions for the Best Price",

    /** Homepage "Shop by Category" cards. items: [{ href, title, subtitle, img }] */
    shopByCategory: {
      sectionTitle: "Shop by Category",
      sectionSubtitle: "Browse our New Products, Merchandise, and Gift Cards.",
      items: [
        {
          href: "/products/new",
          title: "New Products",
          subtitle: "Latest releases",
          img: "/images/shop-categories/NewProductsGradient.jpg",
        },
        {
          href: "/products/bmr-merchandise",
          title: "BMR Merchandise",
          subtitle: "Apparel & more",
          img: "/images/shop-categories/MerchGradient.jpg",
        },
        {
          href: "/products/gift-cards",
          title: "BMR Gift Cards",
          subtitle: "Perfect gift",
          img: "/images/shop-categories/GiftCardsGradient.jpg",
        },
      ],
    },

    /**
     * About brand block (home page + about page). Used only when present.
     */
    aboutBrand: {
      heading: "About Control Freak Suspension",
      paragraphs: [
        "Control Freak Suspension was founded in 2000 as an addition to a hot rod and muscle car shop. As builders, we just were not satisfied with the aftermarket suspension offerings of the day, so we designed, developed, and manufactured our own. Just two years later, Control Freak Suspension was spun off as its own company and label with its own facilities and staff. We've been in continuous operation since then.",
        "Our mission is simple: design, develop, and manufacture world-class suspension systems at a responsive price.",
        "All of our products are manufactured in-house at our central Florida facilities to uphold the high quality you know and trust. Whether it's a weekend cruiser or a dedicated track car, we have the parts you need to upgrade your classic ride with modern handling and performance.",
      ],
      ctaLabel: "Contact Support",
      ctaHref: "/contact",
    },

    sameAs: [],
  },

  /**
   * Heidts Suspension — file defaults; merged with brand_core DB when configured.
   */
  heidts: {
    key: "heidts",
    name: "Heidts Suspension",
    companyName: "Heidts Suspension",
    companyNameShort: "Heidts",
    siteUrl: getSiteUrl(),
    assetsBaseUrl: process.env.NEXT_PUBLIC_ASSETS_BASE_URL || "",

    logo: {
      headerPath:
        process.env.NEXT_PUBLIC_HEADER_LOGO ||
        "/brands/heidts/images/logo/HEIDTS_logo.png",
      footerPath:
        process.env.NEXT_PUBLIC_FOOTER_LOGO ||
        "/brands/heidts/images/logo/HEIDTS_logo.png",
      headerMaxSize: { maxWidth: "180px", maxHeight: "50px" },
      footerMaxSize: { maxWidth: "220px", maxHeight: "56px" },
      alt: "Heidts Logo",
    },

    contact: {
      addressLines: ["641 Peterson Rd", "Lake Zurich, IL 60047"],
      email: "info@heidts.com",
      phoneDisplay: "(847) 548-1111",
      phoneTel: "8475481111",
    },

    social: {
      facebook: "https://www.facebook.com/Heidts/",
      instagram: "https://www.instagram.com/heidts_suspension/",
      youtube: "https://www.youtube.com/user/Heidts1",
    },

    copyrightName: "Heidts Suspension",

    themeColor: "#b41818",
    faviconPath: "/brands/heidts/favicons/favicon.svg",
    ogImagePath: "/brands/heidts/images/logo/HEIDTS_logo.png",
    defaultOgImagePath: "/brands/heidts/images/logo/HEIDTS_logo.png",
    envOgImageUrlKey: "NEXT_PUBLIC_OG_IMAGE_URL",

    buttonBadgeColor: "#b41818",
    buttonBadgeTextColor: "#ffffff",
    primaryButtonTextColor: "#ffffff",

    assuranceBarBackgroundColor: "#2a2a2a",
    assuranceBarTextColor: "#f0f0f0",

    assuranceBarItems: [
      {
        iconClass: "icon-shipping",
        title: "Engineered Performance",
        description:
          "Race-proven suspension systems and components for your build.",
      },
      {
        iconClass: "icon-payment fs-22",
        title: "Flexible Payment",
        description: "Pay with Credit, Debit, or PayPal",
      },
      {
        iconClass: "icon-return fs-20",
        title: "Support",
        description: "Technical help when you need it.",
      },
      {
        iconClass: "icon-suport",
        title: "Made in the USA",
        description: "Quality manufacturing you can trust.",
      },
    ],

    defaultTitle:
      "Heidts Suspension | Complete Suspension Kits & Performance Parts",
    defaultDescription:
      "Heidts designs and manufactures complete suspension kits, Mustang II systems, and performance parts for Ford, Mopar, and universal applications.",

    shopByCategory: {
      sectionTitle: "Shop by Kit Line",
      sectionSubtitle: "Ford, Mopar, and Universal suspension kits.",
      items: [
        {
          href: "/products/ford",
          title: "Ford Kits",
          subtitle: "Mustang & Ford performance",
          img: "/images/shop-categories/NewProductsGradient.jpg",
        },
        {
          href: "/products/mopar",
          title: "Mopar Kits",
          subtitle: "Challenger, Charger & more",
          img: "/images/shop-categories/MerchGradient.jpg",
        },
        {
          href: "/products/universal",
          title: "Universal Kits",
          subtitle: "Build your kit",
          img: "/images/shop-categories/GiftCardsGradient.jpg",
        },
      ],
    },

    shopByMake: {
      sectionTitle: "Shop by Kit Line",
      sectionSubtitle: "Ford, Mopar, and Universal suspension kits.",
      items: [
        {
          imagePath: "/images/logo/Ford_Logo.png",
          title: "FORD KITS",
          link: "products/ford",
          shopNowLabel: "SHOP NOW",
        },
        {
          imagePath: "/images/logo/dodge_logo.png",
          title: "MOPAR KITS",
          link: "products/mopar",
          shopNowLabel: "SHOP NOW",
        },
        {
          imagePath: "/images/shop-categories/NewProductsGradient.jpg",
          title: "UNIVERSAL KITS",
          link: "products/universal",
          shopNowLabel: "SHOP NOW",
        },
      ],
    },

    navLabels: {
      ford: "FORD KITS",
      mopar: "MOPAR KITS",
      universal: "UNIVERSAL KITS",
      installation: "Installation",
      cart: "Cart",
    },
    navUrls: {
      ford: "/products/ford",
      mopar: "/products/mopar",
      universal: "/products/universal",
      installation: "/installation",
      cart: "/view-cart",
    },
    navOrder: ["ford", "mopar", "universal", "installation", "cart"],
    navPlatformIds: ["ford", "mopar", "universal"],

    homepageSections: [
      {
        type: "splitHero",
        headline: "COMPLETE SUSPENSION KITS",
        subheadline: "CUSTOMIZE A KIT FOR YOUR VEHICLE",
        body: "Build the perfect suspension kit for your vehicle. We have a wide selection of fitments, colors, and sizes.",
        ctaLabel: "CUSTOMIZE YOUR KIT",
        ctaHref: "/products/universal",
        imagePath: "/brands/heidts/banners/hero-suspension-kit.jpg",
        imageAlt: "Heidts complete suspension kit",
        textureImagePath:
          "/brands/heidts/banners/HomepageGraphicBG_SuspensionKits.webp",
      },
    ],

    aboutBrand: {
      heading: "About Heidts",
      paragraphs: [
        "For decades, Heidts has been a leader in high-performance suspension systems and complete bolt-in kits for street rods, muscle cars, and restomods.",
        "From Mustang II front ends to four-link rear kits, our products are engineered for fit, finish, and handling you can feel on the road or at the track.",
      ],
      ctaLabel: "Contact Us",
      ctaHref: "/contact",
    },

    sameAs: [],
  },
};

/** @deprecated Use defaultBrands */
export const brands = defaultBrands;
