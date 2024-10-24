import Features from "@/components/common/Features2";
import Footer2 from "@/components/footers/Footer2";
import Header2 from "@/components/headers/Header";
import Blogs from "@/components/homes/home-electronic/Blogs";
import Categories from "@/components/homes/home-electronic/Categories";
import CollectionBanner from "@/components/homes/home-electronic/CollectionBanner";
import Collections from "@/components/homes/home-electronic/Collections";
import Countdown from "@/components/homes/home-electronic/Countdown";

import Hero from "@/components/homes/home-electronic/Hero";
import Marquee from "@/components/homes/home-electronic/Marquee";
import Products from "@/components/homes/home-electronic/Products";
import Testimonials from "@/components/homes/home-electronic/Testimonials";
import Topbar from "@/components/homes/home-headphone/Topbar";
import React from "react";

export const metadata = {
  title: "Home Electronics  | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <div className="color-primary-3">
        <Topbar />
        <Header2 textClass={"text-black"} />
        <Hero />
        <Marquee />
        <Categories />
        <CollectionBanner />
        <Collections />
        <Countdown />
        <Products />
        <Testimonials />
        <Blogs />
        <Features />
        <Footer2 />
      </div>
    </>
  );
}
