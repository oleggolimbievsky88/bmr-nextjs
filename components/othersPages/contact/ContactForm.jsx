"use client";

import { socialLinksWithBorder } from "@/data/socials";
import { showToast } from "@/utlis/showToast";
import React, { useRef, useState } from "react";

const BMR_CONTACT = {
  address: "1033 Pine Chase Ave",
  city: "Lakeland, FL 33815",
  phone: "(813) 986-9302",
  email: "sales@bmrsuspension.com",
  hours: "Mon–Fri 8:30am–5:30pm EST",
};

export default function ContactForm() {
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
          6000
        );
      } else {
        showToast(
          data?.error ||
            "Something went wrong. Please try again or email us directly at sales@bmrsuspension.com.",
          "error",
          5000
        );
      }
    } catch {
      showToast(
        "We couldn't send your message. Please try again or email us directly at sales@bmrsuspension.com.",
        "error",
        5000
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
            <h5 className="mb_20">BMR Suspension</h5>
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
