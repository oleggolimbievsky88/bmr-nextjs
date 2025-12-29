"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { tfLoopItems } from "@/data/products";
export default function SearchModal() {
  const [quickLinks, setQuickLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuickLinks = async () => {
      try {
        const response = await fetch("/api/menu");
        if (!response.ok) throw new Error("Failed to fetch menu");
        const data = await response.json();

        // Build quick links from menu data
        const links = [];
        if (data.fordLinks && data.fordLinks.length > 0) {
          links.push({ name: "Ford", href: `/products/${data.fordLinks[0].slug}` });
        }
        if (data.gmLateModelLinks && data.gmLateModelLinks.length > 0) {
          links.push({ name: "GM Late Model", href: `/products/${data.gmLateModelLinks[0].slug}` });
        }
        if (data.gmMidMuscleLinks && data.gmMidMuscleLinks.length > 0) {
          links.push({ name: "GM Mid Muscle", href: `/products/${data.gmMidMuscleLinks[0].slug}` });
        }
        if (data.gmClassicMuscleLinks && data.gmClassicMuscleLinks.length > 0) {
          links.push({ name: "GM Classic Muscle", href: `/products/${data.gmClassicMuscleLinks[0].slug}` });
        }
        if (data.moparLinks && data.moparLinks.length > 0) {
          links.push({ name: "Mopar", href: `/products/${data.moparLinks[0].slug}` });
        }

        setQuickLinks(links);
      } catch (err) {
        console.error("Error fetching quick links:", err);
        // Fallback to default links
        setQuickLinks([
          { name: "Ford", href: "/shop-default" },
          { name: "GM Late Model", href: "/shop-default" },
          { name: "GM Mid Muscle", href: "/shop-default" },
          { name: "GM Classic Muscle", href: "/shop-default" },
          { name: "Mopar", href: "/shop-default" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuickLinks();
  }, []);

  return (
    <div className="offcanvas offcanvas-end canvas-search" id="canvasSearch">
      <div className="canvas-wrapper">
        <header className="tf-search-head">
          <div className="title fw-5">
            Search our site
            <div className="close">
              <span
                className="icon-close icon-close-popup"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              />
            </div>
          </div>
          <div className="tf-search-sticky">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="tf-mini-search-frm"
            >
              <fieldset className="text">
                <input
                  type="text"
                  placeholder="Search"
                  className=""
                  name="text"
                  tabIndex={0}
                  defaultValue=""
                  aria-required="true"
                  required
                  suppressHydrationWarning
                />
              </fieldset>
              <button className="" type="submit">
                <i className="icon-search" />
              </button>
            </form>
          </div>
        </header>
        <div className="canvas-body p-0">
          <div className="tf-search-content">
            <div className="tf-cart-hide-has-results">
              <div className="tf-col-quicklink">
                <div className="tf-search-content-title fw-5">Quick links</div>
                <ul className="tf-quicklink-list">
                  {isLoading ? (
                    <li className="tf-quicklink-item">Loading...</li>
                  ) : (
                    quickLinks.map((link, index) => (
                      <li key={index} className="tf-quicklink-item">
                        <Link href={link.href} className="">
                          {link.name}
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div className="tf-col-content">
                <div className="tf-search-content-title fw-5">
                  Need some inspiration?
                </div>
                <div className="tf-search-hidden-inner">
                  {tfLoopItems.map((product, index) => (
                    <div className="tf-loop-item" key={index}>
                      <div className="image">
                        <Link href={`/product-detail/${product.id}`}>
                          <Image
                            alt={product.imgAlt}
                            src={product.imgSrc}
                            width={product.imgWidth}
                            height={product.imgHeight}
                          />
                        </Link>
                      </div>
                      <div className="content">
                        <Link href={`/product-detail/${product.id}`}>
                          {product.title}
                        </Link>
                        <div className="tf-product-info-price">
                          {product.isOnSale ? (
                            <>
                              <div className="compare-at-price">
                                $
                                {(
                                  parseFloat(product.compareAtPrice) || 0
                                ).toFixed(2)}
                              </div>
                              <div className="price-on-sale fw-6">
                                $
                                {(parseFloat(product.salePrice) || 0).toFixed(
                                  2
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="price fw-6">
                              ${(parseFloat(product.price) || 0).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
