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
import Footer1 from "@/components/footers/Footer1";
import Header15 from "@/components/headers/Header15";
import Topbar1 from "@/components/headers/Topbar1";
import Header from "@/components/headers/Header";
import VehicleSearch from "@/components/common/VehicleSearch";
import ShopCategories from "@/components/homes/home/ShopCategories";
import CollectionBanner from "@/components/homes/home/CollectionBanner";
import ThreeColumnLayout from "@/components/homes/home/ThreeColumnLayout";
import ProductsPage from "./products/page";
import NewProductsPage from "./products/new/page";

export const metadata = {
  title: "BMR Suspension | Performance Suspension & Chassis Parts",
  description: "BMR Suspension - High Performance Suspension & Chassis raceing parts for Mustang, Camaro, F Body, A Body, B Body, G Body, GM W Body, X Body, Firebird, Nova, Trailblazer SS, SSR, Monte Carlo, Intrigue, Grand Prix, Regal, Cutlass, Grand Sport, El Camino, LeMans, Chevelle, Malibu, GTO, G8, Grand National, CTS-V, Caprice, Skylark, buick 442, Shelby GT500, Mustrang GT and more.",
};
export default function page() {
  return (
    <>
      {/* <Topbar1 /> */}
      <Header />
      <Hero /> <br />
      <VehicleSearch /> <br />
      {/* <ShopCategories /> <br /> <br /> */}
      <ThreeColumnLayout /><br />
      {/* <Categories /> */}
      {/* <Products /><br /><br /> */}
      <NewProductsPage scrachDent="0"/>
      <NewProductsPage scrachDent="1"/>
      {/* <ProductsPage /> */}
      <CollectionBanner />
      {/* <Collections /> */}
      
      {/* <Collections2 /> */}
      <div className="mt-5"></div>
      
      {/* <Products2 /> */}
      {/* <Marquee /> */}
      <Testimonials />
      {/* <Brands /> */} <br /><br />
      <Features />
      <Footer1 />
    </>
  );
}
