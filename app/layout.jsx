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

  // Use /api/favicon?brand= so the correct brand is served and browser cache is per-brand
  const brandKey = (config.key || "bmr").toLowerCase();
  const faviconUrl = `${siteUrl}/api/favicon?brand=${encodeURIComponent(brandKey)}`;
  const icons = { icon: faviconUrl };

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

  const faviconHref = `/api/favicon?brand=${encodeURIComponent(brandKey)}`;
  return (
    <html lang="en" data-brand={brandKey}>
      <head>
        <link rel="icon" href={faviconHref} />
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
