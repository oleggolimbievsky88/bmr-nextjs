import Footer1 from "@/components/footer/Footer";
import Header18 from "@/components/header/Header18";
import PageHeader from "@/components/header/PageHeader";
import Topbar4 from "@/components/header/Topbar4";
import Faq1 from "@/components/othersPages/faq/Faq1";
import Faq2 from "@/components/othersPages/faq/Faq2";
import Faq3 from "@/components/othersPages/faq/Faq3";
import React from "react";
import Link from "next/link";
export const metadata = {
  title: "FAQ | BMR Suspension - Performance Racing Suspension & Chassis Parts",
  description: "BMR Suspension - Performance Racing Suspension & Chassis Parts",
};
export default function page() {
  return (
    <>
      <Topbar4 />
      <Header18 showVehicleSearch={false} />
      <PageHeader title="FAQ" />
      <>
        {/* FAQ */}
        <section className="flat-spacing-11">
          <div className="container">
            <div className="tf-accordion-wrap d-flex justify-content-between">
              <div className="content">
                <Faq1 />
                <Faq2 />
                <Faq3 />
              </div>
              <div className="box tf-other-content radius-10 bg_grey-8">
                <h5 className="mb_20">Have a question</h5>
                <p className="text_black-2 mb_40">
                  If you have an issue or question that requires immediate
                  assistance, you can click the button below to chat live with a
                  Customer Service representative.
                  <br />
                  <br />
                  Please allow 06 - 12 business days from the time your package
                  arrives back to us for a refund to be issued.
                </p>
                <div className="d-flex gap-20 align-items-center">
                  <Link
                    href={`/contact`}
                    className="tf-btn radius-3 btn-fill animate-hover-btn justify-content-center"
                  >
                    Contact us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>

      <Footer1 />
    </>
  );
}
