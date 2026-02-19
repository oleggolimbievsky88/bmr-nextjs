"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useBrand } from "@bmr/ui/brand";

const DEFAULT_MESSAGE = "FREE SHIPPING IN THE US FOR ALL BMR PRODUCTS!";
const DEFAULT_DURATION = 3000;

export default function Topbar2({ bgColor = "bg_dark" }) {
  const brand = useBrand();
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const phoneDisplay =
    brand?.contact?.phoneDisplay || brand?.contact?.phoneTel || "";
  const phoneTel = brand?.contact?.phoneTel || "";
  const email = brand?.contact?.email || "";

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

  const accountHref =
    session?.user?.role === "admin" ? "/admin" : "/my-account";
  const accountLabel = session?.user?.role === "admin" ? "Admin" : "My Account";
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
    <div className={`tf-top-bar bg_dark line-red`}>
      <div>
        <div className="tf-top-bar_wrap grid-3 gap-30 align-items-center">
          <div className="tf-top-bar_left">
            <div className="d-flex gap-30 text_white">
              {phoneDisplay && (
                <span>
                  {phoneTel ? (
                    <a
                      href={`tel:${phoneTel}`}
                      className="text_white"
                      style={{ textDecoration: "none" }}
                    >
                      {phoneDisplay}
                    </a>
                  ) : (
                    phoneDisplay
                  )}
                </span>
              )}
              {email && (
                <span>
                  <a
                    href={`mailto:${email}`}
                    className="text_white"
                    style={{ textDecoration: "none" }}
                  >
                    {email}
                  </a>
                </span>
              )}
            </div>
          </div>
          <div className="text-center overflow-hidden">
            <Swiper
              key={slides.length}
              className="swiper tf-sw-top_bar"
              slidesPerView={1}
              modules={[Autoplay]}
              speed={1000}
              autoplay={{ delay: getDelay(0) }}
              onSlideChangeTransitionEnd={onSlideChange}
              loop={slides.length > 1}
            >
              {slides.map((m, i) => (
                <SwiperSlide key={i} className="swiper-slide">
                  <div
                    className="top-bar-text fw-5 text_white"
                    dangerouslySetInnerHTML={{
                      __html: m.content || DEFAULT_MESSAGE,
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="top-bar-language tf-cur justify-content-end">
            <ul className="d-flex gap-20">
              <li>
                <Link href={`/contact`} className="text-white nav-text">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href={`/about-us`} className="text-white nav-text">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href={session ? accountHref : "/login"}
                  className="text-white nav-text"
                >
                  {session ? accountLabel : "My Account"}
                </Link>
              </li>
              <li>
                <Link href={`/dealers-portal`} className="text-white nav-text">
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
