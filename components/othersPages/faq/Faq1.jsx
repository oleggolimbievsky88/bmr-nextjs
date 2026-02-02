import Accordion from "@/components/common/Accordion";
import { faqsShopping } from "@/data/faqs";
import React from "react";

export default function Faq1() {
  return (
    <>
      <h5 id="shopping-information" className="mb_24">Shopping Information</h5>
      <div className="flat-accordion style-default has-btns-arrow mb_60">
        <Accordion faqs={faqsShopping} />
      </div>
    </>
  );
}
