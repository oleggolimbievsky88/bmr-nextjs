"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { aboutLinks, footerLinks, paymentImages } from "@/data/footerLinks";
import FooterNewsletter from "./FooterNewsletter";
import FooterMobileMenu from "./FooterMobileMenu";
import { useBrand } from "@bmr/ui/brand";

export default function Footer1({ bgColor = "background-black" }) {
  const brand = useBrand();

  const addressLines = brand.contact?.addressLines || [];
  const email = brand.contact?.email || "";
  const phoneDisplay = brand.contact?.phoneDisplay || "";
  const phoneTel = brand.contact?.phoneTel || "";

  const socials = brand.social || {};
  const year = new Date().getFullYear();

  return (
    <>
      <FooterMobileMenu />
      <footer id="footer" className={`siteFooter ${bgColor}`}>
        <div className="siteFooter__top">
          <div className="container">
            <div className="siteFooter__grid">
              <div className="siteFooter__brand">
                <div className="siteFooter__logo">
                  <Link href="/" aria-label={brand.companyName}>
                    <Image
                      src={
                        brand.logo?.footerUrl ||
                        brand.logo?.headerUrl ||
                        "/images/logo/logo-white.png"
                      }
                      alt={brand.logo?.alt || `${brand.companyName} Logo`}
                      width={200}
                      height={43}
                      style={{
                        width: "225px",
                        height: "auto",
                        maxWidth: "100%",
                      }}
                    />
                  </Link>
                </div>

                <ul className="siteFooter__contact">
                  {addressLines.length > 0 && (
                    <li>
                      <p>
                        Address:{" "}
                        {addressLines.map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < addressLines.length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </p>
                    </li>
                  )}

                  {email && (
                    <li>
                      <p>
                        Email: <a href={`mailto:${email}`}>{email}</a>
                      </p>
                    </li>
                  )}

                  {phoneTel && (
                    <li>
                      <p>
                        Phone:{" "}
                        <a href={`tel:${phoneTel}`}>
                          {phoneDisplay || phoneTel}
                        </a>
                      </p>
                    </li>
                  )}
                </ul>

                <ul className="tf-social-icon d-flex gap-10 style-white siteFooter__socials">
                  {socials.facebook && (
                    <li>
                      <a
                        href={socials.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="box-icon w_34 round social-facebook social-line"
                        aria-label={`${brand.companyName} Facebook`}
                      >
                        <i className="icon fs-14 icon-fb" />
                      </a>
                    </li>
                  )}

                  {socials.instagram && (
                    <li>
                      <a
                        href={socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="box-icon w_34 round social-instagram social-line"
                        aria-label={`${brand.companyName} Instagram`}
                      >
                        <i className="icon fs-14 icon-instagram" />
                      </a>
                    </li>
                  )}

                  {socials.youtube && (
                    <li>
                      <a
                        href={socials.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="box-icon w_34 round social-youtube social-line"
                        aria-label={`${brand.companyName} YouTube`}
                      >
                        <i className="icon fs-14 icon-youtube" />
                      </a>
                    </li>
                  )}

                  {socials.tiktok && (
                    <li>
                      <a
                        href={socials.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="box-icon w_34 round social-tiktok social-line"
                        aria-label={`${brand.companyName} TikTok`}
                      >
                        <i className="icon fs-14 icon-tiktok" />
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              <nav className="siteFooter__col">
                <h4 className="siteFooter__heading">Customer Resources</h4>
                <ul className="siteFooter__links">
                  {footerLinks.map((link, index) => (
                    <li key={index}>
                      <Link href={link.href}>{link.text}</Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav className="siteFooter__col">
                <h4 className="siteFooter__heading">Company & Dealers</h4>
                <ul className="siteFooter__links">
                  {aboutLinks.map((link, index) => (
                    <li key={index}>
                      <Link href={link.href}>{link.text}</Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="siteFooter__newsletter">
                <h4 className="siteFooter__heading siteFooter__heading--accent">
                  Get Performance Updates First
                </h4>
                <p className="siteFooter__muted">
                  New products, tech tips, and exclusive drops.
                </p>
                <FooterNewsletter formOnly />
              </div>
            </div>
          </div>
        </div>

        <div className="siteFooter__bottom">
          <div className="container siteFooter__bottomInner">
            <div className="siteFooter__copyright">
              © {year} {brand.copyrightName || brand.companyName}. All Rights
              Reserved
            </div>

            <div className="siteFooter__payments tf-payment">
              {paymentImages.map((image, index) => (
                <Image
                  key={index}
                  src={image.src}
                  width={image.width}
                  height={image.height}
                  alt={image.alt}
                />
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
