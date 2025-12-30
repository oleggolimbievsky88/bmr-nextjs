import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import About from "@/components/othersPages/about/About";
import Features from "@/components/othersPages/about/Features";
import FlatTitle from "@/components/othersPages/about/FlatTitle";
import ShopGram from "@/components/othersPages/about/ShopGram";
import Testimonials from "@/components/othersPages/about/Testimonials";
import React from "react";

export const metadata = {
  title: "About Us | BMR Suspension | Performance Suspension & Chassis Parts",
  description:
    "BMR Suspension - High Performance Suspension & Chassis raceing parts for Mustang, Camaro, F Body, A Body, B Body, G Body, GM W Body, X Body, Firebird, Nova, Trailblazer SS, SSR, Monte Carlo, Intrigue, Grand Prix, Regal, Cutlass, Grand Sport, El Camino, LeMans, Chevelle, Malibu, GTO, G8, Grand National, CTS-V, Caprice, Skylark, buick 442, Shelby GT500, Mustrang GT and more.",
};
export default function page() {
  return (
    <>
      <Topbar4 />
      <Header18 />
      <PageHeader title="About Us" />
      <FlatTitle />
      <div className="container">
        <div className="line"></div>
      </div>
      <About /> <br />
      <br />
      <div className="container">
        <div className="line"></div>
      </div>{" "}
      <br /> <br />
      <Features />
      {/* <Testimonials /> */}
      <div className="container">
        <div className="line"></div>
      </div>{" "}
      <br />
      {/* <ShopGram /> */}
      <Footer1 />
    </>
  );
}
