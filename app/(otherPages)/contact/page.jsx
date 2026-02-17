import Footer1 from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar4 from "@/components/header/Topbar4";
import ContactForm from "@/components/othersPages/contact/ContactForm";
import Map from "@/components/othersPages/contact/Map";
import { pageMeta } from "@bmr/core/seo";
import { brand } from "@/src/brand";
import React from "react";

const title = `Contact Us | ${brand.companyName} | Performance Suspension & Chassis Parts`;
const description = `Contact ${brand.companyName} – High Performance Suspension & Chassis parts. Visit us in Lakeland, FL or email sales@bmrsuspension.com.`;

const { openGraph, twitter } = pageMeta({
  brand,
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
      <div>
        <div
          className="container text-center"
          style={{ padding: "30px 0 0px 0" }}
        >
          <div className="home-title d-inline-block">Contact Us</div>
        </div>
      </div>
      <main className="contact-1-page">
        <Map />
        <ContactForm />
      </main>
      <Footer1 />
    </>
  );
}
