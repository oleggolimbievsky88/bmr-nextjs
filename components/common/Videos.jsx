"use client";

import { useEffect, useState } from "react";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

export default function VideoPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    setQuickViewItem,
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/youtube");
        if (!response.ok) throw new Error("Failed to fetch videos");
        const data = await response.json();
        setVideos(data.items);
        setError(null);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <section className="pt_0">
        <div className="container">
          <div className="flat-title">
            <span className="title wow fadeInUp home-title" data-wow-delay="0s">
              Loading Videos...
            </span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pt_0">
        <div className="container">
          <div className="flat-title">
            <span className="title wow fadeInUp home-title" data-wow-delay="0s">
              {error}
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt_0">
      <div className="container">
        <div className="flat-title">
          <span className="title wow fadeInUp home-title" data-wow-delay="0s">
            Videos
          </span>
          <h6 className="home-title-description text-center text-muted">
            Explore our collection of videos showcasing our products and
            features.
          </h6>
        </div>

        <div className="video-slider-wrapper hover-sw-nav">
          <Swiper
            spaceBetween={24}
            slidesPerView={4}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            modules={[Navigation]}
            className="video-slider"
            breakpoints={{
              0: {
                slidesPerView: 1,
                spaceBetween: 16,
              },
              576: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              1200: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
            }}
          >
            {videos.map((video) => (
              <SwiperSlide key={video.id}>
                <div className="card-product bg_white radius-20 h-100">
                  <div className="card-product-wrapper border-line h-100 d-flex flex-column">
                    <Link
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="video-thumbnail-link"
                    >
                      <div className="video-thumbnail-wrapper">
                        <Image
                          src={video.thumbnail.url}
                          alt={video.title}
                          width={320}
                          height={180}
                          className="video-thumbnail"
                          priority
                        />
                        <div className="play-button">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="white"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                    <div className="card-product-info mt-2">
                      <div className="NewProductPartNumber">{video.title}</div>
                      <span
                        className="NewProductPlatformName"
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          margin: "0px",
                          padding: "0px",
                          lineHeight: "1.2",
                          display: "-webkit-box",
                          WebkitLineClamp: "2",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          height: "auto",
                          maxHeight: "2.4em",
                        }}
                      >
                        {video.description}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
            <div className="swiper-button-next button-style-arrow thumbs-next"></div>
            <div className="swiper-button-prev button-style-arrow thumbs-prev"></div>
          </Swiper>
        </div>

        <div className="row mt-4">
          <div className="col-md-12 text-center custom-youtube-button">
            <Link
              href="https://www.youtube.com/@BMRSuspension"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Our YouTube Channel
            </Link>
          </div>
        </div>

        <style jsx>{`
          .video-slider-wrapper {
            position: relative;
            margin: 0 -12px;
            padding: 0 12px;
          }

          .video-thumbnail-link {
            display: block;
            position: relative;
            width: 100%;
            border-radius: 10px;
            overflow: hidden;
          }

          .video-thumbnail-wrapper {
            position: relative;
            width: 100%;
            background: #000;
            border-radius: 10px;
            overflow: hidden;
          }

          .video-thumbnail {
            width: 100%;
            height: auto;
            display: block;
            transition: transform 0.3s ease;
          }

          .video-thumbnail-link:hover .video-thumbnail {
            transform: scale(1.05);
          }

          .play-button {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 48px;
            height: 48px;
            background-color: rgba(0, 0, 0, 0.7);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
            transition: background-color 0.3s ease;
          }

          .video-thumbnail-link:hover .play-button {
            background-color: rgba(0, 0, 0, 0.9);
          }

          .NewProductPartNumber {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .NewProductPlatformName {
            font-size: 14px;
            line-height: 1.2;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            color: #666;
          }

          .custom-youtube-button {
            display: inline-block;
            background-color: var(--primary);
            color: var(--white);
            padding: 12px 32px;
            border-radius: 30px;
            font-weight: 600;
            font-size: 16px;
            letter-spacing: 0.5px;
            border: 2px solid var(--primary);
            text-transform: uppercase;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            max-width: 500px;
            margin: 0 auto;
          }

          .custom-youtube-button a {
            color: #fff !important;
            text-decoration: none;
          }

          .custom-youtube-button:hover {
            background-color: transparent;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          }

          .custom-youtube-button:hover a {
            color: #000 !important;
          }

          .custom-youtube-button:active {
            transform: translateY(0);
          }
        `}</style>
      </div>
    </section>
  );
}
