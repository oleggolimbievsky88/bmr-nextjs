"use client";

import Link from "next/link";

export default function PayPalCancelPage() {
  return (
    <div className="container py-5">
      <div className="alert alert-info" role="alert">
        <h2 className="h5 alert-heading">PayPal payment cancelled</h2>
        <p className="mb-0">
          You cancelled the PayPal payment. Your cart has not been charged.
        </p>
      </div>
      <p>
        <Link href="/checkout" className="btn btn-primary">
          Return to checkout
        </Link>{" "}
        <Link href="/products" className="btn btn-outline-secondary">
          Continue shopping
        </Link>
      </p>
    </div>
  );
}
