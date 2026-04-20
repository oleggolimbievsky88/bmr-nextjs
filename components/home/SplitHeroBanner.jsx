"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./SplitHeroBanner.module.css";

/**
 * Split hero: dark textured upper area + white lower band + overlapping product image.
 * `section` is one item from brand homepageSections (type splitHero).
 */
export default function SplitHeroBanner({ section, brand }) {
  if (!section || section.type !== "splitHero") return null;

  const accent = brand?.buttonBadgeColor || brand?.themeColor || "#b41818";
  const onAccent = brand?.buttonBadgeTextColor || "#ffffff";
  const navLabels = brand?.navLabels || {};
  const navUrls = brand?.navUrls || {};
  const topLinks = [
    { label: navLabels.ford || "FORD KITS", href: navUrls.ford || "/products/ford" },
    {
      label: navLabels.mopar || "MOPAR KITS",
      href: navUrls.mopar || "/products/mopar",
    },
    {
      label: navLabels.universal || "UNIVERSAL KITS",
      href: navUrls.universal || "/products/universal",
    },
  ];

  const texture = section.textureImagePath || "";
  const img = section.imagePath || "";
  const ctaHref = section.ctaHref || "/products/universal";

  return (
    <section className={styles.wrap} aria-label={section.headline || "Hero"}>
      {texture ? (
        <div
          className={styles.textureLayer}
          style={{ backgroundImage: `url("${texture.replace(/"/g, "")}")` }}
        />
      ) : null}

      <div className={styles.grid}>
        <div className={styles.darkPane}>
          <div className={styles.kicker}>
            {topLinks.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>
          {section.headline ? (
            <h1 className={styles.headline}>{section.headline}</h1>
          ) : null}
          {section.subheadline ? (
            <p className={styles.subhead}>{section.subheadline}</p>
          ) : null}
          {section.body ? <p className={styles.body}>{section.body}</p> : null}
          {section.ctaLabel ? (
            <Link
              href={ctaHref}
              className={styles.cta}
              style={{ backgroundColor: accent, color: onAccent }}
            >
              {section.ctaLabel}
            </Link>
          ) : null}
        </div>

        <div className={styles.imagePane}>
          {img ? (
            <div className={styles.imageWrap}>
              <Image
                src={img}
                alt={section.imageAlt || ""}
                width={900}
                height={600}
                sizes="(max-width: 991px) 100vw, 45vw"
                priority
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </div>
          ) : null}
        </div>

        <div className={styles.whiteBand} aria-hidden />
      </div>
    </section>
  );
}
