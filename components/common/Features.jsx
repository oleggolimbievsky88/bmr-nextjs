"use client";
import { iconBoxData } from "@/data/features";

export default function Features() {
  const assuranceItems = iconBoxData.slice(0, 4);

  return (
    <section className="assuranceBar">
      <div className="container">
        <div className="assuranceBar__grid">
          {assuranceItems.map((elm, i) => (
            <div key={i} className="assuranceBar__item">
              <div className="icon">
                <i className={elm.iconClass} />
              </div>
              <div className="assuranceBar__content">
                <div className="assuranceBar__title">{elm.title}</div>
                <p className="assuranceBar__desc">{elm.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
