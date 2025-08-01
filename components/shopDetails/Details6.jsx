"use client";
import React, { useState } from "react";
import Slider2 from "./sliders/Slider2";
import Slider3 from "./sliders/Slider3";
import Image from "next/image";
import CountdownComponent from "../common/Countdown";
import BoughtTogether from "./BoughtTogether";
import {
  colors,
  paymentImages,
  sizeOptions,
  greaseOptions,
} from "@/data/singleProductOptions";
import StickyItem from "./StickyItem";
import Quantity from "./Quantity";
import Slider3BottomThumbs from "./sliders/Slider3BottomThumbs";

export default function Details6({ product }) {
  const [currentColor, setCurrentColor] = useState(colors[0]);
  const [currentGrease, setCurrentGrease] = useState(greaseOptions[0]);
  return (
    <section
      className="flat-spacing-4 pt_0"
      style={{ maxWidth: "100vw", overflow: "clip" }}
    >
      <div className="tf-main-product section-image-zoom">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="tf-product-media-wrap thumbs-bottom sticky-top">
                <div className="thumbs-slider" style={{ maxHeight: 600 }}>
                  <Slider3BottomThumbs productId={product.ProductID} />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="tf-product-info-wrap position-relative">
                <div className="tf-zoom-main" />
                <div className="tf-product-info-list other-image-zoom">
                  <div className="tf-product-info-title">
                    <h5>{product?.ProductName}</h5>
                  </div>
                  <div className="tf-breadcrumb-list">
                    <span>
                      <h6
                        style={{
                          fontSize: 15,
                          marginBottom: 0,
                          marginTop: 0,
                          pt: 0,
                          pb: 0,
                        }}
                      >
                        Part Number: {product.PartNumber}
                      </h6>
                    </span>
                  </div>

                  <div className="tf-product-info-price">
                    <div className="price-on-sale">
                      {product.Price ? `$${product.Price}` : "Price"}
                    </div>
                    {/* <div className="compare-at-price">$10.00</div>
                    <div className="badges-on-sale">
                      <span>20</span>% OFF
                    </div> */}
                  </div>
                  {/* <div className="tf-product-info-liveview">
                    <div className="liveview-count">6</div>
                    <p className="fw-6">People are viewing this right now</p>
                  </div> */}
                  {/* <div className="tf-product-info-countdown">
                    <div className="countdown-wrap">
                      <div className="countdown-title">
                        <i className="icon-time tf-ani-tada" />
                        <p>HURRY UP! SALE ENDS IN:</p>
                      </div>
                      <div className="tf-countdown style-1">
                        <div className="js-countdown">
                          <CountdownComponent
                            targetDate="2025-08-07"
                            labels="Days :,Hours :,Mins :,Secs"
                          />
                        </div>
                      </div>
                    </div>
                  </div> */}
                  <div className="tf-product-info-variant-picker">
                    <div className="variant-picker-item">
                      <div className="variant-picker-label">
                        Color:{" "}
                        <span className="fw-6 variant-picker-label-value">
                          {currentColor.value}
                        </span>
                      </div>
                      <form className="variant-picker-values">
                        {colors.map((color) => (
                          <React.Fragment key={color.id}>
                            <input
                              type="radio"
                              name={color.id}
                              readOnly
                              checked={currentColor == color}
                            />
                            <label
                              onClick={() => setCurrentColor(color)}
                              className="hover-tooltip radius-60"
                              htmlFor={color.id}
                              data-value={color.value}
                            >
                              <span
                                className={`btn-checkbox ${color.className}`}
                              />
                              <span className="tooltip">{color.value}</span>
                            </label>
                          </React.Fragment>
                        ))}
                      </form>
                    </div>
                    <div className="variant-picker-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="variant-picker-label">
                          Grease:{" "}
                          <span className="fw-6 variant-picker-label-value">
                            {currentGrease.value}
                          </span>
                        </div>
                        {/* <a
                          href="#find_size"
                          data-bs-toggle="modal"
                          className="find-size fw-6"
                        >
                          Product Fitment Guide
                        </a> */}
                      </div>
                      <form className="variant-picker-values">
                        {greaseOptions.map((grease) => (
                          <React.Fragment key={grease.id}>
                            <input
                              type="radio"
                              name="grease1"
                              id={grease.id}
                              readOnly
                              checked={currentGrease == grease}
                            />
                            <label
                              onClick={() => setCurrentGrease(grease)}
                              className="style-text"
                              htmlFor={grease.id}
                              data-value={grease.value}
                            >
                              <p>{grease.value}</p>
                            </label>
                          </React.Fragment>
                        ))}
                      </form>
                    </div>
                  </div>
                  <div className="tf-product-info-quantity">
                    <div className="quantity-title fw-6">Quantity</div>
                    <Quantity />
                  </div>
                  <div className="tf-product-info-buy-button">
                    <form onSubmit={(e) => e.preventDefault()} className="">
                      <a
                        href="#"
                        className="tf-btn btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn "
                      >
                        <span>Add to cart -&nbsp;</span>
                        <span className="tf-qty-price">${product.Price}</span>
                      </a>
                    </form>
                  </div>
                  {/* <div className="tf-product-bundle-wrap">
                    <div className="title">Frequently Bought Together</div>
                    <BoughtTogether product={product} />
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <StickyItem /> */}
    </section>
  );
}
