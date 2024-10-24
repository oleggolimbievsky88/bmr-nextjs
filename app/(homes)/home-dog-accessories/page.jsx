import Features from "@/components/common/Features";
import Footer1 from "@/components/footers/Footer";
import Header11 from "@/components/headers/Header11";

import Topbar1 from "@/components/headers/Topbar1";
import Categories from "@/components/homes/home-dog-accessories/Categories";
import Collection from "@/components/homes/home-dog-accessories/Collection";
import CollectionBanner from "@/components/homes/home-dog-accessories/CollectionBanner";
import Countdown from "@/components/homes/home-dog-accessories/Countdown";
import Hero from "@/components/homes/home-dog-accessories/Hero";
import Lookbook from "@/components/homes/home-dog-accessories/Lookbook";
import Products from "@/components/homes/home-dog-accessories/Products";
import React from "react";

export const metadata = {
  title: "Home Dog Accessories | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Topbar1 />
      <Header11 />
      <Hero />
      <CollectionBanner />
      <Products />
      <Countdown />
      <Collection />

      <Categories />
      <Lookbook />
      <div className="mt-5"></div>
      <Features />
      <Footer1 bgColor="background-gray" />
    </>
  );
}
