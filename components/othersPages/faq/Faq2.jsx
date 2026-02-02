import Accordion from "@/components/common/Accordion";
import { faqsPayment } from "@/data/faqs";
import React from "react";

export default function Faq2() {
  return (
    <>
      <h5 id="payment-information" className="mb_24">Payment Information</h5>
      <div className="flat-accordion style-default has-btns-arrow mb_60">
        <Accordion faqs={faqsPayment} />
      </div>
    </>
  );
}
