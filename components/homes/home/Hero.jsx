"use client";

import { useState, useEffect } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import Image from "next/image";

const slideshowSlides = [
  "/images/slider/SP086-88_Banner_S650.webp",
  "/images/slider/CJR760_Banner_S650.jpg",
  "/images/slider/AAK322_Banner.jpg",
  "/images/slider/S650 Mustang_Banner.jpg",
  "/images/slider/CB763_Banner (S650).jpg",
];

// Fallback slide when API image fails to load (e.g. missing file in production)
const FALLBACK_SRC = "/images/slider/SP086-88_Banner_S650.webp";

export default function Hero() {
  const [bannerImages, setBannerImages] = useState([]);
  const [failedSrcs, setFailedSrcs] = useState(new Set());

  // Resolve banner image src: full URL or path as-is; bare filename -> /images/slider/
  const resolveBannerSrc = (imageSrc) => {
    if (!imageSrc || typeof imageSrc !== "string") return "";
    const s = imageSrc.trim();
    if (s.startsWith("http")) return s;
    if (s.startsWith("/")) return s;
    if (s.includes("/")) return `/${s}`;
    return `/images/slider/${s}`;
  };

  useEffect(() => {
    fetch("/api/banner")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.images?.length) {
          setBannerImages(
            data.images.map((img) => ({
              src: resolveBannerSrc(img.ImageSrc),
              link: img.ImageUrl?.trim() || null,
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  const slides =
    bannerImages.length > 0
      ? bannerImages
      : slideshowSlides.map((src) => ({ src, link: null }));

  return (
    <section
      className="tf-slideshow slider-collection hover-sw-nav pb_0"
      style={{
        marginBottom: 0,
        paddingBottom: 0,
        position: "relative",
        zIndex: 0,
      }}
    >
      <div
        className="wrap-slider"
        style={{ marginBottom: 0, paddingBottom: 0 }}
      >
        {/* <Swiper
          slidesPerView={3}
          spaceBetween={0}
          centeredSlides={false}
          loop={true}
          modules={[Autoplay]}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          speed={5000}
          breakpoints={{
            576: { slidesPerView: 1 },
            0: { slidesPerView: 1 },
          }}
        >
          {slideshowSlides.map((imgSrc, index) => (
            <SwiperSlide key={index}>
              <div className="collection-item hover-img">
                <div className="collection-inner">
                  <Link
                    href={`/shop-default`}
                    className="collection-image img-style rounded-0"
                  >
                    <Image
                      alt="collection"
                      src={imgSrc}
                      width={800}
                      height={1021}
                    />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper> */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={1}
          slidesPerView={1}
          loop={true}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          speed={3000}
          style={{
            backgroundColor: "black",
            marginBottom: 0,
            paddingBottom: 0,
            position: "relative",
            zIndex: 0,
          }}
        >
          {slides.map((slide, index) => {
            const src = typeof slide === "string" ? slide : slide.src;
            const link =
              typeof slide === "object" && slide.link ? slide.link : null;
            const effectiveSrc = failedSrcs.has(src) ? FALLBACK_SRC : src;
            const content = (
              <Image
                src={effectiveSrc}
                alt={`Slide ${index + 1}`}
                width={1920}
                height={550}
                priority={index === 0}
                unoptimized
                onError={() => {
                  if (effectiveSrc === src)
                    setFailedSrcs((s) => new Set([...s, src]));
                }}
              />
            );
            return (
              <SwiperSlide key={index}>
                <div className="collection-item">
                  <div className="collection-inner">
                    {link ? (
                      <Link
                        href={link}
                        className="collection-image img-style rounded-0 d-block"
                      >
                        {content}
                      </Link>
                    ) : (
                      <span className="collection-image img-style rounded-0 d-block">
                        {content}
                      </span>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
        {/* <div className="box-content z-5">
                <div className="container">
                <div className="card-box bg_yellow-7">
                  <p className="fade-item fade-item-1 subheading fw-7 fs-14">
                  30% OFF ALL ORDERS
                  </p>
                  <h3 className="fade-item fade-item-2 heading">
                  Graphic Tees <br />
                  Collection
                  </h3>
                  <div className="fade-item fade-item-3">
                  <Link
                    href={`/shop-collection-list`}
                    className="tf-btn btn-outline-dark radius-3 fs-18 fw-5"
                  >
                    <span>Shop collection</span>
                    <i className="icon icon-arrow-right"></i>
                  </Link>
                  </div>
                </div>
                </div>
              </div> */}
      </div>
    </section>
  );
}
