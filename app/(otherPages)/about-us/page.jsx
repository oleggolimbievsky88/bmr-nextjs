import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import VehicleSearch from "@/components/common/VehicleSearch";
import About from "@/components/othersPages/about/About";
import Features from "@/components/othersPages/about/Features";
import FlatTitle from "@/components/othersPages/about/FlatTitle";
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
      <div className="vehicle-search-desktop-wrapper">
        <div className="container vehicle-search-desktop">
          <VehicleSearch />
        </div>
      </div>
      {/* <PageHeader title="About Us" /> */}
      <div className="container vehicle-search-mobile">
        <VehicleSearch />
      </div>

      <div className="container">
        <div className="line"></div>
      </div>
      <About />
      <Features />
      <Footer1 />
    </>
  );
}
