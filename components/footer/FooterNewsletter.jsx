"use client";
import { useRef, useState } from "react";

import { showToast } from "@/utlis/showToast";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FooterNewsletter({ formOnly = false }) {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [showMessage, setShowMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messageTimeoutRef = useRef(null);
  const messageClassName = showMessage
    ? "tfSubscribeMsg active"
    : "tfSubscribeMsg";
  const subscribeButtonClass = [
    "subscribe-button",
    "tf-btn",
    "btn-sm",
    "radius-3",
    "btn-fill",
    "btn-icon",
    "animate-hover-btn",
  ].join(" ");

  const showInlineMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setShowMessage(true);

    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const email = (event.target.email.value || "").trim().toLowerCase();

    if (!EMAIL_PATTERN.test(email)) {
      showToast("Please enter a valid email address.", "error");
      showInlineMessage("Please enter a valid email address.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      const status = payload?.status;

      if (response.ok && status === "exists") {
        showToast("You are already subscribed.", "info");
        showInlineMessage("You are already subscribed.", "info");
      } else if (response.ok) {
        showToast(
          "You're subscribed! Check your inbox for a confirmation email.",
          "success",
          5000,
        );
        showInlineMessage(
          "You're subscribed! Check your inbox for a confirmation email.",
          "success",
        );
        event.target.reset();
      } else {
        showToast(payload?.error || "Something went wrong.", "error");
        showInlineMessage("Something went wrong.", "error");
      }
    } catch (error) {
      console.error("Newsletter signup error:", error);
      showToast("Something went wrong. Please try again.", "error");
      showInlineMessage("Something went wrong.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageColor =
    messageType === "success"
      ? "rgb(52, 168, 83)"
      : messageType === "info"
        ? "rgb(13, 202, 240)"
        : "red";

  const formContent = (
    <>
      <div className={messageClassName}>
        {message ? <p style={{ color: messageColor }}>{message}</p> : null}
      </div>
      <form
        onSubmit={handleSubmit}
        className="form-newsletter subscribe-form"
        action="#"
        method="post"
        acceptCharset="utf-8"
        data-mailchimp="true"
      >
        <div className="subscribe-content">
          <fieldset className="email">
            <input
              required
              type="email"
              name="email"
              className="subscribe-email radius-10"
              placeholder="Enter your email...."
              tabIndex={0}
              aria-required="true"
              autoComplete="email"
              suppressHydrationWarning
            />
          </fieldset>
          <div className="button-submit">
            <button
              className={`${subscribeButtonClass} radius-10`}
              type="submit"
              disabled={isSubmitting}
            >
              Subscribe
              <i className="icon icon-arrow1-top-left" />
            </button>
          </div>
        </div>
        <div className="subscribe-msg" />
      </form>
    </>
  );

  if (formOnly) {
    return <div className="siteFooter__newsletterForm">{formContent}</div>;
  }

  return (
    <div className="footer-newsletter footer-col-block">
      <div className="footer-heading footer-heading-desktop">
        <h6 style={{ color: "red" }}>Get the Latest Performance Updates</h6>
      </div>
      <div className="footer-heading footer-heading-moblie">
        <h6 style={{ color: "red" }}>Get the Latest Performance Updates</h6>
      </div>
      <div className="tf-collapse-content">
        <div className="footer-menu_item">
          Sign up to get first dibs on new arrivals, sales, exclusive content,
          events and more!
        </div>
        {formContent}
      </div>
    </div>
  );
}
