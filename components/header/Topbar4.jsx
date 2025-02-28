import React from "react";
import Link from "next/link";
import LanguageSelect from "../common/LanguageSelect";
import CurrencySelect from "../common/CurrencySelect";
export default function Topbar4() {
  return (
    <div className="tf-top-bar text-white bg_black">
      <div className="px_15 lg-px_40">
        <div className="tf-top-bar_wrap grid-3 gap-30 align-items-center">
        <div className="tf-top-bar_left">
            <div className="d-inline-block">
              <span className="fw-7">
                Call Us Today! 
                <a
                  href="tel:+18001090"
                  style={{ textDecoration: "underline", marginLeft: "5px", color: "var(--white)" }}
                  aria-describedby="external-message"
                >
                   (813) 986-9302
                </a>
              </span>
            </div>
          </div>
          <div className="text-center overflow-hidden">
            <div
              className="swiper tf-sw-top_bar"
              data-preview={1}
              data-space={0}
              data-loop="true"
              data-speed={1000}
              data-delay={2000}
            >
              <div className="swiper-wrapper">
                <div className="swiper-slide">
                  <p className="top-bar-text fw-5" style={{letterSpacing: "0px"}}>
                   FREE SHIPPING THE THE 48 CONTIGUOUS US STATES FOR ALL BMR PRODUCTS!
                    
                  </p>
                </div>
                <div className="swiper-slide">
                  <p className="top-bar-text fw-5">
                    Summer sale discount off 70%
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="top-bar-language tf-cur justify-content-end">
            <ul className="d-flex gap-20">
              <li>
                <Link href={`/contact-1`} className="text-white">
                  CONTACT US
                </Link>
              </li>
              <li>
                <Link href={`/blog-grid`} className="text-white">
                  ABOUT US
                </Link>
              </li>
              <li>
                <Link href={`#`} className="text-white">
                  MY ACCOUNT
                </Link>
              </li>
              <li>
                <Link href={`#`} className="text-white">
                  DEALERS
                </Link>
              </li>
            </ul>
          </div>
          
        </div>
      </div>
    </div>
  );
}
