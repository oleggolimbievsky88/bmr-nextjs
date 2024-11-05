"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Drift from "drift-zoom";

// Retrieve the base URL for the API from environment variables
// This allows for different configurations in development, staging, and production environments


// Construct the full API endpoint URL using the base URL and the specific product ID
// Fetch data from the API endpoint for a specific product



export default function Slider3({ product }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;


  // // Fetch product data from the API
  // useEffect(() => {
  //   const fetchProduct = async () => {
  //     try {
  //       const response = await fetch(`${baseUrl}/api/products/${product.productId}`);
  //       if (!response.ok) throw new Error("Failed to fetch product");

  //       const data = await response.json();
  //       setProduct(data);
  //     } catch (error) {
  //       console.error("Error fetching product:", error);
  //     }
  //   };

  //   fetchProduct();
  // }, [productId]);

  if (!product) return <p>Loading...</p>; // Show loading state until data is fetched

  return (
    <>
      <Swiper
        spaceBetween={10}
        slidesPerView={1}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        className="tf-product-media-main"
        thumbs={{ swiper: thumbsSwiper }}
        modules={[Thumbs, Navigation]}
      >
        {product.images.map((slide, index) => (
          <SwiperSlide key={index}>
            <a
              className="item"
              data-pswp-width={slide.width}
              data-pswp-height={slide.height}
            >
              <Image
                className="tf-image-zoom lazyload"
                data-zoom={slide.imgSrc}
                src={slide.imgSrc}
                alt={slide.alt}
                width={slide.width}
                height={slide.height}
              />
            </a>
          </SwiperSlide>
        ))}
        <div className="swiper-button-next button-style-arrow thumbs-next"></div>
        <div className="swiper-button-prev button-style-arrow thumbs-prev"></div>
      </Swiper>
      <Swiper
        direction="horizontal"
        spaceBetween={10}
        slidesPerView={5}
        className="tf-product-media-thumbs other-image-zoom"
        onSwiper={setThumbsSwiper}
        modules={[Thumbs]}
      >
        {product.images.map((slide, index) => (
          <SwiperSlide key={index} className="stagger-item">
            <div className="item">
              <Image
                className="lazyload"
                src={slide.imgSrc}
                alt={slide.alt}
                width={slide.width}
                height={slide.height}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
