import Footer1 from "@/components/footer/Footer";
import Header from "@/components/header/Header";
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
      <Header showVehicleSearch={false} />
      <PageHeader title="DELIVERY & RETURN" />
      <section className="flat-spacing-25 delivery-return-page">
        <div className="container">
          <div className="delivery-return-page__grid">
            <div className="delivery-return-page__card">
              <h2 className="delivery-return-page__title">Returns</h2>
              <div
                className="delivery-return-page__callout"
                style={{
                  background: "#fff5f5",
                  border: "1px solid #dc3545",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  marginBottom: "16px",
                  fontWeight: 600,
                  color: "#1a1a1a",
                }}
              >
                90-day return policy, subject to 15% restocking fee.
              </div>
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
              <h2 className="delivery-return-page__title">Warranty</h2>
              <p className="delivery-return-page__text">
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
              <p className="delivery-return-page__text">
                An RMA is required for all warranty returns. Replacement product
                is shipped at no charge via UPS Ground; upgraded shipping is
                available at the customer’s expense for the difference in cost.
              </p>
              <p className="delivery-return-page__text">
                BMR products are designed for use with OEM and other BMR
                products. We do not warrant fitment with aftermarket products
                from other manufacturers, including suspension, exhaust,
                drivetrain, or other aftermarket components. Returns due to
                fitment issues with OEM or BMR products receive a full refund;
                returns due to fitment issues with other manufacturers’
                aftermarket products are subject to a 15% restocking fee.
              </p>
              <p className="delivery-return-page__text delivery-return-page__text--legal">
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
