import { defaultOgImage } from "./pageMeta.js";

export function buildMetadata(brand) {
  const SITE_URL = brand.siteUrl;
  const defaultTitle = brand.defaultTitle;
  const defaultDescription = brand.defaultDescription;

  const og = defaultOgImage(brand);

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: defaultTitle },
    description: defaultDescription,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: brand.siteName || brand.companyName,
      title: defaultTitle,
      description: defaultDescription,
      images: [og],
    },
    twitter: {
      card: "summary_large_image",
      title: (defaultTitle || "").slice(0, 70),
      description: (defaultDescription || "").slice(0, 200),
      images: [og.url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    alternates: { canonical: "/" },
  };
}
