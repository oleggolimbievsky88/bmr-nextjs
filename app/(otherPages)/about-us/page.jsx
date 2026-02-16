import Footer1 from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import About from "@/components/othersPages/about/About";
import Features from "@/components/othersPages/about/Features";
import React from "react";

export const metadata = {
  title: "About BMR | BMR Suspension | Performance Suspension & Chassis Parts",
  description:
    "BMR Suspension - High Performance Suspension & Chassis racing parts for Mustang, Camaro, F Body, A Body, B Body, G Body, GM W Body, X Body, Firebird, Nova, Trailblazer SS, SSR, Monte Carlo, Intrigue, Grand Prix, Regal, Cutlass, Grand Sport, El Camino, LeMans, Chevelle, Malibu, GTO, G8, Grand National, CTS-V, Caprice, Skylark, Buick 442, Shelby GT500, Mustang GT and more.",
};
export default function page() {
  return (
    <>
      <Topbar4 />
      <Header showVehicleSearch={true} />
      <PageHeader title="ABOUT BMR" />
      <About />
      <Features />
      <Footer1 />
    </>
  );
}
