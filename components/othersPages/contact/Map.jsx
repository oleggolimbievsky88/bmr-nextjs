import React from "react";

export default function Map() {
  return (
    <div className="w-100">
      <iframe
        style={{ border: "1px solid #818181" }}
        width={755}
        height={550}
        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14087.3158345182!2d-82.0514504!3d28.0297031!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88dd379b4a49ec59%3A0xb1d3701d31ca35bd!2sBMR%20Suspension!5e0!3m2!1sen!2sus!4v1697667031486!5m2!1sen!2sus"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
