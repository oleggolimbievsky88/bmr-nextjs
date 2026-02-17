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

            {/* Business Hours */}
            <article className="terms-conditions-page__card">
              <h2 className="terms-conditions-page__title">Business Hours</h2>
              <p className="terms-conditions-page__text">
                Our office is open Monday through Friday, 8:30 AM to 6:00 PM
                Eastern Time.
              </p>
              <p className="terms-conditions-page__text">
                You may place orders with BMR Suspension, Inc. by calling{" "}
                <a
                  href="tel:+18139869302"
                  className="terms-conditions-page__link"
                >
                  (813) 986-9302
                </a>{" "}
                during business hours. Orders may also be placed online through
                our secure store at{" "}
                <a
                  href="https://www.bmrsuspension.com"
                  className="terms-conditions-page__link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.bmrsuspension.com
                </a>
                , by email at{" "}
                <a
                  href="mailto:sales@bmrsuspension.com"
                  className="terms-conditions-page__link"
                >
                  sales@bmrsuspension.com
                </a>
                , or by fax at (813) 986-8055.
              </p>
            </article>

            {/* Tech Support */}
            <article className="terms-conditions-page__card">
              <h2 className="terms-conditions-page__title">
                Technical Support
              </h2>
              <p className="terms-conditions-page__text">
                Brand-specific technical support is available Monday through
                Friday, 8:30 AM to 6:00 PM Eastern Time. Contact us by phone at{" "}
                <a
                  href="tel:+18139869302"
                  className="terms-conditions-page__link"
                >
                  (813) 986-9302
                </a>{" "}
                or by email:
              </p>
              <ul className="terms-conditions-page__list">
                <li>
                  Ford applications:{" "}
                  <a
                    href="mailto:fordtech@bmrsuspension.com"
                    className="terms-conditions-page__link"
                  >
                    fordtech@bmrsuspension.com
                  </a>
                </li>
                <li>
                  GM applications:{" "}
                  <a
                    href="mailto:gmtech@bmrsuspension.com"
                    className="terms-conditions-page__link"
                  >
                    gmtech@bmrsuspension.com
                  </a>
                </li>
              </ul>
              <p className="terms-conditions-page__text">
                Installation instructions for most part numbers are available
                for download{" "}
                <Link
                  href="/installation"
                  className="terms-conditions-page__link"
                >
                  here
                </Link>
                .
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

            {/* Returns - Non-Warranty */}
            <article className="terms-conditions-page__card">
              <h2 className="terms-conditions-page__title">
                Returns — Non-Warranty Items
              </h2>
              <p className="terms-conditions-page__text">
                Non-warranty returns must be initiated within 90 days of the
                shipment date and are subject to a 15% restocking fee (shipping
                costs are non-refundable). BMR Suspension does not accept
                returns on items that have been installed, used, modified, or
                damaged.
              </p>
              <p className="terms-conditions-page__text">
                Items must be returned in their original packaging and in the
                same condition as shipped. Shipment-damaged items will not be
                accepted. A Returned Material Authorization (RMA) number is
                required for all returns; returns received without an RMA will
                be refused. Shipping and handling charges are non-refundable,
                and all returns must be sent prepaid; freight-collect shipments
                will be refused.
              </p>
              <p className="terms-conditions-page__text">
                If returned items are scratched, nicked, or otherwise damaged,
                repair or re-powder-coating costs will be deducted from the
                refund. If components are missing, replacement costs will be
                deducted. Special-order items are not eligible for return.
              </p>
            </article>

            {/* Shipping */}
            <article className="terms-conditions-page__card">
              <h2 className="terms-conditions-page__title">Shipping</h2>
              <p className="terms-conditions-page__text">
                In-stock orders placed by 3:00 PM Eastern Time ship the same
                business day. BMR Suspension, Inc. ships via UPS Ground unless
                otherwise specified. UPS Next Day Air, 2nd Day Air, and 3-Day
                Select are offered only for in-stock items at the time of order.
                Shipments to Canada, Hawaii, and Alaska may be sent via US
                Postal Service when requested in advance. We do not use other
                small-package carriers.
              </p>
              <p className="terms-conditions-page__text">
                Unauthorized refusal of a shipment may result in charges for
                original shipping, return shipping, and a restocking fee.
              </p>
            </article>

            {/* Shortages and Incorrect Shipments */}
            <article className="terms-conditions-page__card">
              <h2 className="terms-conditions-page__title">
                Shortages and Incorrect Shipments
              </h2>
              <p className="terms-conditions-page__text">
                If BMR ships the wrong product (e.g., wrong color, part, or
                size), we will replace it with the correct product at no charge.
                If a shortage is found, missing components will be supplied at
                no charge. Incorrect or short shipments must be reported within
                fourteen (14) days of receipt; reports after that period may
                result in the customer bearing a portion of the replacement
                cost.
              </p>
              <p className="terms-conditions-page__text">
                Replacements are shipped at no charge using the same method as
                the original order. Upgrades (e.g., Next Day Air) are available
                at the customer’s expense for the difference in shipping cost.
                If the order is cancelled, a 15% restocking fee applies.
                Replacement product will not ship until the incorrect or excess
                product has been returned.
              </p>
            </article>

            {/* International Orders */}
            <article className="terms-conditions-page__card">
              <h2 className="terms-conditions-page__title">
                International Orders
              </h2>
              <p className="terms-conditions-page__text">
                All international orders must be paid in full in US funds.
                Orders over $1,000 USD must be prepaid by wire transfer; orders
                under $1,000 may be paid by credit card or wire transfer.
                International shipments are sent via UPS or truck freight;
                Canadian orders may ship via US Postal Service when requested in
                advance.
              </p>
              <p className="terms-conditions-page__text">
                The buyer is responsible for all shipping costs, which must be
                prepaid. International shipments are fully insured and declared
                at full value. Duties and taxes are the responsibility of the
                customer and must be paid to the appropriate authorities.
              </p>
            </article>
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
