"use client";
import React from "react";
import Link from "next/link";
import LanguageSelect from "../common/LanguageSelect";
import CurrencySelect from "../common/CurrencySelect";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
export default function Topbar2({ bgColor = "bg_dark" }) {
  return (
    <div className={`tf-top-bar bg_dark line-red`}>
      <div className="px_15 lg-px_40">
        <div className="tf-top-bar_wrap grid-3 gap-30 align-items-center">
          <div className="tf-top-bar_left">
            <div className="d-flex gap-30 text_white fw-5">
              <span>(813) 986-9302</span>
              <span>sales@bmrsuspension.com</span>
            </div>
          </div>
          <div className="text-center overflow-hidden">
            <Swiper
              className="swiper tf-sw-top_bar"
              slidesPerView={1}
              modules={[Autoplay]}
              speed={1000}
              autoplay={{
                delay: 4000,
              }}
              loop
            >
              <SwiperSlide className="swiper-slide">
                <p className="top-bar-text fw-5 text_white">
                  2004 Mustang Suspension Sale{" "}
                  <Link
                    href={`/products/2024-mustang/suspension`}
                    title="all collection"
                    className="tf-btn btn-line"
                  >
                    {" "}
                    Shop now
                    <i className="icon icon-arrow1-top-left" />
                  </Link>
                </p>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <p className="top-bar-text fw-5 text_white">
                  <a>Fall Sale Discount 20% Off. Use Code: SAVE20</a>
                </p>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <p className="top-bar-text fw-5 text_white">
                  Fall Sale Discount 10% Off.{" "}
                  <Link
                    href={`/platform/2024-mustang/suspension`}
                    title="2024 Mustang Suspension collection"
                    className="tf-btn btn-line"
                  >
                    {" "}
                    Shop Now!
                    <i className="icon icon-arrow1-top-left" />
                  </Link>
                </p>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <p className="top-bar-text fw-5 text_white">
                  S650 Mustang Suspension.{" "}
                  <Link
                    href={`/shop-default`}
                    title="all collection"
                    className="tf-btn btn-line"
                  >
                    {" "}
                    Shop now
                    <i className="icon icon-arrow1-top-left" />
                  </Link>
                </p>
              </SwiperSlide>
            </Swiper>
          </div>
          <div className="top-bar-language tf-cur justify-content-end">
            <ul className="d-flex gap-20">
              <li>
                <Link href={`/contact`} className="text-white nav-text">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href={`/about-us`} className="text-white nav-text">
                  About Us
                </Link>
              </li>
              <li>
                <Link href={`/login`} className="text-white nav-text">
                  My Account
                </Link>
              </li>
              <li>
                <Link href={`#`} className="text-white nav-text">
                  Dealers
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
