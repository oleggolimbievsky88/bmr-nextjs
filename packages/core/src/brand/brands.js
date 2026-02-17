import { getSiteUrl } from "../url/getSiteUrl.js";

export const brands = {
  bmr: {
    key: "bmr",
    companyName: "BMR Suspension",
    siteName: "BMR Suspension",
    siteUrl: getSiteUrl(),

    assetsBaseUrl: process.env.NEXT_PUBLIC_ASSETS_BASE_URL || "",

    logo: {
      headerPath:
        process.env.NEXT_PUBLIC_HEADER_LOGO ||
        "/images/logo/BMR-Logo-White.png",
      footerPath:
        process.env.NEXT_PUBLIC_FOOTER_LOGO ||
        "/images/logo/BMR-Logo-White.png",
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

    defaultTitle: "BMR Suspension | Performance Suspension & Chassis Parts",
    defaultDescription:
      "BMR Suspension manufactures high-performance suspension and chassis parts for Mustang, Camaro, GM, Mopar, and more. Shop rear control arms, sway bars, springs, and race-proven components.",

    defaultOgImagePath: "/og/bmr-og.jpg",
    envOgImageUrlKey: "NEXT_PUBLIC_OG_IMAGE_URL",

    sameAs: [],
  },

  controlfreak: {
    key: "controlfreak",
    companyName: "Control Freak Suspension",
    siteName: "Control Freak Suspension",
    siteUrl: getSiteUrl(),

    assetsBaseUrl: process.env.NEXT_PUBLIC_ASSETS_BASE_URL || "",

    logo: {
      headerPath:
        process.env.NEXT_PUBLIC_HEADER_LOGO ||
        "/images/logo/ControlFreak-Logo-White.png",
      footerPath:
        process.env.NEXT_PUBLIC_FOOTER_LOGO ||
        "/images/logo/ControlFreak-Logo-White.png",
      headerMaxSize: { maxWidth: "200px", maxHeight: "50px" },
      footerMaxSize: { maxWidth: "240px", maxHeight: "60px" },
      alt: "Control Freak Logo",
    },

    contact: {
      addressLines: [],
      email: "sales@controlfreaksuspension.com",
      phoneDisplay: "",
      phoneTel: "",
    },

    social: {},

    copyrightName: "Control Freak Suspension",

    defaultTitle:
      "Control Freak Suspension | Performance Suspension & Chassis Parts",
    defaultDescription:
      "Control Freak Suspension offers high-performance suspension and chassis parts engineered for serious handling and traction.",

    defaultOgImagePath: "/og/controlfreak-og.jpg",
    envOgImageUrlKey: "NEXT_PUBLIC_OG_IMAGE_URL",

    sameAs: [],
  },
};
