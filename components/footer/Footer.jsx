import React from "react";
import Image from "next/image";
import Link from "next/link";
import { aboutLinks, footerLinks, paymentImages } from "@/data/footerLinks";
import FooterNewsletter from "./FooterNewsletter";
import FooterMobileMenu from "./FooterMobileMenu";

export default function Footer1({ bgColor = "background-black" }) {
  return (
    <>
      <FooterMobileMenu />
      <footer id="footer" className={`siteFooter ${bgColor}`}>
        <div className="siteFooter__top">
          <div className="container">
            <div className="siteFooter__grid">
              <div className="siteFooter__brand">
                <div className="siteFooter__logo">
                  <Link href="/">
                    <Image
                      src="/images/logo/BMR-Logo-White.png"
                      alt="BMR Logo"
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
                  <li>
                    <p>
                      Address: 1033 Pine Chase Ave <br />
                      Lakeland, FL 33815
                    </p>
                  </li>
                  <li>
                    <p>
                      Email:{" "}
                      <a href="mailto:sales@bmrsuspension.com">
                        Sales@bmrsuspension.com
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      Phone: <a href="tel:8139869302">(813) 986-9302</a>
                    </p>
                  </li>
                </ul>
                <ul className="tf-social-icon d-flex gap-10 style-white siteFooter__socials">
                  <li>
                    <a
                      href="https://www.facebook.com/BMRSuspensionInc/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="box-icon w_34 round social-facebook social-line"
                    >
                      <i className="icon fs-14 icon-fb" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/bmrsuspension/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="box-icon w_34 round social-instagram social-line"
                    >
                      <i className="icon fs-14 icon-instagram" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.youtube.com/@BMRSuspension"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="box-icon w_34 round social-youtube social-line"
                    >
                      <i className="icon fs-14 icon-youtube" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.tiktok.com/@bmrsuspension"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="box-icon w_34 round social-tiktok social-line"
                    >
                      <i className="icon fs-14 icon-tiktok" />
                    </a>
                  </li>
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
              © {new Date().getFullYear()} BMR Suspension. All Rights Reserved
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
