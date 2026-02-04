import React from "react";

export default function FaqSection({ faqs, accordionId = "faqAccordion" }) {
  return (
    <div className="accordion faq-accordion" id={accordionId}>
      {faqs.map((faq, index) => (
        <div className="faq-accordion__item" key={faq.id}>
          <div className="faq-accordion__header" id={`heading-${faq.id}`}>
            <button
              className={`faq-accordion__btn ${index === 0 ? "" : "collapsed"}`}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#collapse-${faq.id}`}
              aria-expanded={index === 0 ? "true" : "false"}
              aria-controls={`collapse-${faq.id}`}
            >
              <span className="faq-accordion__btn-text">{faq.title}</span>
              <span className="faq-accordion__btn-icon" aria-hidden="true" />
            </button>
          </div>
          <div
            id={`collapse-${faq.id}`}
            className={`collapse faq-accordion__collapse ${
              index === 0 ? "show" : ""
            }`}
            aria-labelledby={`heading-${faq.id}`}
            data-bs-parent={`#${accordionId}`}
          >
            <div className="faq-accordion__body">{faq.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
