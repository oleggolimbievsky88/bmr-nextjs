"use client";
import { iconBoxData } from "@/data/features";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Features() {
  return (
    <section
      className="flat-spacing-7 flat-iconbox wow fadeInUp features-section"
      data-wow-delay="0s"
    >
      <div className="container">
        {/* Header Section */}
        <div className="row">
          <div className="col-md-12">
            <div className="section-title text-center mb-5">
              <h3 className="fw-bold">
                Why Choose <span className="text-danger">BMR Suspension</span>?
              </h3>
              <p className="text-muted fs-5 mt-3">
                Experience unmatched quality in automotive performance with our
                industry-leading suspension solutions
              </p>
            </div>
          </div>
        </div>
        {/* Features Carousel */}
        <div className="wrap-carousel wrap-mobile">
          <Swiper
            slidesPerView={4}
            spaceBetween={30}
            breakpoints={{
              1200: {
                slidesPerView: 4,
              },
              800: {
                slidesPerView: 3,
              },
              600: {
                slidesPerView: 2,
              },
              0: {
                slidesPerView: 1,
              },
            }}
            className="swiper tf-sw-mobile"
            data-preview={1}
            data-space={15}
            modules={[Pagination]}
            pagination={{ clickable: true, el: ".spd103" }}
          >
            {iconBoxData.map((elm, i) => (
              <SwiperSlide key={i} className="swiper-slide">
                <div className="tf-icon-box style-border-line text-center">
                  <div className="icon">
                    <i className={elm.iconClass} />
                  </div>
                  <div className="content">
                    <div className="title">{elm.title}</div>
                    <p>{elm.description}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="sw-dots style-2 sw-pagination-mb justify-content-center spd103" />
        </div>
      </div>
    </section>
  );
}
