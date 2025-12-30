import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import React from "react";

export default function page() {
  return (
    <>
      <Topbar4 />
      <Header18 />
      <PageHeader title="Delivery & Return" />
      <>
        {/* main-page */}
        <section className="flat-spacing-25">
          <div className="container">
            <div className="tf-main-area-page tf-page-delivery">
              <div className="box">
                <h4>Delivery</h4>
                <ul className="tag-list">
                  <li>All orders shipped with UPS Express.</li>
                  <li>Always free shipping for orders over US $250.</li>
                  <li>All orders are shipped with a UPS tracking number.</li>
                </ul>
              </div>
              <div className="box">
                <h4>Returns</h4>
                <ul className="tag-list">
                  <li>
                    Items returned within 14 days of their original shipment
                    date in same as new condition will be eligible for a full
                    refund or store credit.
                  </li>
                  <li>
                    Refunds will be charged back to the original form of payment
                    used for purchase.
                  </li>
                  <li>
                    Customer is responsible for shipping charges when making
                    returns and shipping/handling fees of original purchase is
                    non-refundable.t
                  </li>
                  <li>All sale items are final purchases.</li>
                </ul>
              </div>
              <div className="box">
                <h4>Help</h4>
                <p>
                  Give us a shout if you have any other questions and/or
                  concerns.
                </p>
                <p className="text_black-2">Email: contact@domain.com</p>
                <p className="text_black-2">Phone: +1 (23) 456 789</p>
              </div>
            </div>
          </div>
        </section>
      </>

      <Footer1 />
    </>
  );
}
