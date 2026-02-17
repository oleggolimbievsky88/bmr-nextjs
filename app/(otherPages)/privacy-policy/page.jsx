import Footer1 from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import React from "react";

export default function page() {
  return (
    <>
      <Topbar4 />
      <Header showVehicleSearch={false} />
      <PageHeader title="PRIVACY POLICY" />
      <section className="flat-spacing-25 privacy-policy-page">
        <div className="container">
          <div className="privacy-policy-page__grid">
            {/* Intro */}
            <article className="privacy-policy-page__card">
              <h1 className="privacy-policy-page__main-title">
                BMR Suspension Privacy Policy
              </h1>
              <p className="privacy-policy-page__text">
                This Privacy Policy explains how we collect, use, and share your
                personal information when you visit or make a purchase from our
                store. Your privacy is very important to us. Accordingly, we
                have developed this Policy in order for you to understand how we
                collect, use, communicate, disclose, and make use of personal
                information. The following outlines our privacy policy.
              </p>
            </article>

            {/* Our principles */}
            <article className="privacy-policy-page__card">
              <h2 className="privacy-policy-page__title">
                Our privacy principles
              </h2>
              <ul className="privacy-policy-page__list">
                <li>
                  Before or at the time of collecting personal information, we
                  will identify the purposes for which information is being
                  collected.
                </li>
                <li>
                  We will collect and use personal information solely with the
                  objective of fulfilling those purposes specified by us and for
                  other compatible purposes, unless we obtain the consent of the
                  individual concerned or as required by law.
                </li>
                <li>
                  We will only retain personal information as long as necessary
                  for the fulfillment of those purposes.
                </li>
                <li>
                  We will collect personal information by lawful and fair means
                  and, where appropriate, with the knowledge or consent of the
                  individual concerned.
                </li>
                <li>
                  Personal data should be relevant to the purposes for which it
                  is to be used, and, to the extent necessary for those
                  purposes, should be accurate, complete, and up-to-date.
                </li>
                <li>
                  We will protect personal information by reasonable security
                  safeguards against loss or theft, as well as unauthorized
                  access, disclosure, copying, use or modification.
                </li>
                <li>
                  We will make readily available to customers information about
                  our policies and practices relating to the management of
                  personal information.
                </li>
                <li>
                  We are committed to conducting our business in accordance with
                  these principles in order to ensure that the confidentiality
                  of personal information is protected and maintained.
                </li>
              </ul>
            </article>

            {/* How we use your information */}
            <article className="privacy-policy-page__card">
              <h2 className="privacy-policy-page__title">
                How we use your information
              </h2>
              <p className="privacy-policy-page__text">
                We may use your personal information to:
              </p>
              <ul className="privacy-policy-page__list">
                <li>Process your transactions and provide customer service.</li>
                <li>Send you a newsletter, if you have subscribed to one.</li>
                <li>Respond to your customer service requests.</li>
              </ul>
            </article>
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
