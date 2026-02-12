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
              <h2 className="delivery-return-page__title">Returns</h2>
              <ul className="delivery-return-page__list">
                <p>
                  All non-warranty returns must be made within 90 days from the
                  date of shipment and are subject to a 15% restocking fee,
                  excluding all shipping cost. BMR Suspension will not accept
                  returns on items that have been installed, used, modified or
                  damaged. All items must be received in the original packing
                  material and in the original condition as it was shipped. All
                  items damaged from shipping will be refused.
                  <br /> <br /> BMR will issue a Returned Material Authorization
                  number for every return. Returned goods will not be accepted
                  without an RMA Number. There are no refunds on shipping and
                  handling charges and all items must be sent prepaid. All
                  returned goods sent freight collect will be refused. If item
                  is returned scratched, nicked or damaged in any way, the cost
                  to repair or re-powder coat the item will be deducted from the
                  amount of the refund. If item is missing any components, the
                  cost to replace these components will be deducted from the
                  amount of the refund. Special order items cannot be returned.
                </p>
              </ul>
            </div>


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
                  Free shipping is available on qualifying orders (lower 48
                  states; conditions and exclusions may apply). See checkout for
                  current offers.
                </li>
                <li>
                  All orders ship with tracking. You’ll receive tracking
                  information once your order ships.
                </li>
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
