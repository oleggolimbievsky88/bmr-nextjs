import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import Topbar4 from "@/components/header/Topbar4";
import VehicleSearch from "@/components/common/VehicleSearch";
import ContactForm2 from "@/components/othersPages/contact/ContactForm2";
import Map2 from "@/components/othersPages/contact/Map2";
import React from "react";

export const metadata = {
  title: "Contact BMR Suspension",
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
      <div>
        <div
          className="container text-center"
          style={{ padding: "30px 0 0px 0" }}
        >
          <div className="home-title d-inline-block ">Contact Us</div>
        </div>
      </div>
      <div className="container vehicle-search-mobile">
        <VehicleSearch />
      </div>
      <Map2 />
      <ContactForm2 />
      <Footer1 />
    </>
  );
}
