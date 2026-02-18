"use client";

import { useBrand } from "@bmr/ui/brand";
import About from "./About";
import Features from "./Features";
import AboutBrandSection from "@/components/homes/home/AboutBrandSection";

/**
 * Renders brand-appropriate about content: AboutBrandSection when brand has aboutBrand (e.g. Control Freak), else BMR About + Features.
 */
export default function AboutPageContent() {
  const brand = useBrand();
  const hasAboutBrand =
    brand?.aboutBrand &&
    Array.isArray(brand.aboutBrand.paragraphs) &&
    brand.aboutBrand.paragraphs.length > 0;

  if (hasAboutBrand) {
    return <AboutBrandSection />;
  }

  return (
    <>
      <About />
      <Features />
    </>
  );
}
