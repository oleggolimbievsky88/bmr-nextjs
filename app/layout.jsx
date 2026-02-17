import { getSiteUrl } from "@bmr/core/url";
import { brand } from "@/src/brand";
import { getBrandConfig } from "@/lib/brand";
import { BrandProvider } from "@bmr/ui/brand";
import ClientProviders from "@/components/layouts/ClientProviders";
import JsonLd from "@/components/seo/JsonLd";
import "../public/scss/brand-bmr.scss";
import "../public/scss/brand-controlfreak.scss";
import "../public/scss/main.scss";
import "photoswipe/dist/photoswipe.css";
import "rc-slider/assets/index.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata() {
  const config = getBrandConfig();
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const defaultTitle = config.defaultTitle ?? "";
  const defaultDescription = config.defaultDescription ?? "";
  const siteName = config.siteName || config.name || "";
  const rawPath =
    config.ogImagePath && typeof config.ogImagePath === "string"
      ? config.ogImagePath
      : "";
  const ogImagePath = rawPath
    ? rawPath.startsWith("/")
      ? rawPath
      : `/${rawPath}`
    : "/og-image.png";
  const ogImageUrl = `${siteUrl}${ogImagePath}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultTitle,
      template: `%s | ${siteName}`,
    },
    description: defaultDescription,
    icons: {
      icon: config.faviconPath || "/favicon.ico",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName,
      title: defaultTitle,
      description: defaultDescription,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle.slice(0, 70),
      description: defaultDescription.slice(0, 200),
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    alternates: { canonical: "/" },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-brand={brand.key}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="preload-wrapper popup-loader">
        <BrandProvider brand={brand}>
          <JsonLd />
          <ClientProviders>{children}</ClientProviders>
        </BrandProvider>
      </body>
    </html>
  );
}
