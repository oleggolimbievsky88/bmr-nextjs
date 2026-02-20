import { getSiteUrl } from "@bmr/core/url";
import { getBrandConfig } from "@/lib/brandConfig";
import { BrandProvider } from "@bmr/ui/brand";
import ClientProviders from "@/components/layouts/ClientProviders";
import JsonLd from "@/components/seo/JsonLd";
import "../public/scss/main.scss";
import "../public/scss/brand-bmr.scss";
import "../public/scss/brand-controlfreak.scss";
import "photoswipe/dist/photoswipe.css";
import "rc-slider/assets/index.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata() {
  const config = await getBrandConfig();
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const defaultTitle = config.defaultTitle ?? "";
  const defaultDescription = config.defaultDescription ?? "";
  const siteName = config.name || "";
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

  const rawFavicon = config.faviconPath || "/favicon.ico";
  const faviconPath =
    typeof rawFavicon === "string" && rawFavicon && !rawFavicon.startsWith("/")
      ? `/${rawFavicon}`
      : rawFavicon;
  const isSvg =
    typeof faviconPath === "string" &&
    faviconPath.toLowerCase().endsWith(".svg");
  // Omit sizes for SVG so Chromium doesn't prefer .ico; use full URL for metadata
  const iconUrl = faviconPath.startsWith("http")
    ? faviconPath
    : `${siteUrl}${faviconPath}`;
  const icons = isSvg
    ? {
        icon: [{ url: iconUrl, type: "image/svg+xml" }],
      }
    : { icon: iconUrl };

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultTitle,
      template: `%s | ${siteName}`,
    },
    description: defaultDescription,
    icons,
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

export default async function RootLayout({ children }) {
  const config = await getBrandConfig();
  const buttonBadge = config.buttonBadgeColor ?? config.themeColor;
  const buttonBadgeText = config.buttonBadgeTextColor ?? "#ffffff";
  const primaryButtonText = config.primaryButtonTextColor ?? "#ffffff";
  const assuranceBarBg =
    config.assuranceBarBackgroundColor ?? config.themeColor ?? "#000000";
  const assuranceBarText = config.assuranceBarTextColor ?? "#1a1a1a";
  const brandKey = config.key || "bmr";

  return (
    <html lang="en" data-brand={brandKey}>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `[data-brand="${brandKey}"]{--brand-button-badge:${buttonBadge};--brand-button-badge-text:${buttonBadgeText};--brand-primary-button-text:${primaryButtonText};--brand-assurance-bar-bg:${assuranceBarBg};--brand-assurance-bar-text:${assuranceBarText};}`,
          }}
        />
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
        <BrandProvider brand={config}>
          <JsonLd brand={config} />
          <ClientProviders>{children}</ClientProviders>
        </BrandProvider>
      </body>
    </html>
  );
}
