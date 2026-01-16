import React from "react";
import Image from "next/image";
import Link from "next/link";
import { aboutLinks, footerLinks, paymentImages } from "@/data/footerLinks";
import FooterNewsletter from "./FooterNewsletter";

export default function Footer1({ bgColor = "background-black" }) {
  return (
    <footer id="footer" className={`footer md-pb-70 ${bgColor}`}>
      <div className="footer-wrap">
        <div className="footer-body">
          <div className="container">
            <div className="row">
              <div className="col-xl-3 col-md-6 col-12">
                <div className="footer-infor">
                  <div className="footer-logo">
                    <Link href={`/`}>
                      <Image
                        src="/images/logo/bmr-logo-white.webp"
                        alt="BMR Logo"
                        width={330}
                        height={70}
                        style={{
                          width: "auto",
                          height: "auto",
                          maxWidth: "100%",
                        }}
                      />
                    </Link>
                  </div>
                  <ul>
                    <li>
                      <p>
                        Address: 1033 Pine Chase Ave <br />
                        Lakeland, FL 33815
                      </p>
                    </li>
                    <li>
                      <p>
                        Email:{" "}
                        <a href="mailto:info@bmrsuspension.com">
                          info@bmrsuspension.com
                        </a>
                      </p>
                    </li>
                    <li>
                      <p>
                        Phone: <a href="tel:8139869302">(813) 986-9302</a>
                      </p>
                    </li>
                  </ul>
                  <Link href={`/contact-1`} className="tf-btn btn-line">
                    Get direction
                    <i className="icon icon-arrow1-top-left" />
                  </Link>
                  <ul className="tf-social-icon d-flex gap-10 style-white">
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
              </div>
              <div className="col-xl-3 col-md-6 col-12 footer-col-block">
                <div className="footer-heading footer-heading-desktop">
                  <h6>Help</h6>
                </div>
                <div className="footer-heading footer-heading-moblie">
                  <h6>Help</h6>
                </div>
                <ul className="footer-menu-list tf-collapse-content">
                  {footerLinks.map((link, index) => (
                    <li key={index}>
                      <Link href={link.href} className="footer-menu_item">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-xl-3 col-md-6 col-12 footer-col-block">
                <div className="footer-heading footer-heading-desktop">
                  <h6>About us</h6>
                </div>
                <div className="footer-heading footer-heading-moblie">
                  <h6>About us</h6>
                </div>
                <ul className="footer-menu-list tf-collapse-content">
                  {aboutLinks.slice(0, 4).map((link, index) => (
                    <li key={index}>
                      <Link href={link.href} className="footer-menu_item">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-xl-3 col-md-6 col-12">
                <FooterNewsletter />
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="footer-bottom-wrap d-flex gap-20 flex-wrap justify-content-between align-items-center">
                  <div className="footer-menu_item">
                    © {new Date().getFullYear()} BMR Suspension. All Rights
                    Reserved
                  </div>
                  <div className="tf-payment">
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
