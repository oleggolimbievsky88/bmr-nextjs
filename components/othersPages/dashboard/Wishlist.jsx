"use client";

import { ProductCardWishlist } from "@/components/shopCards/ProductCardWishlist";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    <div className="my-account-content account-wishlist">
      {loading ? (
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="grid-layout wrapper-shop" data-grid="grid-3">
          {wishListItems.map((elm) => (
            <ProductCardWishlist product={elm} key={elm.ProductID || elm.id} />
          ))}
        </div>
      )}
      {!wishListItems.length && (
        <>
          <div
            className="row align-items-center w-100"
            style={{ rowGap: "20px" }}
          >
            <div className="col-lg-3 col-md-6 fs-18">
              Your wishlist is empty
            </div>
            <div className="col-lg-3  col-md-6">
              <Link
                href={`/products`}
                className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
              >
                Explore Products!
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
