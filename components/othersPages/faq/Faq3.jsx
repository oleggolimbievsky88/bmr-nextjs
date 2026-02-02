import Accordion from "@/components/common/Accordion";
import { faqsReturns } from "@/data/faqs";
import React from "react";

export default function Faq3() {
  return (
    <>
      <h5 id="order-returns" className="mb_24">Order Returns</h5>
      <div className="flat-accordion style-default has-btns-arrow">
        <Accordion faqs={faqsReturns} />
      </div>
    </>
  );
}
