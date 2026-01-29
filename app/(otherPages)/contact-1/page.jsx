import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import ContactForm from "@/components/othersPages/contact/ContactForm";
import Map from "@/components/othersPages/contact/Map";
import React from "react";

export const metadata = {
  title: "Contact Us | BMR Suspension | Performance Suspension & Chassis Parts",
  description:
    "Contact BMR Suspension – High Performance Suspension & Chassis parts. Visit us in Lakeland, FL or email sales@bmrsuspension.com.",
};
export default function ContactPage() {
  return (
    <>
      <Topbar4 />
      <Header18 showVehicleSearch={false} />
      <PageHeader title="CONTACT US" />
      <main className="contact-1-page">
        <Map />
        <ContactForm />
      </main>
      <Footer1 />
    </>
  );
}
