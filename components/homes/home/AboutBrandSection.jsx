"use client";

import { useBrand } from "@bmr/ui/brand";
import Image from "next/image";
import Link from "next/link";
import styles from "./AboutBrandSection.module.scss";

/**
 * Renders the "About [Brand]" block only when the brand has aboutBrand config (e.g. Control Freak).
 * Place at bottom of home page and reuse aboutBrand content on the about-us page.
 */
export default function AboutBrandSection() {
  const brand = useBrand();
  const about = brand?.aboutBrand;

  if (
    !about ||
    !Array.isArray(about.paragraphs) ||
    about.paragraphs.length === 0
  ) {
    return null;
  }

  const logoUrl = brand?.logo?.headerUrl || brand?.logo?.footerUrl;
  const logoAlt = brand?.logo?.alt || `${brand?.companyName || "Brand"} Logo`;

  return (
    <section
      className={styles.aboutBrand}
      aria-labelledby="about-brand-heading"
    >
      {/* Black block: logo, heading, paragraphs, CTA */}
      <div className={styles.aboutBrand__block}>
        <div className={styles.aboutBrand__inner}>
          {logoUrl && (
            <div className={styles.aboutBrand__logo}>
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={180}
                height={72}
                className={styles.aboutBrand__logoImg}
                unoptimized={logoUrl.startsWith("/") ? false : true}
              />
            </div>
          )}
          <h2 id="about-brand-heading" className={styles.aboutBrand__heading}>
            {about.heading}
          </h2>
          <div className={styles.aboutBrand__content}>
            {about.paragraphs.map((p, i) => (
              <p key={i} className={styles.aboutBrand__text}>
                {p}
              </p>
            ))}
          </div>
          {about.ctaLabel && about.ctaHref && (
            <Link href={about.ctaHref} className={styles.aboutBrand__cta}>
              {about.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
