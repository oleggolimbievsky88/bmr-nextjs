import Footer1 from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import FaqSection from "@/components/othersPages/faq/FaqSectionBootstrap";
import Link from "next/link";
import React from "react";
import { getBrandConfig } from "@/lib/brandConfig";
import { getBrandFaqs, getBrandFaqSections } from "@/lib/brandQueries";

/** Fallback section titles when no sections are defined in the database. */
const DEFAULT_SECTION_TITLES = {
  shopping: "Shopping & product information",
  payment: "Payment",
  shipping: "Shipping",
  returns: "Returns & warranty",
  general: "General",
};

/**
 * Group FAQs by section. Uses DB sections for order and titles when present;
 * otherwise uses default keys and titles.
 */
function groupFaqsBySection(faqs, dbSections = []) {
  const bySection = {};
  for (const faq of faqs) {
    const sectionKey = faq.section || "general";
    if (!bySection[sectionKey]) bySection[sectionKey] = [];
    bySection[sectionKey].push({
      id: `faq-${faq.id}-${bySection[sectionKey].length}`,
      title: faq.question,
      content: faq.answer,
    });
  }
  const sectionOrder =
    dbSections.length > 0
      ? dbSections.map((s) => s.sectionKey)
      : ["shopping", "payment", "shipping", "returns", "general"];
  const getTitle = (key) => {
    const fromDb = dbSections.find((s) => s.sectionKey === key);
    if (fromDb?.title) return fromDb.title;
    return DEFAULT_SECTION_TITLES[key] || key;
  };
  return sectionOrder
    .filter((key) => bySection[key]?.length)
    .map((key) => ({
      id: key,
      title: getTitle(key),
      faqs: bySection[key],
    }));
}

function buildFaqJsonLd(faqSections) {
  const allFaqs = faqSections.flatMap((s) => s.faqs);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.title,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.content,
      },
    })),
  };
}

export async function generateMetadata() {
  const config = await getBrandConfig();
  const siteName = config?.name || "BMR Suspension";
  return {
    title: `FAQ | ${siteName}`,
    description:
      config?.defaultDescription?.slice(0, 160) ||
      "Frequently asked questions about our products, shipping, returns, and installation.",
  };
}

export default async function FaqPage() {
  const config = await getBrandConfig();
  const brandKey = config?.key || "bmr";
  const [faqs, dbSections] = await Promise.all([
    getBrandFaqs(brandKey),
    getBrandFaqSections(brandKey),
  ]);
  const faqSections = groupFaqsBySection(faqs, dbSections);
  const faqJsonLd = buildFaqJsonLd(faqSections);
  const contactText =
    brandKey === "bmr"
      ? "If you have an issue or question that requires immediate assistance, you can click the button below to get in touch with a helpful BMR tech or a BMR customer service representative."
      : "If you have an issue or question that requires immediate assistance, you can click the button below to get in touch with our tech or customer service team.";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Topbar4 />
      <Header showVehicleSearch={false} />
      <PageHeader title="FAQ" />

      <section className="faq-page">
        <div className="faq-page__container container">
          <div className="faq-page__grid">
            <div className="faq-page__main">
              {faqSections.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="faq-page__section"
                >
                  <h2 className="faq-page__section-title">{section.title}</h2>
                  <FaqSection
                    accordionId={`faq-${section.id}`}
                    faqs={section.faqs}
                  />
                </div>
              ))}
            </div>
            <aside className="faq-page__sidebar">
              <div className="faq-page__contact-box">
                <h3 className="faq-page__contact-title">Have a question?</h3>
                <p className="faq-page__contact-text">{contactText}</p>
                <Link
                  href="/contact"
                  className="faq-page__contact-btn"
                  style={{ display: "inline-block", textDecoration: "none" }}
                >
                  Contact us
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
