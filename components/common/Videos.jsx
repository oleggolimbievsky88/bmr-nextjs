"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import SectionHeader from "@/components/common/SectionHeader";

export default function VideoPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <section className="homepage-section videosSection">
      <div className="container">
        <div className="videosSection__header">
          <SectionHeader
            title={loading ? "Loading Videos..." : error ? error : "Videos"}
            subtitle={
              !loading && !error
                ? "Explore our collection of videos showcasing our products and features."
                : undefined
            }
          />

          {!loading && !error && (
            <Link
              href="https://www.youtube.com/@BMRSuspension"
              target="_blank"
              rel="noopener noreferrer"
              className="videosSection__cta"
            >
              Visit YouTube
              <span className="videosSection__ctaIcon" aria-hidden="true">
                ↗
              </span>
            </Link>
          )}
        </div>

        {!loading && !error && (
          <div className="videosSection__slider hover-sw-nav">
            <Swiper
              spaceBetween={18}
              slidesPerView={4}
              navigation={{
                nextEl: ".videosNext",
                prevEl: ".videosPrev",
              }}
              modules={[Navigation]}
              className="videosSwiper"
              breakpoints={{
                0: { slidesPerView: 1, spaceBetween: 14 },
                576: { slidesPerView: 2, spaceBetween: 14 },
                768: { slidesPerView: 3, spaceBetween: 16 },
                1200: { slidesPerView: 4, spaceBetween: 18 },
              }}
            >
              {videos.map((video) => (
                <SwiperSlide key={video.id}>
                  <article className="videoCard">
                    <Link
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="videoCard__link"
                    >
                      <div className="videoCard__media">
                        <Image
                          src={video.thumbnail.url}
                          alt={video.title}
                          width={640}
                          height={360}
                          className="videoCard__img"
                          priority
                        />

                        <div className="videoCard__overlay" />

                        <div className="videoCard__play" aria-hidden="true">
                          <span className="videoCard__playBtn">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div className="videoCard__body">
                        <h3 className="videoCard__title">{video.title}</h3>
                        {video.description ? (
                          <p className="videoCard__desc">{video.description}</p>
                        ) : null}
                      </div>
                    </Link>
                  </article>
                </SwiperSlide>
              ))}

              <div className="swiper-button-next button-style-arrow thumbs-next videosNext" />
              <div className="swiper-button-prev button-style-arrow thumbs-prev videosPrev" />
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
}
