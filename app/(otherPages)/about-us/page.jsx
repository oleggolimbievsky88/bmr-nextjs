import { getBrandConfig } from "@/lib/brandConfig";
import Footer1 from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import AboutPageContent from "@/components/othersPages/about/AboutPageContent";
import React from "react";

export async function generateMetadata() {
  const config = await getBrandConfig();
  const name = config.companyName || config.name || "Us";
  const title = config.defaultTitle || "";
  return {
    title: `About ${config.companyNameShort || name} | ${title.split("|")[1]?.trim() || name}`,
    description: config.defaultDescription || "",
  };
}

export default async function page() {
  const config = await getBrandConfig();
  const hasAboutBrand =
    config.aboutBrand &&
    Array.isArray(config.aboutBrand.paragraphs) &&
    config.aboutBrand.paragraphs.length > 0;
  const pageTitle = hasAboutBrand
    ? `ABOUT ${(config.companyNameShort || config.companyName || "").toUpperCase()}`
    : "ABOUT BMR";

  return (
    <>
      <Topbar4 />
      <Header showVehicleSearch={true} />
      <PageHeader title={pageTitle} />
      <AboutPageContent />
      <Footer1 />
    </>
  );
}
