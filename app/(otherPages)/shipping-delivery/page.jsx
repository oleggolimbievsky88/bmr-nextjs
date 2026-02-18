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
      <PageHeader title="SHIPPING & DELIVERY" />
      <section className="flat-spacing-25 terms-conditions-page">
        <div className="container">
          <div className="terms-conditions-page__grid">
            {/* Overview */}
            <article className="terms-conditions-page__card">
              <h2 className="terms-conditions-page__title">
                Shipping &amp; Delivery
              </h2>
              <ul className="terms-conditions-page__list">
                <li>
                  We offer multiple shipping options at checkout so you can
                  choose the speed and cost that works for you.
                </li>
                <li>
                  Free shipping is available on qualifying orders (lower 48
                  states; conditions and exclusions may apply). See checkout for
                  current offers.
                </li>
                <li>
                  All orders ship with tracking. You’ll receive tracking
                  information once your order ships.
                </li>
              </ul>
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
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
