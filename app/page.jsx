import Features from "@/components/common/Features";
import Hero from "@/components/homes/home/Hero";
import React from "react";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import ThreeColumnLayout from "@/components/homes/home/ThreeColumnLayout";
import LazyNewProducts from "@/components/homes/home/LazyNewProducts";
// import Topbar4 from "@/components/header/Topbar4";
import VideoPage from "@/components/common/Videos";
import ShopCategories from "@/components/homes/home/ShopCategories";
// import SocialMedia from "@/components/homes/home/SocialMedia";
import Topbar2 from "@/components/header/Topbar2";
import VehicleSearch from "@/components/common/VehicleSearch";
import { getBannerImagesForPublic } from "@/lib/queries";

export const metadata = {
  title: "BMR Suspension | Performance Suspension & Chassis Parts",
  description:
    "BMR Suspension - High Performance Suspension & Chassis racing parts for Mustang, Camaro, F Body, A Body, B Body, G Body, GM W Body, X Body, Firebird, Nova, Trailblazer SS, SSR, Monte Carlo, Intrigue, Grand Prix, Regal, Cutlass, Grand Sport, El Camino, LeMans, Chevelle, Malibu, GTO, G8, Grand National, CTS-V, Caprice, Skylark, Buick 442, Shelby GT500, Mustang GT and more.",
};

function resolveBannerSrc(imageSrc) {
  if (!imageSrc || typeof imageSrc !== "string") return "";
  const s = imageSrc.trim();
  if (s.startsWith("http")) return s;
  if (s.startsWith("/")) return s;
  if (s.includes("/")) return `/${s}`;
  return `/images/slider/${s}`;
}

export default async function page() {
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
        <ThreeColumnLayout />
        <ShopCategories />
        <LazyNewProducts scratchDent="0" />
        <LazyNewProducts scratchDent="1" />
        {/* <SocialMedia /> */}
        <VideoPage />
      </div>
      <Features />
      <Footer />
    </>
  );
}
