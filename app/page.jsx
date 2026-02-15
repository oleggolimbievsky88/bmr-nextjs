import Features from "@/components/common/Features";
import Hero from "@/components/homes/home/Hero";
import Marquee from "@/components/homes/home/Marquee";
import Products from "@/components/homes/home/Products";
import Products2 from "@/components/homes/home/Products2";
import Testimonials from "@/components/homes/home/Testimonials";
import Brands from "@/components/homes/home/Brands";
import React from "react";
import Footer from "@/components/footer/Footer";
import Topbar1 from "@/components/header/Topbar1";
import Header from "@/components/header/Header";
import CollectionBanner from "@/components/homes/home/CollectionBanner";
import ThreeColumnLayout from "@/components/homes/home/ThreeColumnLayout";
import ProductsPage from "./products/page";
import NewProductsPage from "./products/new/page";
import LazyNewProducts from "@/components/homes/home/LazyNewProducts";
import Topbar4 from "@/components/header/Topbar4";
import Header18 from "@/components/header/Header18";
import VideoPage from "@/components/common/Videos";
import Blogs from "@/components/homes/home/Blogs";
import ShopCategories from "@/components/homes/home/ShopCategories";
import SocialMedia from "@/components/homes/home/SocialMedia";
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
      <Header18 />
      <div className="vehicle-search-desktop-wrapper">
        <div className="container vehicle-search-desktop">
          <VehicleSearch />
        </div>
      </div>
      <Hero initialBannerImages={initialBannerImages} />
      <div className="container vehicle-search-mobile">
        <VehicleSearch />
      </div>

      <div className="homepage-sections">
        <ThreeColumnLayout />
        <ShopCategories />
        {/* <Categories /> - uses homepage-collections API */}
        {/* <Products /> */}
        <LazyNewProducts scratchDent="0" />
        {/* <ShopCategories /> */}
        <LazyNewProducts scratchDent="1" />
        {/* <ProductsPage /> */}
        {/* <CollectionBanner /> */}
        {/* <Blogs /> */}
        <VideoPage />
      </div>
      {/* <Marquee /> */}
      {/* <Testimonials /> */}
      {/* <Brands /> */}
      {/* <SocialMedia /> */}
      <Features />
      <Footer />
    </>
  );
}
