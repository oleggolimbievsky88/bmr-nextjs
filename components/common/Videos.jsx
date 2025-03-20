"use client";

import { useEffect, useState } from "react";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import Image from "next/image";

export default function VideoPage() {
  const [videos, setVideos] = useState([
    {
      VideoID: 1,
      Title: "Video 1",
      Thumbnail: "https://bmrsuspension.com/siteart/videos/bmr_you_tube.jpg",
      Description: "Description for Video 1",
    },
    {
      VideoID: 2,
      Title: "Video 2",
      Thumbnail: "https://bmrsuspension.com/siteart/videos/bmr_you_tube.jpg",
      Description: "Description for Video 2",
    },
    {
      VideoID: 3,
      Title: "Video 3",
      Thumbnail: "https://bmrsuspension.com/siteart/videos/bmr_you_tube.jpg",
      Description: "Description for Video 3",
    },
    {
      VideoID: 4,
      Title: "Video 4",
      Thumbnail: "https://bmrsuspension.com/siteart/videos/bmr_you_tube.jpg",
      Description: "Description for Video 4",
    },
    // Add more dummy video data as needed
  ]);

  const {
    setQuickViewItem,
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();

  return (
    <section className="flat-spacing-1 pt_0">
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

        <div className="row">
          {videos.map((video) => (
            <div
              key={video.VideoID}
              className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
            >
              <div className="card-product bg_white radius-20 h-100">
                <div className="card-product-wrapper border-line h-100 d-flex flex-column">
                  <Link
                    href={"https://www.youtube.com/user/BMRSuspension"}
                    className="product-img"
                    target="_blank"
                  >
                    <Image
                      className="lazyload img-product mb-2"
                      src={video.Thumbnail}
                      alt="video-thumbnail"
                      width={360}
                      height={360}
                      style={{
                        borderRadius: "10px",
                        border: "1px solid #707070",
                      }}
                    />
                  </Link>
                  <div className="list-product-btn mt-auto">
                    <a
                      href="#quick_add"
                      onClick={() => setQuickAddItem(video.VideoID)}
                      data-bs-toggle="modal"
                      className="box-icon bg_white quick-add tf-btn-loading"
                    >
                      <span className="icon icon-bag" />
                      <span className="tooltip">Quick Add</span>
                    </a>
                    <a
                      onClick={() => addToWishlist(video.VideoID)}
                      className="box-icon bg_white wishlist btn-icon-action"
                    >
                      <span
                        className={`icon icon-heart ${
                          isAddedtoWishlist(video.VideoID) ? "added" : ""
                        }`}
                      />
                      <span className="tooltip">
                        {isAddedtoWishlist(video.VideoID)
                          ? "Already Wishlisted"
                          : "Add to Wishlist"}
                      </span>
                    </a>
                    <a
                      href="#compare"
                      data-bs-toggle="offcanvas"
                      onClick={() => addToCompareItem(video.VideoID)}
                      className="box-icon bg_white compare btn-icon-action"
                    >
                      <span
                        className={`icon icon-compare ${
                          isAddedtoCompareItem(video.VideoID) ? "added" : ""
                        }`}
                      />
                      <span className="tooltip">
                        {isAddedtoCompareItem(video.VideoID)
                          ? "Already Compared"
                          : "Add to Compare"}
                      </span>
                    </a>
                    <a
                      href="#quick_view"
                      onClick={() => setQuickViewItem(video)}
                      data-bs-toggle="modal"
                      className="box-icon bg_white quickview tf-btn-loading"
                    >
                      <span className="icon icon-view" />
                      <span className="tooltip">Quick View</span>
                    </a>
                  </div>
                  <div className="card-product-info mt-2">
                    <div className="NewProductPartNumber">{video.Title}</div>
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
                      {video.Description}
                    </span>
                    <Link
                      href={`/video/${video.VideoID}`}
                      className="title link"
                    >
                      {video?.Title}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
