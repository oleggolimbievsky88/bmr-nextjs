import Footer1 from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar4 from "@/components/header/Topbar4";
import VehicleSearch from "@/components/common/VehicleSearch";
import ContactForm from "@/components/othersPages/contact/ContactForm";
import Map from "@/components/othersPages/contact/Map";
import { pageMeta } from "@/lib/metadata";
import React from "react";

const title =
  "Contact Us | BMR Suspension | Performance Suspension & Chassis Parts";
const description =
  "Contact BMR Suspension – High Performance Suspension & Chassis parts. Visit us in Lakeland, FL or email sales@bmrsuspension.com.";

const { openGraph, twitter } = pageMeta({
  path: "/contact",
  title,
  description,
});

export const metadata = {
  title,
  description,
  openGraph,
  twitter,
};

export default function ContactPage() {
  return (
    <>
      <Topbar4 />
      <Header />
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
          <div className="home-title d-inline-block">Contact Us</div>
        </div>
      </div>
      <div className="container vehicle-search-mobile">
        <VehicleSearch />
      </div>
      <main className="contact-1-page">
        <Map />
        <ContactForm />
      </main>
      <Footer1 />
    </>
  );
}
