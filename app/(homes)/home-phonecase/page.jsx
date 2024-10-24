import Announcmentbar from "@/components/common/Announcmentbar";
import Footer1 from "@/components/footers/Footer";
import Header4 from "@/components/headers/Header4";
import Categories from "@/components/homes/home-phonecase/Categories";
import Collection2 from "@/components/homes/home-phonecase/Collection2";
import CollectionBanner from "@/components/homes/home-phonecase/CollectionBanner";
import Collections from "@/components/homes/home-phonecase/Collections";
import Collections3 from "@/components/homes/home-phonecase/Collections3";
import Features from "@/components/homes/home-phonecase/Features";
import Hero from "@/components/homes/home-phonecase/Hero";
import Products from "@/components/homes/home-phonecase/Products";
import Products2 from "@/components/homes/home-phonecase/Products2";
import Testimonials from "@/components/homes/home-phonecase/Testimonials";
import React from "react";

export const metadata = {
  title: "Home Phonecase | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <div className="color-primary-5">
        <Announcmentbar bgColor="bg_dark" />
        <Header4 />
        <Hero />
        <Categories />
        <CollectionBanner />
        <Products />
        <Collections />
        <Products2 />
        <Collection2 />
        <Features />
        <Testimonials />
        <Collections3 />
        <Footer1 bgColor="background-gray" />
      </div>
    </>
  );
}
