import Footer1 from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar4 from "@/components/header/Topbar4";
import ContactForm from "@/components/othersPages/contact/ContactForm";
import Map from "@/components/othersPages/contact/Map";
import { pageMeta } from "@bmr/core/seo";
import { getBrandConfig } from "@/lib/brandConfig";
import React from "react";

export async function generateMetadata() {
  const brand = await getBrandConfig();
  const title = `Contact Us | ${brand.companyName} | Performance Suspension & Chassis Parts`;
  const email = brand.contact?.email || "sales@bmrsuspension.com";
  const description = `Contact ${brand.companyName} – High Performance Suspension & Chassis parts. Visit us or email ${email}.`;
  const { openGraph, twitter } = pageMeta({
    brand,
    path: "/contact",
    title,
    description,
  });
  return { title, description, openGraph, twitter };
}

export default async function ContactPage() {
  const brand = await getBrandConfig();
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
        <Map brand={brand} />
        <ContactForm brand={brand} />
      </main>
      <Footer1 />
    </>
  );
}
