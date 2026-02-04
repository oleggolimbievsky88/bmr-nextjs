"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PayPalReturnPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing payment information. Please try checkout again.");
      return;
    }

    fetch(`/api/paypal/capture?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.orderNumber) {
          setOrderNumber(data.orderNumber);
          setStatus("success");
          window.location.href = `/confirmation?orderId=${data.orderNumber}`;
        } else {
          setStatus("error");
          const msg = data.message || "Payment could not be completed.";
          setMessage(
            data.details ? `${msg} ${JSON.stringify(data.details)}` : msg
          );
        }
      })
      .catch((err) => {
        console.error("PayPal capture error:", err);
        setStatus("error");
        setMessage(
          "Something went wrong. Please contact support with your PayPal transaction details."
        );
      });
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Completing your order...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <h2 className="h5 alert-heading">Payment could not be completed</h2>
          <p className="mb-0">{message}</p>
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

  return (
    <div className="container py-5 text-center">
      <p>Redirecting to your order confirmation...</p>
      {orderNumber && <p className="text-muted small">Order {orderNumber}</p>}
    </div>
  );
}
