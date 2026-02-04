import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Delivery & Returns | BMR Suspension | Shipping & Return Policy",
  description:
    "BMR Suspension shipping options, delivery information, and return policy. Free shipping on qualifying orders. Contact us for support.",
};

export default function DeliveryReturnPage() {
  return (
    <>
      <Topbar4 />
      <Header18 showVehicleSearch={false} />
      <PageHeader title="DELIVERY & RETURN" />
      <section className="flat-spacing-25 delivery-return-page">
        <div className="container">
          <div className="delivery-return-page__grid">
            <div className="delivery-return-page__card">
              <h2 className="delivery-return-page__title">
                Shipping &amp; Delivery
              </h2>
              <ul className="delivery-return-page__list">
                <li>
                  We offer multiple shipping options at checkout so you can
                  choose the speed and cost that works for you.
                </li>
                <li>
                  Free shipping for qualifying orders over US $250 (lower 48
                  states; exclusions may apply).
                </li>
                <li>
                  All orders ship with tracking. You’ll receive tracking
                  information once your order ships.
                </li>
              </ul>
            </div>

            <div className="delivery-return-page__card">
              <h2 className="delivery-return-page__title">Returns</h2>
              <ul className="delivery-return-page__list">
                <li>
                  Items returned within 14 days of the original shipment date in
                  same-as-new condition are eligible for a full refund or store
                  credit.
                </li>
                <li>
                  Refunds are issued to the original form of payment used for
                  purchase.
                </li>
                <li>
                  The customer is responsible for return shipping costs.
                  Original shipping and handling fees are non-refundable.
                </li>
                <li>All sale items are final sale.</li>
              </ul>
            </div>

            <div className="delivery-return-page__card">
              <h2 className="delivery-return-page__title">Need Help?</h2>
              <p className="delivery-return-page__text">
                Questions about your order, shipping, or returns? Get in touch
                with the BMR team.
              </p>
              <div className="delivery-return-page__contact">
                <Link href="mailto:sales@bmrsuspension.com">
                  sales@bmrsuspension.com
                </Link>
                <a href="tel:8139869302">(813) 986-9302</a>
                <Link href="/contact">Contact us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
