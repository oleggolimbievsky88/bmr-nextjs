"use client";

import React, { useEffect, useState } from "react";
import Pagination from "../common/Pagination";
import Image from "next/image";
import Link from "next/link";

const FALLBACK_ITEMS = [
  {
    imgSrc: "/images/collections/collection-8.jpg",
    alt: "collection-img",
    title: "New Products",
    href: "/products/new",
  },
  {
    imgSrc: "/images/collections/collection-9.jpg",
    alt: "collection-img",
    title: "BMR Merchandise",
    href: "/products/bmr-merchandise",
  },
  {
    imgSrc: "/images/collections/collection-10.jpg",
    alt: "collection-img",
    title: "Gift Cards",
    href: "/products/gift-cards",
  },
];

export default function ShopCollections() {
  const [items, setItems] = useState(FALLBACK_ITEMS);

  useEffect(() => {
    fetch("/api/homepage-collections?type=maincategories")
      .then((res) => res.json())
      .then((data) => {
        if (data.items?.length) setItems(data.items);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="flat-spacing-1">
      <div className="container">
        <div className="tf-grid-layout lg-col-3 tf-col-2">
          {items.map((item, index) => (
            <div className="collection-item hover-img" key={item.id || index}>
              <div className="collection-inner">
                <Link
                  href={item.href || "/shop-default"}
                  className="collection-image img-style"
                >
                  <Image
                    className="lazyload"
                    data-src={item.imgSrc}
                    alt={item.alt}
                    src={item.imgSrc}
                    width={460}
                    height={460}
                  />
                </Link>
                <div className="collection-content">
                  <Link
                    href={item.href || "/shop-default"}
                    className="tf-btn collection-title hover-icon"
                  >
                    <span>{item.title}</span>
                    <i className="icon icon-arrow1-top-left" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <ul className="tf-pagination-wrap tf-pagination-list">
          <Pagination />
        </ul>
      </div>
    </section>
  );
}
