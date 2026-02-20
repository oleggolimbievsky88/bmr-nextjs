import dynamic from "next/dynamic";
import { getBrandConfig } from "@/lib/brandConfig";
import Features from "@/components/common/Features";
import Hero from "@/components/homes/home/Hero";
import React from "react";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import ThreeColumnLayout from "@/components/homes/home/ThreeColumnLayout";
import LazyNewProducts from "@/components/homes/home/LazyNewProducts";
// import Topbar4 from "@/components/header/Topbar4";
import ShopCategories from "@/components/homes/home/ShopCategories";

const VideoPage = dynamic(() => import("@/components/common/Videos"), {
  ssr: true,
});
// import SocialMedia from "@/components/homes/home/SocialMedia";
import Topbar2 from "@/components/header/Topbar2";
import VehicleSearch from "@/components/common/VehicleSearch";
import AboutBrandSection from "@/components/homes/home/AboutBrandSection";
import { getBannerImagesForPublic } from "@/lib/queries";

// Revalidate so production picks up admin brand changes (e.g. Shop by Make logos) without redeploy
export const revalidate = 60;

export async function generateMetadata() {
  const config = await getBrandConfig();
  return {
    title: config.defaultTitle ?? "",
    description: config.defaultDescription ?? "",
  };
}

function resolveBannerSrc(imageSrc) {
  if (!imageSrc || typeof imageSrc !== "string") return "";
  const s = imageSrc.trim();
  if (s.startsWith("http")) return s;
  if (s.startsWith("/")) return s;
  if (s.includes("/")) return `/${s}`;
  return `/images/slider/${s}`;
}

const DEFAULT_SHOP_BY_MAKE = {
  sectionTitle: "Shop by Make",
  sectionSubtitle: "Find parts for Ford, GM, and Dodge platforms.",
  items: [
    {
      imagePath: "/images/logo/Ford_Logo.png",
      title: "FORD",
      link: "products/ford",
      shopNowLabel: "SHOP NOW",
    },
    {
      imagePath: "/images/logo/gm_logo.png",
      title: "GM",
      link: "products/gm",
      shopNowLabel: "SHOP NOW",
    },
    {
      imagePath: "/images/logo/dodge_logo.png",
      title: "Dodge",
      link: "products/mopar",
      shopNowLabel: "SHOP NOW",
    },
  ],
};

export default async function page() {
  const config = await getBrandConfig();
  const imageRows = await getBannerImagesForPublic();
  const initialBannerImages =
    imageRows?.length > 0
      ? imageRows.map((img) => ({
          src: resolveBannerSrc(img.ImageSrc),
          link: img.ImageUrl?.trim() || null,
        }))
      : null;

  return (
    <>
      <Topbar2 />
      <Header />
      <Hero initialBannerImages={initialBannerImages} />
      <div className="container vehicle-search-mobile">
        <VehicleSearch />
      </div>

      <div className="homepage-sections">
        <ThreeColumnLayout
          shopByMake={
            config.shopByMake?.items?.length > 0
              ? config.shopByMake
              : DEFAULT_SHOP_BY_MAKE
          }
        />
        <ShopCategories />
        <LazyNewProducts scratchDent="0" />
        <LazyNewProducts scratchDent="1" />
        {/* <SocialMedia /> */}
        {config.key !== "controlfreak" && <VideoPage />}
      </div>
      <AboutBrandSection />
      <Features />

      <Footer />
    </>
  );
}
