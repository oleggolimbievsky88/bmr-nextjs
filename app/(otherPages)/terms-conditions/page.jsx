import Footer1 from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <>
      <Topbar4 />
      <Header showVehicleSearch={false} />
      <PageHeader title="TERMS & CONDITIONS" />
      <section className="flat-spacing-25 terms-conditions-page">
        <div className="container">
          <div className="terms-conditions-page__grid">
            {/* Acceptance of Terms */}
            <article className="terms-conditions-page__card">
              <h2 className="terms-conditions-page__title">
                Acceptance of Terms
              </h2>
              <p className="terms-conditions-page__text">
                By accessing this website, you agree to be bound by these Terms
                and Conditions of Use, all applicable laws and regulations, and
                you accept responsibility for compliance with any applicable
                local laws. If you do not agree with any of these terms, you may
                not use or access this site. The materials on this website are
                protected by applicable copyright and trademark law.
              </p>
            </article>

            {/* Use License */}
            <article className="terms-conditions-page__card">
              <h2 className="terms-conditions-page__title">Use License</h2>
              <p className="terms-conditions-page__text">
                BMR Suspension grants you a limited, non-exclusive,
                non-transferable license to temporarily download one copy of the
                materials (information or software) on this website for
                personal, non-commercial viewing only. This is a license grant,
                not a transfer of title. Under this license you may not:
              </p>
              <ul className="terms-conditions-page__list">
                <li>Modify or copy the materials</li>
                <li>
                  Use the materials for any commercial purpose or for any public
                  display (commercial or non-commercial)
                </li>
                <li>
                  Attempt to decompile or reverse engineer any software
                  contained on this website
                </li>
                <li>
                  Remove any copyright or other proprietary notations from the
                  materials
                </li>
                <li>
                  Transfer the materials to another person or “mirror” the
                  materials on any other server
                </li>
              </ul>
              <p className="terms-conditions-page__text">
                This license terminates automatically if you violate any of
                these restrictions and may be terminated by BMR Suspension at
                any time. Upon termination, you must destroy any downloaded
                materials in your possession, whether in electronic or printed
                format.
              </p>
            </article>

            {/* Limitation of Liability */}
            <article className="terms-conditions-page__card">
              <h2 className="terms-conditions-page__title">
                Limitation of Liability
              </h2>
              <p className="terms-conditions-page__text">
                In no event shall BMR Suspension or its suppliers be liable for
                any damages (including, without limitation, damages for loss of
                data or profit, or due to business interruption) arising out of
                the use or inability to use the materials on this website, even
                if BMR Suspension or an authorized representative has been
                notified orally or in writing of the possibility of such damage.
              </p>
              <p className="terms-conditions-page__text terms-conditions-page__text--legal">
                Some jurisdictions do not allow limitations on implied
                warranties or limitations of liability for consequential or
                incidental damages. In such jurisdictions, these limitations may
                not apply to you.
              </p>
            </article>

            {/* Accuracy of Materials */}
            <article className="terms-conditions-page__card">
              <h2 className="terms-conditions-page__title">
                Accuracy of Materials
              </h2>
              <p className="terms-conditions-page__text">
                The materials appearing on this website may include technical,
                typographical, or photographic errors. BMR Suspension does not
                warrant that any of the materials on its website are accurate,
                complete, or current. BMR Suspension may make changes to the
                materials at any time without notice. BMR Suspension does not,
                however, make any commitment to update the materials.
              </p>
            </article>

            {/* Third-Party Links */}
            <article className="terms-conditions-page__card">
              <h2 className="terms-conditions-page__title">
                Third-Party Links
              </h2>
              <p className="terms-conditions-page__text">
                BMR Suspension has not reviewed all of the sites linked to this
                website and is not responsible for the contents of any such
                linked site. The inclusion of any link does not imply
                endorsement by BMR Suspension. Use of any such linked website is
                at your own risk.
              </p>
            </article>

            {/* Changes to These Terms */}
            <article className="terms-conditions-page__card">
              <h2 className="terms-conditions-page__title">
                Changes to These Terms
              </h2>
              <p className="terms-conditions-page__text">
                BMR Suspension may revise these terms of use for its website at
                any time without notice. By using this website, you agree to be
                bound by the then-current version of these Terms and Conditions
                of Use.
              </p>
            </article>

            {/* Governing Law */}
            <article className="terms-conditions-page__card">
              <h2 className="terms-conditions-page__title">Governing Law</h2>
              <p className="terms-conditions-page__text">
                Any claim relating to BMR Suspension’s website shall be governed
                by the laws of the State of Florida, without regard to its
                conflict of law provisions.
              </p>
            </article>

            {/* Payment Terms */}
            <article className="terms-conditions-page__card">
              <h2 className="terms-conditions-page__title">Payment Methods</h2>
              <p className="terms-conditions-page__text">
                We accept Visa, Mastercard, Discover, US Postal Service money
                orders, and PayPal.
              </p>
            </article>
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
