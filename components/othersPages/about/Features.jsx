"use client";

import { iconBoxes4 } from "@/data/features";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Features() {
  return (
    <section>
      <div className="container">
        <div
          className="bg_grey-7 radius-20 flat-wrap-iconbox mb-5 mt-5"
          style={{ border: "2px solid var(--primary)" }}
        >
          <div className="flat-title lg">
            <span className="title mb-5 italic-heavy">
              Quality is Our Priority
            </span>
            <div>
              <p className="sub-title text_black-2">
                Every BMR Suspension product is engineered with precision and
                tested on our own project vehicles.
              </p>
              <p className="sub-title text_black-2 mb-5">
                From street performance to hardcore drag racing, we deliver
                innovative, quality-oriented suspension solutions made right
                here in the USA.
              </p>
            </div>
          </div>
          <div className="flat-iconbox-v3 lg">
            <div className="wrap-carousel wrap-mobile">
              <Swiper
                spaceBetween={15}
                slidesPerView={3}
                breakpoints={{
                  768: { slidesPerView: 3, spaceBetween: 15 },
                  480: { slidesPerView: 2, spaceBetween: 15 },
                  0: { slidesPerView: 1, spaceBetween: 15 },
                }}
                className="swiper tf-sw-mobile"
                modules={[Pagination]}
                pagination={{ clickable: true, el: ".spd303" }}
              >
                {iconBoxes4.map((box, index) => (
                  <SwiperSlide key={index}>
                    <div className="tf-icon-box text-center">
                      <div
                        className="icon"
                        style={{
                          color: "var(--primary)",
                          border: "2px solid var(--primary)",
                          borderRadius: "50%",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i
                          className={box.iconClass}
                          style={{ color: "var(--primary)" }}
                        />
                      </div>
                      <div className="content">
                        <div
                          className="title"
                          style={{ color: "var(--primary)" }}
                        >
                          {box.title}
                        </div>
                        <p className="text_black-2">{box.description}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
