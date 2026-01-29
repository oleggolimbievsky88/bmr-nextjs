import { SITE_URL } from "@/lib/site-url";
import { DEFAULT_OG_IMAGE, OG_IMAGE_URL } from "@/lib/metadata";
import ClientProviders from "@/components/layouts/ClientProviders";
import JsonLd from "@/components/seo/JsonLd";
import "../public/scss/main.scss";
import "photoswipe/dist/photoswipe.css";
import "rc-slider/assets/index.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const defaultTitle = "BMR Suspension | Performance Suspension & Chassis Parts";
const defaultDescription =
  "BMR Suspension manufactures high-performance suspension and chassis parts for Mustang, Camaro, GM, Mopar, and more. Shop rear control arms, sway bars, springs, and race-proven components.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: defaultTitle },
  description: defaultDescription,
  keywords: [
    "BMR Suspension",
    "performance suspension",
    "chassis parts",
    "Mustang",
    "Camaro",
    "GM",
    "Mopar",
    "control arms",
    "sway bars",
    "lowering springs",
  ],
  authors: [{ name: "BMR Suspension", url: SITE_URL }],
  creator: "BMR Suspension",
  publisher: "BMR Suspension",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "BMR Suspension",
    title: defaultTitle,
    description: defaultDescription,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle.slice(0, 70),
    description: defaultDescription.slice(0, 200),
    images: [OG_IMAGE_URL],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
        <JsonLd />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
