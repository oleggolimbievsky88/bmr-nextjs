"use client";
import Drift from "drift-zoom";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import { Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Slider3BottomThumbs({ productId, selectedColor }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [product, setProduct] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);

  console.log("Slider3BottomThumbs rendered with:", {
    productId,
    selectedColor: selectedColor
      ? {
          ColorID: selectedColor.ColorID,
          ColorName: selectedColor.ColorName,
        }
      : null,
    mainSwiper: !!mainSwiper,
    product: !!product,
  });

  // Fetch product data from the API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/product-by-id?id=${productId}`);
        if (!response.ok) throw new Error("Failed to fetch product");

        const data = await response.json();
        console.log("Product data fetched:", data.product);
        setProduct(data.product);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [productId]);

  // Effect to handle image switching when color changes
  useEffect(() => {
    console.log("Image switching effect triggered:", {
      selectedColor: selectedColor
        ? {
            ColorID: selectedColor.ColorID,
            ColorName: selectedColor.ColorName,
          }
        : null,
      productImages: product?.images?.length,
      mainSwiper: !!mainSwiper,
      productExists: !!product,
    });

    if (product?.images?.length > 0 && mainSwiper) {
      // Default to first image
      let imageIndex = 0;

      // If a color is provided, try to match it
      if (selectedColor) {
        console.log("Selected color details:", {
          ColorID: selectedColor.ColorID,
          ColorName: selectedColor.ColorName,
        });

        console.log("Product images:", product.images);

        if (selectedColor.ColorID === 1) {
          // Black Hammertone - show second image if available
          imageIndex = Math.min(1, product.images.length - 1);
          console.log(
            "Black Hammertone selected, switching to image index:",
            imageIndex
          );
        } else if (selectedColor.ColorID === 2) {
          // Red - show first image
          imageIndex = 0;
          console.log("Red selected, switching to image index:", imageIndex);
        }

        console.log(
          `Switching to image ${imageIndex} for color: ${selectedColor.ColorName} (ColorID: ${selectedColor.ColorID})`
        );

        try {
          console.log("Attempting to slide to image index:", imageIndex);
          console.log("Main swiper object:", mainSwiper);
          mainSwiper.slideTo(imageIndex);
          console.log("Image switch successful");
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

      console.log("Drift initialization:", {
        driftElements: driftAll.length,
        paneFound: !!pane,
        paneElement: pane,
        paneDisplay: pane ? pane.style.display : "N/A",
        paneVisibility: pane ? pane.style.visibility : "N/A",
      });

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
                console.log("Drift zoom pane shown");
                pane.style.display = "block";
              },
              onHide: function () {
                console.log("Drift zoom pane hidden");
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
              height: "500px",
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
          getThumbBoundsFn: function (index) {
            const thumbnail = document.querySelectorAll(
              ".tf-product-media-thumbs .item img"
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
      >
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
          onSwiper={(swiper) => {
            console.log("Main swiper initialized:", swiper);
            setMainSwiper(swiper);
          }}
        >
          {images.map((slide, index) => (
            <SwiperSlide key={index}>
              <Item
                original={slide.imgSrc}
                thumbnail={slide.imgSrc}
                width={slide.width}
                height={slide.height || 500}
              >
                {({ ref, open }) => (
                  <a
                    className="item"
                    data-pswp-width={slide.width}
                    data-pswp-height={slide.height || 500}
                    onClick={open}
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  >
                    <Image
                      className="tf-image-zoom lazyload"
                      data-zoom={slide.imgSrc}
                      src={slide.imgSrc}
                      alt={slide.alt}
                      width={slide.width}
                      height={slide.height || 500}
                      ref={ref}
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "contain",
                        objectPosition: "center",
                      }}
                    />
                  </a>
                )}
              </Item>
            </SwiperSlide>
          ))}
          <div className="swiper-button-next button-style-arrow thumbs-next"></div>
          <div className="swiper-button-prev button-style-arrow thumbs-prev"></div>
        </Swiper>
      </Gallery>

      <Swiper
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
            <div className="item">
              <Image
                className="lazyload"
                src={slide.smallImgSrc || slide.imgSrc} // Use small image for thumbnails, fallback to large if small doesn't exist
                alt={slide.alt}
                width={133}
                height={100}
                style={{ objectFit: "cover" }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
