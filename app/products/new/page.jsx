// app/products/new/page.js
'use client';

import { useEffect, useState } from 'react';
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import Image from "next/image";

export default function NewProductsPage({ scrachDent = "0" }) {
  const [newProducts, setNewProducts] = useState([]);

  useEffect(() => {
    async function fetchNewProducts() {
      const response = await fetch('/api/products/new');
      const data = await response.json();
      setNewProducts(data);
    }

    fetchNewProducts();
  }, []);

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
          <span className="title wow fadeInUp" data-wow-delay="0s">
            {scrachDent === "1" ? "Scratch & Dent" : "New Products"}
          </span>
        </div>

        <div className="row">
          {newProducts.map((product) => (
            <div key={product.ProductID} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="card-product bg_white radius-20 h-100">
                <div className="card-product-wrapper border-line h-100 d-flex flex-column">
                  <Link
                    href={`/product-detail/${product.ProductID}`}
                    className="product-img"
                  >
                    <Image
                      className="lazyload img-product mb-2"
                      src={`https://bmrsuspension.com/siteart/products/${product.ImageLarge}`}
                      alt="image-product"
                      width={1200}
                      height={1200}
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
                          isAddedtoWishlist(product.ProductID) ? "added" : ""
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
                          isAddedtoCompareItem(product.ProductID) ? "added" : ""
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
                    <div className="NewProductPartNumber">{product.PartNumber}</div>
                    <Link href={`/product-detail/${product.ProductID}`} className="title link">
                      {product?.ProductName}
                    </Link>
                    <span className="price"> ${product?.Price} </span>
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
