"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LanguageSelect from "../common/LanguageSelect";
import CurrencySelect from "../common/CurrencySelect";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

const DEFAULT_MESSAGE = "FREE SHIPPING IN THE US FOR ALL BMR PRODUCTS!";
const DEFAULT_DURATION = 3000;

export default function Topbar1() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch("/api/topbar-messages", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data.messages) ? data.messages : [];
        setMessages(
          list.filter(
            (m) => m && m.content != null && String(m.content).trim() !== "",
          ),
        );
      })
      .catch(() => setMessages([]));
  }, []);

  const slides =
    messages.length > 0
      ? messages
      : [{ content: DEFAULT_MESSAGE, duration: DEFAULT_DURATION }];
  const getDelay = (i) =>
    Math.max(1000, Number(slides[i]?.duration) || DEFAULT_DURATION);

  const onSlideChange = (swiper) => {
    const d = getDelay(swiper.realIndex);
    if (swiper.params.autoplay && swiper.autoplay) {
      swiper.params.autoplay.delay = d;
      swiper.autoplay.stop();
      swiper.autoplay.start();
    }
  };

  return (
    <div className="tf-top-bar bg_white line">
      <div className="px_15 lg-px_40">
        <div className="tf-top-bar_wrap grid-3 gap-30 align-items-center">
          <ul className="tf-top-bar_item tf-social-icon d-flex gap-10">
            <li>
              <a
                href="https://www.facebook.com/BMRSuspensionInc/"
                target="_blank"
                rel="noopener noreferrer"
                className="box-icon w_28 round social-facebook bg_line"
              >
                <i className="icon fs-12 icon-fb" />
              </a>
            </li>
            <li>
              <a href="#" className="box-icon w_28 round social-twiter bg_line">
                <i className="icon fs-10 icon-Icon-x" />
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/bmrsuspension/"
                target="_blank"
                rel="noopener noreferrer"
                className="box-icon w_28 round social-instagram bg_line"
              >
                <i className="icon fs-12 icon-instagram" />
              </a>
            </li>
            <li>
              <a
                href="https://www.youtube.com/@BMRSuspension"
                target="_blank"
                rel="noopener noreferrer"
                className="box-icon w_28 round social-youtube bg_line"
              >
                <i className="icon fs-12 icon-youtube" />
              </a>
            </li>
            <li>
              <a
                href="https://www.tiktok.com/@bmrsuspension"
                target="_blank"
                rel="noopener noreferrer"
                className="box-icon w_28 round social-tiktok bg_line"
              >
                <i className="icon fs-12 icon-tiktok" />
              </a>
            </li>
            <li>
              <a
                href="#"
                className="box-icon w_28 round social-pinterest bg_line"
              >
                <i className="icon fs-12 icon-pinterest-1" />
              </a>
            </li>
          </ul>
          <div className="text-center overflow-hidden">
            <Swiper
              key={slides.length}
              className="swiper tf-sw-top_bar"
              slidesPerView={1}
              modules={[Autoplay]}
              speed={1000}
              autoplay={{ delay: getDelay(0) }}
              onSlideChangeTransitionEnd={onSlideChange}
              loop
            >
              {slides.map((m, i) => (
                <SwiperSlide key={i} className="swiper-slide">
                  <p
                    className="top-bar-text fw-5"
                    dangerouslySetInnerHTML={{
                      __html: m.content || DEFAULT_MESSAGE,
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="top-bar-language tf-cur justify-content-end">
            <div className="tf-currencies">
              <CurrencySelect topStart />
            </div>
            <div className="tf-languages">
              <LanguageSelect
                parentClassName={
                  "image-select center style-default type-languages"
                }
                topStart
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
