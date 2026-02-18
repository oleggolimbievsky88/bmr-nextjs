"use client";
import { useContextElement } from "@/context/Context";
import { useEffect, useState } from "react";
import { ProductCardWishlist } from "../shopCards/ProductCardWishlist";
import Link from "next/link";

export default function Wishlist() {
  const { wishList } = useContextElement();
  const [wishListItems, setWishListItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wishList?.length) {
      setWishListItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ids = [
      ...new Set(wishList.map((x) => Number(x)).filter((n) => !isNaN(n))),
    ];
    Promise.all(
      ids.map((id) =>
        fetch(`/api/product-by-id?id=${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => (data?.product ? { ...data.product } : null)),
      ),
    )
      .then((results) => {
        setWishListItems(results.filter(Boolean));
      })
      .finally(() => setLoading(false));
  }, [wishList]);

  return (
    <section className="wishlist-section">
      <div className="container">
        {loading ? (
          <div className="wishlist-loading" aria-live="polite">
            <div className="wishlist-loading-spinner" aria-hidden="true" />
            <span className="wishlist-loading-text">
              Loading your wishlist…
            </span>
          </div>
        ) : wishListItems.length > 0 ? (
          <>
            <p className="wishlist-count">
              {wishListItems.length} item{wishListItems.length !== 1 ? "s" : ""}{" "}
              saved
            </p>
            <div className="wishlist-grid">
              {wishListItems.map((elm) => (
                <ProductCardWishlist
                  key={elm.ProductID || elm.id}
                  product={elm}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon" aria-hidden="true">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h2 className="wishlist-empty-title">Your wishlist is empty</h2>
            <p className="wishlist-empty-text">
              Save parts you like here so you can find them quickly later.
            </p>
            <Link href="/products" className="wishlist-empty-cta">
              Explore products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
