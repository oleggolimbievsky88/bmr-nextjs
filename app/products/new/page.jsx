// app/products/new/page.js
"use client";

import { useEffect, useState } from "react";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid } from "swiper/modules";
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/navigation";

export default function NewProductsPage({ scrachDent = "0" }) {
  const [newProducts, setNewProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigationClass = scrachDent === "1" ? "scratch-dent" : "new-products";

  const {
    setQuickViewItem,
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/products/new-products?scrachDent=${scrachDent}&limit=35`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setNewProducts(Array.isArray(data) ? data : []);
        setError(null);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.message);
        setNewProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [scrachDent]);

  return (
    <section className="flat-spacing-1">
      <div className="container">
        <div className="flat-title">
          <span className="title wow fadeInUp home-title" data-wow-delay="0s">
            {scrachDent === "1" ? "Scratch & Dent" : "New Products"}
          </span>
          <h6 className="home-title-description text-center text-muted">
            {scrachDent === "1"
              ? "BMR Scratch and Dent products have minor to moderate aesthetic defects. Due to the cost of stripping and recoating, BMR has chosen to leave the parts 'as-is' and sell them at a discounted price."
              : "Check out the latest for your vehicle from BMR Suspension!"}
          </h6>
        </div>

        <div
          className={`position-relative slider-container ${navigationClass}-slider`}
        >
          <Swiper
            modules={[Navigation, Grid]}
            navigation={{
              nextEl: `.${navigationClass}-next`,
              prevEl: `.${navigationClass}-prev`,
            }}
            grid={{
              rows: 2,
              fill: "row",
            }}
            spaceBetween={30}
            slidesPerView={4}
            breakpoints={{
              0: {
                slidesPerView: 1,
              },
              576: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              992: {
                slidesPerView: 4,
              },
            }}
            className="swiper-container"
          >
            {isLoading ? (
              <SwiperSlide>
                <div className="text-center p-5">Loading products...</div>
              </SwiperSlide>
            ) : error ? (
              <SwiperSlide>
                <div className="text-center p-5 text-danger">
                  Error loading products: {error}
                </div>
              </SwiperSlide>
            ) : newProducts.length === 0 ? (
              <SwiperSlide>
                <div className="text-center p-5">No products found.</div>
              </SwiperSlide>
            ) : (
              Array.isArray(newProducts) &&
              newProducts.map((product) => (
                <SwiperSlide key={product.ProductID}>
                  <div className="card-product bg_white radius-20 h-100">
                    <div className="card-product-wrapper border-line h-100 d-flex flex-column">
                      <Link
                        href={`/product/${product.ProductID}`}
                        className="product-img"
                      >
                        <Image
                          className="lazyload img-product mb-2"
                          src={`https://bmrsuspension.com/siteart/products/${
                            product.ImageLarge || product.ImageSmall
                          }`}
                          alt="image-product"
                          width={350}
                          height={350}
                        />
                        <Image
                          className="lazyload img-hover"
                          src={`https://bmrsuspension.com/siteart/products/${product.ImageSmall}`}
                          alt="image-product"
                          width={360}
                          height={360}
                        />
                      </Link>
                      <div className="list-product-btn mt-auto">
                        <a
                          href="#quick_add"
                          onClick={() => setQuickAddItem(product.ProductID)}
                          data-bs-toggle="modal"
                          className="box-icon bg_white quick-add tf-btn-loading"
                        >
                          <span className="icon icon-bag" />
                          <span className="tooltip">Quick Add</span>
                        </a>
                        <a
                          onClick={() => addToWishlist(product.ProductID)}
                          className="box-icon bg_white wishlist btn-icon-action"
                        >
                          <span
                            className={`icon icon-heart ${
                              isAddedtoWishlist(product.ProductID)
                                ? "added"
                                : ""
                            }`}
                          />
                          <span className="tooltip">
                            {isAddedtoWishlist(product.ProductID)
                              ? "Already Wishlisted"
                              : "Add to Wishlist"}
                          </span>
                        </a>
                        <a
                          href="#compare"
                          data-bs-toggle="offcanvas"
                          onClick={() => addToCompareItem(product.ProductID)}
                          className="box-icon bg_white compare btn-icon-action"
                        >
                          <span
                            className={`icon icon-compare ${
                              isAddedtoCompareItem(product.ProductID)
                                ? "added"
                                : ""
                            }`}
                          />
                          <span className="tooltip">
                            {isAddedtoCompareItem(product.ProductID)
                              ? "Already Compared"
                              : "Add to Compare"}
                          </span>
                        </a>
                        <a
                          href="#quick_view"
                          onClick={() => setQuickViewItem(product)}
                          data-bs-toggle="modal"
                          className="box-icon bg_white quickview tf-btn-loading"
                        >
                          <span className="icon icon-view" />
                          <span className="tooltip">Quick View</span>
                        </a>
                      </div>
                      <div className="card-product-info mt-2">
                        <div className="NewProductPartNumber">
                          {product.PartNumber}
                        </div>
                        <span
                          className="NewProductPlatformName"
                          style={{
                            fontSize: "14px",
                            fontWeight: "bold",
                            margin: "0px",
                            padding: "0px",
                            lineHeight: "0.5",
                          }}
                        >
                          {product.PlatformName}
                        </span>
                        <Link
                          href={`/product/${product.ProductID}`}
                          className="title link"
                        >
                          {product?.ProductName}
                        </Link>
                        <span className="price"> ${product?.Price} </span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))
            )}
          </Swiper>
          <div className={`${navigationClass}-prev swiper-nav-button`}></div>
          <div className={`${navigationClass}-next swiper-nav-button`}></div>
        </div>
      </div>

      <style jsx>{`
        .slider-container {
          padding: 0 50px;
        }
        .swiper-container {
          padding: 20px 0;
        }
        :global(.swiper-nav-button) {
          background-color: #dc3545;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        :global(.new-products-prev),
        :global(.scratch-dent-prev) {
          left: 0;
        }
        :global(.new-products-next),
        :global(.scratch-dent-next) {
          right: 0;
        }
        :global(.swiper-nav-button::after) {
          font-family: "swiper-icons";
          font-size: 20px;
          color: white;
        }
        :global(.new-products-prev::after),
        :global(.scratch-dent-prev::after) {
          content: "prev";
        }
        :global(.new-products-next::after),
        :global(.scratch-dent-next::after) {
          content: "next";
        }
        :global(.swiper-grid-column > .swiper-wrapper) {
          flex-direction: row;
        }
      `}</style>
    </section>
  );
}
