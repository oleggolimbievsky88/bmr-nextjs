import Footer1 from "@/components/footers/Footer";
import Header5 from "@/components/headers/Header5";
import BestSell from "@/components/homes/home-giftcard/BestSell";
import Blog from "@/components/homes/home-giftcard/Blog";
import Card from "@/components/homes/home-giftcard/Card";
import Categories from "@/components/homes/home-giftcard/Categories";
import Collection from "@/components/homes/home-giftcard/Collection";
import Features from "@/components/homes/home-giftcard/Features";
import Hero from "@/components/homes/home-giftcard/Hero";
import Marquee from "@/components/homes/home-giftcard/Marquee";
import Products from "@/components/homes/home-giftcard/Products";
import Testimonials from "@/components/homes/home-giftcard/Testimonials";
import React from "react";

export const metadata = {
  title: "Home Giftcard | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Header5 />
      <Hero />
      <Card />
      <Products />
      <Features />
      <Categories />
      <Marquee />
      <BestSell />
      <Collection />
      <Testimonials />
      <Blog />
      <Footer1 />
    </>
  );
}
