import Features from "@/components/common/Features";
import Categories from "@/components/homes/home/Categories";
import Collections from "@/components/homes/home/Collections";
import Collections2 from "@/components/homes/home/Collections2";
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
export const metadata = {
  title: "BMR Suspension | Performance Suspension & Chassis Parts",
  description:
    "BMR Suspension - High Performance Suspension & Chassis raceing parts for Mustang, Camaro, F Body, A Body, B Body, G Body, GM W Body, X Body, Firebird, Nova, Trailblazer SS, SSR, Monte Carlo, Intrigue, Grand Prix, Regal, Cutlass, Grand Sport, El Camino, LeMans, Chevelle, Malibu, GTO, G8, Grand National, CTS-V, Caprice, Skylark, buick 442, Shelby GT500, Mustrang GT and more.",
};
export default function page() {
  return (
    <>
      <Topbar4 />
      <Header18 />
      <Hero /> <br />
      {/* <ShopCategories /> <br /> <br /> */}
      {/* <ThreeColumnLayout /> */}
      {/* <Categories /> */}
      {/* <Products /> */}
      <LazyNewProducts scratchDent="0" />
      {/* <ShopCategories /> */}
      <LazyNewProducts scratchDent="1" />
      {/* <ProductsPage /> */}
      {/* <CollectionBanner /> */}
      {/* <Collections /> */}
      {/* <Blogs /> */}
      <VideoPage />
      {/* <Marquee /> */}
      {/* <Testimonials /> */}
      {/* <Brands /> */}
      {/* <SocialMedia /> */}
      <Features />
      <Footer />
    </>
  );
}
