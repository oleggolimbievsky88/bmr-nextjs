"use client";
import Drift from "drift-zoom";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import { Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Slider3BottomThumbs({ productId, selectedColor }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [product, setProduct] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  // Store each slide's lightbox open function so Swiper's onClick (reliable on mobile) can open the modal
  const openLightboxRefs = useRef([]);

  // Reset swiper refs when product changes (e.g. size variant) to avoid using destroyed instances
  useEffect(() => {
    setThumbsSwiper(null);
    setMainSwiper(null);
  }, [productId]);

  // Fetch product data from the API
  useEffect(() => {
    let cancelled = false;
    setProduct(null); // Clear to avoid using destroyed Swiper refs during remount
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/product-by-id?id=${productId}`);
        if (!response.ok) throw new Error("Failed to fetch product");

        const data = await response.json();
        if (!cancelled) {
          setProduct(data.product);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching product:", error);
        }
      }
    };

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  // Effect to handle image switching when color changes
  useEffect(() => {
    if (product?.images?.length > 0 && mainSwiper) {
      // Default to first image
      let imageIndex = 0;

      // If a color is provided, try to match it
      if (selectedColor) {
        if (selectedColor.ColorID === 1) {
          // Black Hammertone - show second image if available
          imageIndex = Math.min(1, product.images.length - 1);
        } else if (selectedColor.ColorID === 2) {
          // Red - show first image
          imageIndex = 0;
        }

        try {
          mainSwiper.slideTo(imageIndex);
        } catch (error) {
          console.error("Error in image switch:", error);
        }
      }
    }
  }, [selectedColor, product, mainSwiper]);

  useEffect(() => {
    // Function to initialize Drift
    const imageZoom = () => {
      const driftAll = document.querySelectorAll(".tf-image-zoom");
      const pane = document.querySelector(".tf-zoom-main");

      // Check if both elements exist before initializing Drift
      if (driftAll.length > 0 && pane) {
        driftAll.forEach((el) => {
          try {
            new Drift(el, {
              zoomFactor: 2,
              paneContainer: pane,
              inlinePane: false,
              handleTouch: false,
              hoverBoundingBox: true,
              containInline: true,
              showWhitespaceAtEdges: false,
              touchDelay: 500,
              boundingBoxContainer: document.body,
              onShow: function () {
                pane.style.display = "block";
              },
              onHide: function () {
                pane.style.display = "none";
              },
            });
          } catch (error) {
            console.warn("Drift initialization failed:", error);
          }
        });
      }
    };

    if (product?.images?.length > 0) {
      // Longer delay to ensure DOM is ready and zoom pane is rendered
      setTimeout(() => {
        imageZoom();
      }, 500);
    }

    const zoomElements = document.querySelectorAll(".tf-image-zoom");

    const handleMouseOver = (event) => {
      const parent = event.target.closest(".section-image-zoom");
      if (parent) {
        parent.classList.add("zoom-active");
      }
    };

    const handleMouseLeave = (event) => {
      const parent = event.target.closest(".section-image-zoom");
      if (parent) {
        parent.classList.remove("zoom-active");
      }
    };

    zoomElements.forEach((element) => {
      element.addEventListener("mouseover", handleMouseOver);
      element.addEventListener("mouseleave", handleMouseLeave);
    });

    // Cleanup event listeners on component unmount
    return () => {
      zoomElements.forEach((element) => {
        element.removeEventListener("mouseover", handleMouseOver);
        element.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [product]);

  if (!product) return <p>Loading...</p>;

  // Ensure images array exists and has content
  const images = product.images || [];

  if (images.length === 0) {
    return (
      <div className="tf-product-media-wrap">
        <div className="tf-product-media-main">
          <div
            className="item"
            style={{
              position: "relative",
              width: "100%",
              maxHeight: "500px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Image
              src="/images/shop/products/placeholder.jpg"
              alt="No image available"
              fill
              className="tf-image-zoom"
              style={{
                objectFit: "contain",
                objectPosition: "center",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Force Swiper to remount when product changes (e.g. size variant) so images update
  const sliderKey = product?.ProductID ?? `loading-${productId}`;

  const handleLightboxOpen = (pswp) => {
    if (!pswp?.element) return;
    const closeOnBackdropTap = (e) => {
      const target = e.target;
      if (!target || !target.closest) return;
      if (target.closest(".pswp__img") || target.closest(".pswp__button"))
        return;
      pswp.close();
    };
    pswp.element.addEventListener("click", closeOnBackdropTap);
    pswp.element.addEventListener("touchend", closeOnBackdropTap, {
      passive: true,
    });
    const unbind = () => {
      pswp.element.removeEventListener("click", closeOnBackdropTap);
      pswp.element.removeEventListener("touchend", closeOnBackdropTap);
      pswp.off("close", unbind);
    };
    pswp.on("close", unbind);
  };

  return (
    <>
      <Gallery
        options={{
          showHideOpacity: true,
          bgOpacity: 0.9,
          spacing: 0.1,
          maxSpreadZoom: 3,
          closeOnScroll: false,
          closeOnVerticalDrag: false,
          allowPanToNext: true,
          allowPanToPrev: true,
          bgClickAction: "close",
          getThumbBoundsFn: function (index) {
            const thumbnail = document.querySelectorAll(
              ".tf-product-media-thumbs .item img",
            )[index];
            if (thumbnail) {
              const rect = thumbnail.getBoundingClientRect();
              return {
                x: rect.left,
                y: rect.top,
                w: rect.width,
              };
            }
            return { x: 0, y: 0, w: 0 };
          },
        }}
        onOpen={handleLightboxOpen}
      >
        <Swiper
          key={sliderKey}
          spaceBetween={10}
          slidesPerView={1}
          autoHeight={true}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          className="tf-product-media-main"
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          modules={[Thumbs, Navigation]}
          onSwiper={(swiper) => {
            setMainSwiper(swiper);
          }}
          onClick={(swiper) => {
            // On mobile, tap often doesn't fire the link's onClick; Swiper's onClick is reliable
            const idx = swiper.clickedIndex;
            if (
              idx != null &&
              typeof openLightboxRefs.current[idx] === "function"
            ) {
              openLightboxRefs.current[idx]();
            }
          }}
        >
          {images.map((slide, index) => {
            if (index === 0) openLightboxRefs.current = [];
            // Calculate display dimensions - scale down to max 600px width while maintaining aspect ratio
            const maxDisplayWidth = 1400;
            const originalWidth = slide.width || 1400;
            const originalHeight = slide.height || 1000;
            const aspectRatio = originalHeight / originalWidth;
            const displayWidth = Math.min(originalWidth, maxDisplayWidth);
            const displayHeight = Math.round(displayWidth * aspectRatio);

            return (
              <SwiperSlide key={index}>
                <Item
                  original={slide.imgSrc}
                  thumbnail={slide.imgSrc}
                  width={originalWidth}
                  height={originalHeight}
                >
                  {({ ref, open }) => {
                    openLightboxRefs.current[index] = open;
                    return (
                      <a
                        className="item"
                        data-pswp-width={originalWidth}
                        data-pswp-height={originalHeight}
                        onClick={(e) => {
                          e.preventDefault();
                          open();
                        }}
                        href={slide.imgSrc}
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "auto",
                          display: "block",
                          cursor: "pointer",
                        }}
                      >
                        <Image
                          className="tf-image-zoom lazyload"
                          data-zoom={slide.imgSrc}
                          src={slide.imgSrc}
                          alt={slide.alt}
                          width={displayWidth}
                          height={displayHeight}
                          ref={ref}
                          style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                            objectPosition: "center",
                            pointerEvents: "none",
                          }}
                        />
                      </a>
                    );
                  }}
                </Item>
              </SwiperSlide>
            );
          })}
          <div className="swiper-button-next button-style-arrow thumbs-next"></div>
          <div className="swiper-button-prev button-style-arrow thumbs-prev"></div>
        </Swiper>
      </Gallery>

      <Swiper
        key={`thumbs-${sliderKey}`}
        direction="horizontal"
        spaceBetween={10}
        slidesPerView={5}
        className="tf-product-media-thumbs other-image-zoom"
        onSwiper={setThumbsSwiper}
        modules={[Thumbs]}
        breakpoints={{
          0: {
            slidesPerView: 3,
          },
          768: {
            slidesPerView: 4,
          },
          1024: {
            slidesPerView: 5,
          },
        }}
        style={{ marginTop: 0, marginBottom: 0 }}
      >
        {images.map((slide, index) => (
          <SwiperSlide key={index} className="stagger-item">
            <button
              type="button"
              className="item"
              onClick={() => {
                // Thumbnail only switches the main image; user opens modal by clicking the main image
                if (mainSwiper && !mainSwiper.destroyed) {
                  mainSwiper.slideTo(index);
                }
              }}
              style={{
                border: "none",
                padding: 0,
                background: "none",
                cursor: "pointer",
                display: "block",
                width: "100%",
              }}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={slide.smallImgSrc || slide.imgSrc}
                alt={slide.alt}
                width={133}
                height={100}
                style={{ objectFit: "cover" }}
                loading="eager"
                priority
              />
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
