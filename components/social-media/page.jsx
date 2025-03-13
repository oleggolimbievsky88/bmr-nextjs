'use client';

import { useEffect, useState } from 'react';
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import Image from "next/image";

export default function SocialMediaPage({ type = 'video' }) {
  const [socialMediaPosts, setSocialMediaPosts] = useState([
    { PostID: 1, Title: 'Post 1', Thumbnail: 'https://via.placeholder.com/360', Description: 'Description for Post 1' },
    { PostID: 2, Title: 'Post 2', Thumbnail: 'https://via.placeholder.com/360', Description: 'Description for Post 2' },
    // Add more dummy social media post data as needed
  ]);

  const {
    setQuickViewItem,
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();

  const headerTitle = type === 'social' ? 'Social Media' : 'Videos';

  return (
    <section className="flat-spacing-1 pt_0">
      <div className="container">
        <div className="flat-title">
          <span className="title wow fadeInUp home-title" data-wow-delay="0s">
            {headerTitle}
          </span>
          <h6 className="home-title-description text-center text-muted">
            Explore our latest social media posts and updates.
          </h6>
        </div>

        <div className="row">
          {socialMediaPosts.map((post) => (
            <div key={post.PostID} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="card-product bg_white radius-20 h-100">
                <div className="card-product-wrapper border-line h-100 d-flex flex-column">
                  <Link
                    href={`/social-media/${post.PostID}`}
                    className="product-img"
                  >
                    <Image
                      className="lazyload img-product mb-2"
                      src={post.Thumbnail}
                      alt="social-media-thumbnail"
                      width={360}
                      height={360}
                    />
                  </Link>
                  <div className="list-product-btn mt-auto">
                    <a
                      href="#quick_add"
                      onClick={() => setQuickAddItem(post.PostID)}
                      data-bs-toggle="modal"
                      className="box-icon bg_white quick-add tf-btn-loading"
                    >
                      <span className="icon icon-bag" />
                      <span className="tooltip">Quick Add</span>
                    </a>
                    <a
                      onClick={() => addToWishlist(post.PostID)}
                      className="box-icon bg_white wishlist btn-icon-action"
                    >
                      <span
                        className={`icon icon-heart ${
                          isAddedtoWishlist(post.PostID) ? "added" : ""
                        }`}
                      />
                      <span className="tooltip">
                        {isAddedtoWishlist(post.PostID)
                          ? "Already Wishlisted"
                          : "Add to Wishlist"}
                      </span>
                    </a>
                    <a
                      href="#compare"
                      data-bs-toggle="offcanvas"
                      onClick={() => addToCompareItem(post.PostID)}
                      className="box-icon bg_white compare btn-icon-action"
                    >
                      <span
                        className={`icon icon-compare ${
                          isAddedtoCompareItem(post.PostID) ? "added" : ""
                        }`}
                      />
                      <span className="tooltip">
                        {isAddedtoCompareItem(post.PostID)
                          ? "Already Compared"
                          : "Add to Compare"}
                      </span>
                    </a>
                    <a
                      href="#quick_view"
                      onClick={() => setQuickViewItem(post)}
                      data-bs-toggle="modal"
                      className="box-icon bg_white quickview tf-btn-loading"
                    >
                      <span className="icon icon-view" />
                      <span className="tooltip">Quick View</span>
                    </a>
                  </div>
                  <div className="card-product-info mt-2">
                    <div className="NewProductPartNumber">{post.Title}</div>
                    <span className="NewProductPlatformName" style={{fontSize: "14px", fontWeight: "bold", margin: "0px", padding: "0px", lineHeight: "0.5"}}>{post.Description}</span>  
                    <Link href={`/social-media/${post.PostID}`} className="title link">
                      {post?.Title}
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