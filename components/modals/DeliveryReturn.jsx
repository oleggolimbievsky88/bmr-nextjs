import Link from "next/link";
import React from "react";

export default function DeliveryReturn() {
  return (
    <div
      className="modal modalCentered fade modalDemo tf-product-modal modal-part-content"
      id="delivery_return"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <div className="demo-title">Shipping &amp; Delivery</div>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div className="overflow-y-auto">
            <div className="tf-product-popup-delivery">
              <div className="title">Delivery</div>
              <p className="text-paragraph">
                We offer multiple shipping options at checkout so you can choose
                the speed and cost that works for you.
              </p>
              <p className="text-paragraph">
                All orders ship with tracking. You’ll receive tracking
                information once your order ships.
              </p>
            </div>
            <div className="tf-product-popup-delivery">
              <div className="title">Returns</div>
              <p className="text-paragraph">
                90 day return policy.
              </p>
              <p className="text-paragraph">
                Refunds are issued to the original form of payment. The customer
                is responsible for return shipping; original shipping and
                handling fees are non-refundable.
              </p>
              <p className="text-paragraph">All sale items are final sale.</p>
            </div>
            <div className="tf-product-popup-delivery">
              <div className="title">Help</div>
              <p className="text-paragraph">
                Questions? Get in touch with the BMR team.
              </p>
              <p className="text-paragraph mb-0">
                Email:{" "}
                <a href="mailto:sales@bmrsuspension.com">
                  sales@bmrsuspension.com
                </a>
                {" · "}
                Phone: <a href="tel:8139869302">(813) 986-9302</a>
                {" · "}
                <Link href="/contact">Contact us</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
