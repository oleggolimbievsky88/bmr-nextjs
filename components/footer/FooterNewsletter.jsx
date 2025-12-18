"use client";
import { useState, useRef } from "react";

export default function FooterNewsletter() {
  const [showMessage, setShowMessage] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef(null);

  const handleShowMessage = () => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  const sendEmail = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    const email = e.target.email.value;

    try {
      const response = await fetch(
        "https://express-brevomail.vercel.app/api/contacts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      if ([200, 201].includes(response.status)) {
        e.target.reset(); // Reset the form
        setSuccess(true); // Set success state
        handleShowMessage();
      } else {
        setSuccess(false); // Handle unexpected responses
        handleShowMessage();
      }
    } catch (error) {
      console.error("Error:", error.message || "An error occurred");
      setSuccess(false); // Set error state
      handleShowMessage();
      e.target.reset(); // Reset the form
    }
  };

  return (
    <div className="footer-newsletter footer-col-block">
      <div className="footer-heading footer-heading-desktop">
        <h6>Sign Up for Email</h6>
      </div>
      <div className="footer-heading footer-heading-moblie">
        <h6>Sign Up for Email</h6>
      </div>
      <div className="tf-collapse-content">
        <div className="footer-menu_item">
          Sign up to get first dibs on new arrivals, sales, exclusive content,
          events and more!
        </div>
        <div className={`tfSubscribeMsg ${showMessage ? "active" : ""}`}>
          {success ? (
            <p style={{ color: "rgb(52, 168, 83)" }}>
              You have successfully subscribed.
            </p>
          ) : (
            <p style={{ color: "red" }}>Something went wrong</p>
          )}
        </div>
        <form
          ref={formRef}
          onSubmit={sendEmail}
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
                className="subscribe-email"
                placeholder="Enter your email...."
                tabIndex={0}
                aria-required="true"
                autoComplete="abc@xyz.com"
                suppressHydrationWarning
              />
            </fieldset>
            <div className="button-submit">
              <button
                className="subscribe-button tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn"
                type="submit"
              >
                Subscribe
                <i className="icon icon-arrow1-top-left" />
              </button>
            </div>
          </div>
          <div className="subscribe-msg" />
        </form>
      </div>
    </div>
  );
}
