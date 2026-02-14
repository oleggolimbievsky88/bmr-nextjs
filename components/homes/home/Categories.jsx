"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";

const FALLBACK_SLIDES = [
  {
    imgSrc: "/images/shop-categories/NewProductsGradient.jpg",
    alt: "New Products",
    title: "New Products",
    href: "/products/new",
  },
  {
    imgSrc: "/images/shop-categories/MerchGradient.jpg",
    alt: "BMR Merchandise",
    title: "BMR Merchandise",
    href: "/products/bmr-merchandise",
  },
  {
    imgSrc: "/images/shop-categories/GiftCardsGradient.jpg",
    alt: "BMR Gift Cards",
    title: "BMR Gift Cards",
    href: "/products/gift-cards",
  },
];

export default function Categories() {
  const [slides, setSlides] = useState(FALLBACK_SLIDES);

  useEffect(() => {
    fetch("/api/homepage-collections?type=slides")
      .then((res) => res.json())
      .then((data) => {
        if (data.slides?.length) setSlides(data.slides);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="flat-spacing-13">
      <div className="container-full">
        <Swiper
          slidesPerView={3}
          spaceBetween={30}
          breakpoints={{
            768: { slidesPerView: 3 },
            640: { slidesPerView: 3 },
            0: { slidesPerView: 1.3 },
          }}
          pagination={{ clickable: true, clickable: true }}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="collection-item-v2 hover-img">
                <Link
                  href={slide.href || "/shop-collection-sub"}
                  className="collection-inner"
                >
                  <div className="collection-image img-style">
                    <Image
                      className="lazyload"
                      data-src={slide.imgSrc}
                      alt={slide.alt}
                      src={slide.imgSrc}
                      width={500}
                      height={500}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "10px",
                      }}
                    />
                  </div>
                  <div className="collection-content">
                    <div className="top wow fadeInUp" data-wow-delay="0s">
                      <h4 className="heading">{slide.title}</h4>
                    </div>
                    <div className="bottom wow fadeInUp" data-wow-delay="0s">
                      <button
                        type="button"
                        className="tf-btn btn-line collection-other-link fw-6"
                      >
                        <span style={{ color: "var(--bs-white)" }}>
                          Shop now
                        </span>
                        <i
                          style={{ color: "var(--bs-white)" }}
                          className="icon icon-arrow1-top-left"
                        />
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
