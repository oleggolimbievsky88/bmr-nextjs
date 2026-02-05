import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <>
      <Topbar4 />
      <Header18 showVehicleSearch={false} />
      <PageHeader title="TERMS & CONDITIONS" />
      <section className="flat-spacing-25 terms-conditions-page">
        <div className="container">
          <div className="terms-conditions-page__grid">
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

            {/* Warranty */}
            <article className="terms-conditions-page__card">
              <h2 className="terms-conditions-page__title">Warranty</h2>
              <p className="terms-conditions-page__text">
                BMR products are warranted to the original purchaser against
                defects in materials and workmanship under normal use for two
                (2) years from the date of sale. Our obligation under this
                warranty is limited to replacement of the product; we do not
                cover reinstallation or other incidental costs. This warranty
                does not apply to products that have been misused, neglected,
                altered, damaged, or improperly installed, and normal wear is
                not considered a defect. Warranty claims are limited to
                replacement or credit for returned merchandise. Impact damage
                and damage to powder coat are specifically excluded.
              </p>
              <p className="terms-conditions-page__text">
                An RMA is required for all warranty returns. Replacement product
                is shipped at no charge via UPS Ground; upgraded shipping is
                available at the customer’s expense for the difference in cost.
              </p>
              <p className="terms-conditions-page__text">
                BMR products are designed for use with OEM and other BMR
                products. We do not warrant fitment with aftermarket products
                from other manufacturers, including suspension, exhaust,
                drivetrain, or other aftermarket components. Returns due to
                fitment issues with OEM or BMR products receive a full refund;
                returns due to fitment issues with other manufacturers’
                aftermarket products are subject to a 15% restocking fee.
              </p>
              <p className="terms-conditions-page__text terms-conditions-page__text--legal">
                Purchaser acknowledges that racing parts, equipment, and
                services manufactured and/or sold by BMR are used under varied
                conditions and that the suitability of any part for a particular
                application is solely the purchaser’s decision. BMR makes no
                warranties, express, implied, or written; there is no warranty
                of merchantability. BMR reserves the right to change designs or
                improve products without obligation to modify previously
                manufactured units. Buyer agrees to indemnify and hold BMR
                harmless from any claim, action, or demand arising from the
                buyer’s installation or use of products purchased from BMR.
              </p>
            </article>
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
