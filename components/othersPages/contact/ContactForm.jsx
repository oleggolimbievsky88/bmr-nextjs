"use client";

import { socialLinksWithBorder } from "@/data/socials";
import React, { useRef, useState } from "react";

const BMR_CONTACT = {
  address: "1033 Pine Chase Ave",
  city: "Lakeland, FL 33815",
  phone: "(813) 986-9302",
  email: "sales@bmrsuspension.com",
  hours: "Mon–Fri 8:30am–6pm EST",
};

export default function ContactForm() {
  const formRef = useRef();
  const [success, setSuccess] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [sending, setSending] = useState(false);

  const handleShowMessage = (ok) => {
    setSuccess(ok);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 4000);
  };

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
        handleShowMessage(true);
      } else {
        handleShowMessage(false);
      }
    } catch {
      handleShowMessage(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="flat-spacing-21 contact-page-section">
      <div className="container">
        <div className="tf-grid-layout gap30 lg-col-2 contact-page-grid">
          <div className="tf-content-left contact-info-card">
            <h5 className="mb_20">Visit Us</h5>
            <div className="contact-info-item mb_20">
              <p className="mb_15">
                <strong>Address</strong>
              </p>
              <p>
                <a
                  href="https://www.google.com/maps?q=1033+Pine+Chase+Ave+Lakeland+FL+33815"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {BMR_CONTACT.address}
                  <br />
                  {BMR_CONTACT.city}
                </a>
              </p>
            </div>
            <div className="contact-info-item mb_20">
              <p className="mb_15">
                <strong>Phone</strong>
              </p>
              <p>
                <a href={`tel:${BMR_CONTACT.phone.replace(/\D/g, "")}`}>
                  {BMR_CONTACT.phone}
                </a>
              </p>
            </div>
            <div className="contact-info-item mb_20">
              <p className="mb_15">
                <strong>Email</strong>
              </p>
              <p>
                <a href={`mailto:${BMR_CONTACT.email}`}>{BMR_CONTACT.email}</a>
              </p>
            </div>
            <div className="contact-info-item mb_36">
              <p className="mb_15">
                <strong>Hours</strong>
              </p>
              <p>{BMR_CONTACT.hours}</p>
            </div>
            <div>
              <ul className="tf-social-icon d-flex gap-20 style-default">
                {socialLinksWithBorder.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`box-icon link round ${link.className} ${link.borderClass}`}
                    >
                      <i
                        className={`icon ${link.iconSize} ${link.iconClass}`}
                      />
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
              <div
                className={`tfSubscribeMsg ${showMessage ? "active" : ""}`}
                role="alert"
              >
                {success ? (
                  <p className="text-success">
                    Message sent successfully. We&apos;ll get back to you soon.
                  </p>
                ) : (
                  <p className="text-danger">
                    Something went wrong. Please try again or email us directly.
                  </p>
                )}
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
