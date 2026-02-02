import { socialLinksWithBorder } from "@/data/socials";
import React from "react";

export default function Map2() {
  return (
    <section className="flat-spacing-9 contact-map-section">
      <div className="container">
        <div className="tf-grid-layout gap-30 lg-col-2">
          <div className="contact-info">
            <h4 className="mb_20 bold-font">BMR Suspension</h4>
            <div className="mb_20">
              <p className="mb_15">
                <strong>Address</strong>
              </p>
              <p>
                1033 Pine Chase Ave <br />
                Lakeland, FL 33815
              </p>
            </div>
            <div className="mb_20">
              <p className="mb_15">
                <strong>Phone</strong>
              </p>
              <p>(813) 986-9302</p>
            </div>
            <div className="mb_20">
              <p className="mb_15">
                <strong>Email</strong>
              </p>
              <p>sales@bmrsuspension.com</p>
            </div>
            <div className="mb_36">
              <p className="mb_15">
                <strong>Hours of Operation</strong>
              </p>
              <p className="mb_15">Monday - Friday: 8:30AM - 5:30PM EST</p>
              <p>Saturday - Sunday: Closed</p>
            </div>
            <div>
              <ul className="tf-social-icon d-flex gap-20 style-default">
                {socialLinksWithBorder.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
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
          <div className="contact-map-wrapper">
            <iframe
              width="100%"
              height={500}
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14087.3158345182!2d-82.0514504!3d28.0297031!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88dd379b4a49ec59%3A0xb1d3701d31ca35bd!2sBMR%20Suspension!5e0!3m2!1sen!2sus!4v1697667031486!5m2!1sen!2sus"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
