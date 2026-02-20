"use client";

import { showToast } from "@/utlis/showToast";
import React, { useRef, useState } from "react";

const FALLBACK_EMAIL = "sales@bmrsuspension.com";

const SOCIAL_ICONS = [
  { key: "facebook", className: "social-facebook", iconClass: "icon-fb" },
  {
    key: "instagram",
    className: "social-instagram",
    iconClass: "icon-instagram",
  },
  { key: "youtube", className: "social-youtube", iconClass: "icon-youtube" },
  { key: "tiktok", className: "social-tiktok", iconClass: "icon-tiktok" },
  { key: "x", className: "social-x", iconClass: "icon-x" },
  { key: "linkedin", className: "social-linkedin", iconClass: "icon-linkedin" },
];

export default function ContactForm({ brand }) {
  const contact = brand?.contact || {};
  const social = brand?.social || {};
  const companyName = brand?.companyName || "BMR Suspension";
  const addressLines = contact.addressLines || [];
  const contactEmail = contact.email || FALLBACK_EMAIL;
  const phoneDisplay =
    contact.phoneDisplay || contact.phoneTel || "(813) 986-9302";
  const phoneTel = String(contact.phoneTel || "8139869302");
  const hours = contact.hours || "";
  const departments = Array.isArray(contact.departments)
    ? contact.departments
    : [];
  const mapsQuery = addressLines.length
    ? encodeURIComponent(addressLines.join(", "))
    : "1033+Pine+Chase+Ave+Lakeland+FL+33815";
  const mapsHref = `https://www.google.com/maps?q=${mapsQuery}`;
  const formRef = useRef();
  const [sending, setSending] = useState(false);

  const sendMail = async (e) => {
    e.preventDefault();
    const form = formRef.current;
    const name = form?.name?.value?.trim();
    const email = form?.email?.value?.trim();
    const message = form?.message?.value?.trim();
    if (!name || !email || !message) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        form.reset();
        showToast(
          "Thank you for reaching out! Your message has been sent to our team. We truly value every inquiry—your feedback and questions are very important to us. We'll get back to you as soon as possible.",
          "success",
          6000,
        );
      } else {
        showToast(
          data?.error ||
            `Something went wrong. Please try again or email us directly at ${contactEmail}.`,
          "error",
          5000,
        );
      }
    } catch {
      showToast(
        `We couldn't send your message. Please try again or email us directly at ${contactEmail}.`,
        "error",
        5000,
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="flat-spacing-21 contact-page-section">
      <div className="container">
        <div className="tf-grid-layout gap30 lg-col-2 contact-page-grid">
          <div className="tf-content-left contact-info-card">
            <h5 className="mb_20">{companyName}</h5>
            {addressLines.length > 0 && (
              <div className="contact-info-item mb_20">
                <p className="mb_15">
                  <strong>Address</strong>
                </p>
                <p>
                  <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                    {addressLines.map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < addressLines.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </a>
                </p>
              </div>
            )}
            {(phoneDisplay || phoneTel) && (
              <div className="contact-info-item mb_20">
                <p className="mb_15">
                  <strong>Phone</strong>
                </p>
                <p>
                  <a href={`tel:${phoneTel.replace(/\D/g, "")}`}>
                    {phoneDisplay || phoneTel}
                  </a>
                </p>
              </div>
            )}
            {contactEmail && (
              <div className="contact-info-item mb_20">
                <p className="mb_15">
                  <strong>Email</strong>
                </p>
                <p>
                  <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                </p>
              </div>
            )}
            {hours && (
              <div className="contact-info-item mb_20">
                <p className="mb_15">
                  <strong>Hours</strong>
                </p>
                <p>{hours}</p>
              </div>
            )}
            {departments.length > 0 && (
              <div className="contact-info-item mb_36">
                <p className="mb_15">
                  <strong>Departments</strong>
                </p>
                <ul
                  className="mb-0"
                  style={{ listStyle: "none", paddingLeft: 0 }}
                >
                  {departments.map((dept) => (
                    <li key={dept.email || dept.label}>
                      <a href={`mailto:${dept.email || ""}`}>{dept.label}</a>
                      {dept.email && (
                        <>
                          {" — "}
                          <a href={`mailto:${dept.email}`}>{dept.email}</a>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className={departments.length === 0 ? "mb_36" : ""}>
              <ul className="tf-social-icon d-flex gap-20 style-default">
                {SOCIAL_ICONS.filter((s) => social[s.key]).map((s) => (
                  <li key={s.key}>
                    <a
                      href={social[s.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`box-icon link round ${s.className} border-line-black`}
                      aria-label={`${companyName} ${s.key}`}
                    >
                      <i className={`icon fs-14 ${s.iconClass}`} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="tf-content-right contact-form-card">
            <h5 className="mb_20">Get in Touch</h5>
            <p className="mb_24">
              Questions about our suspension and chassis parts? Need help with
              your order or fitment? Send us a message and we&apos;ll get back
              to you soon.
            </p>
            <form
              ref={formRef}
              onSubmit={sendMail}
              className="form-contact"
              id="contactform"
            >
              <div className="d-flex gap-15 mb_15 flex-wrap">
                <fieldset className="w-100 flex-grow-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    placeholder="Name *"
                  />
                </fieldset>
                <fieldset className="w-100 flex-grow-1">
                  <input
                    type="email"
                    autoComplete="email"
                    name="email"
                    id="email"
                    required
                    placeholder="Email *"
                  />
                </fieldset>
              </div>
              <div className="mb_15">
                <textarea
                  placeholder="Message"
                  name="message"
                  id="message"
                  required
                  cols={30}
                  rows={8}
                  defaultValue=""
                />
              </div>
              <div className="send-wrap">
                <button
                  type="submit"
                  className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                  disabled={sending}
                >
                  {sending ? "Sending…" : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
