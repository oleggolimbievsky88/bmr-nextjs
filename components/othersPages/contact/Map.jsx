import React from "react";

const DEFAULT_MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14087.3158345182!2d-82.0514504!3d28.0297031!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88dd379b4a49ec59%3A0xb1d3701d31ca35bd!2sBMR%20Suspension!5e0!3m2!1sen!2sus!4v1697667031486!5m2!1sen!2sus";

export default function Map({ brand = null }) {
  const contact = brand?.contact || {};
  const embedUrl = contact.mapEmbedUrl || DEFAULT_MAP_EMBED;
  const addressLabel =
    (contact.addressLines || []).join(", ") ||
    "BMR Suspension - 1033 Pine Chase Ave, Lakeland, FL 33815";

  return (
    <section className="contact-map-section">
      <div className="container">
        <div className="contact-map-wrapper">
          <iframe
            title={`${brand?.companyName || "Contact"} - ${addressLabel}`}
            src={embedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="contact-map-iframe"
          />
        </div>
      </div>
    </section>
  );
}
