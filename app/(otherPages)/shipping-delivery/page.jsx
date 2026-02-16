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
      <>
        {/* main-page */}
        <section className="flat-spacing-25">
          <div className="container">
            <div className="tf-main-area-page tf-page-delivery">
              <div className="box">
                <h4>Delivery</h4>
                <p>All orders shipped with UPS Express.</p>
                <p>Always free shipping for orders over US $250.</p>
                <p>All orders are shipped with a UPS tracking number.</p>
              </div>
              <div className="box">
                <h4>Returns</h4>
                <p>
                  All non-warranty returns must be made within 90 days from the
                  date of shipment and are subject to a 15% restocking fee,
                  excluding all shipping cost. BMR Suspension will not accept
                  returns on items that have been installed, used, modified or
                  damaged. All items must be received in the original packing
                  material and in the original condition as it was shipped. All
                  items damaged from shipping will be refused. BMR will issue a
                  Returned Material Authorization number for every return.
                  Returned goods will not be accepted without an RMA Number.
                  There are no refunds on shipping and handling charges and all
                  items must be sent prepaid. All returned goods sent freight
                  collect will be refused. If item is returned scratched, nicked
                  or damaged in any way, the cost to repair or re-powder coat
                  the item will be deducted from the amount of the refund. If
                  item is missing any components, the cost to replace these
                  components will be deducted from the amount of the refund.
                  Special order items cannot be returned.
                </p>
              </div>
              <div className="box">
                <h4>Help</h4>
                <p>
                  Give us a shout if you have any other questions and/or
                  concerns.
                </p>
                <p>
                  Email:
                  <a href="mailto:contact@domain.com" className="cf-mail">
                    contact@domain.com
                  </a>
                </p>
                <p>Phone: +1 (23) 456 789</p>
              </div>
            </div>
          </div>
        </section>
      </>

      <Footer1 />
    </>
  );
}
