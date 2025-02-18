"use client";

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
export default function Hero() {
  return (
    <section className="tf-slideshow slider-collection hover-sw-nav pb_0">
      <div className="wrap-slider">
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
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          speed={3000}
          style={{ backgroundColor: "black" }}
        >
          {slideshowSlides.map((imgSrc, index) => (
            <SwiperSlide key={index}>
              <div className="collection-item">
                <div className="collection-inner">
                  <Link
                    href={`#`}
                    className="collection-image img-style rounded-0"
                  >
                    <Image
                      src={imgSrc}
                      alt={`Slide ${index + 1}`}
                      width={1920}
                      height={550}
                      style={{ width: '100%', height: 'auto' }}
                      objectFit="cover"
                      priority
                    />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
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
