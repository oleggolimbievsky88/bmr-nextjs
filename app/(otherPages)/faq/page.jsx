import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import FaqSection from "@/components/othersPages/faq/FaqSectionBootstrap";
import {
  faqsShopping,
  faqsPayment,
  faqsShipping,
  faqsReturns,
} from "@/data/faqs";
import React from "react";

function buildFaqJsonLd() {
  const allFaqs = [
    ...faqsShopping,
    ...faqsPayment,
    ...faqsShipping,
    ...faqsReturns,
  ];
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

export const metadata = {
  title: "FAQ | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description:
    "Frequently asked questions about BMR Suspension products, shipping, returns, and installation.",
};

const FAQ_SECTIONS = [
  {
    id: "shopping",
    title: "Shopping & product information",
    faqs: faqsShopping,
  },
  {
    id: "payment",
    title: "Payment",
    faqs: faqsPayment,
  },
  {
    id: "shipping",
    title: "Shipping",
    faqs: faqsShipping,
  },
  {
    id: "returns",
    title: "Returns & warranty",
    faqs: faqsReturns,
  },
];

function faqsWithIds(faqs, prefix) {
  return faqs.map((f, i) => ({ ...f, id: `${prefix}-${i}` }));
}

export default function FaqPage() {
  const faqJsonLd = buildFaqJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Topbar4 />
      <Header18 showVehicleSearch={false} />
      <PageHeader title="FAQ" />

      <section className="faq-page">
        <div className="faq-page__container container">
          <div className="faq-page__grid">
            <div className="faq-page__main">
              {FAQ_SECTIONS.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="faq-page__section"
                >
                  <h2 className="faq-page__section-title">{section.title}</h2>
                  <FaqSection
                    accordionId={`faq-${section.id}`}
                    faqs={faqsWithIds(section.faqs, section.id)}
                  />
                </div>
              ))}
            </div>
            <aside className="faq-page__sidebar">
              <div className="faq-page__contact-box">
                <h3 className="faq-page__contact-title">Have a question?</h3>
                <p className="faq-page__contact-text">
                  If you have an issue or question that requires immediate
                  assistance, you can click the button below to get in touch
                  with a helpful BMR tech or a BMR customer service
                  representative.
                </p>
                <button
                  type="button"
                  className="faq-page__contact-btn"
                  data-bs-toggle="modal"
                  data-bs-target="#contactModal"
                >
                  Contact us
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
