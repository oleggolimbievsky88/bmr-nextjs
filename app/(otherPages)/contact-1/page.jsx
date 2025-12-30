import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import Topbar4 from "@/components/header/Topbar4";
import VehicleSearch from "@/components/common/VehicleSearch";
import ContactForm from "@/components/othersPages/contact/ContactForm";
import Map from "@/components/othersPages/contact/Map";
import React from "react";

export const metadata = {
  title: "BMR Suspension | Performance Suspension & Chassis Parts",
  description: "BMR Suspension - High Performance Suspension & Chassis raceing parts for Mustang, Camaro, F Body, A Body, B Body, G Body, GM W Body, X Body, Firebird, Nova, Trailblazer SS, SSR, Monte Carlo, Intrigue, Grand Prix, Regal, Cutlass, Grand Sport, El Camino, LeMans, Chevelle, Malibu, GTO, G8, Grand National, CTS-V, Caprice, Skylark, buick 442, Shelby GT500, Mustrang GT and more.",
};
export default function ContactPage() {
  return (
    <>
      <Topbar4 />
      <Header18 />
      <div className="vehicle-search-desktop-wrapper">
        <div className="container vehicle-search-desktop">
          <VehicleSearch />
        </div>
      </div>
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Contact Us</div>
        </div>
      </div>
      <div className="container vehicle-search-mobile">
        <VehicleSearch />
      </div>
      <Map />
      <ContactForm />
      <Footer1 />
    </>
  );
}
