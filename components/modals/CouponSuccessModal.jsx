"use client";
import { useEffect, useState } from "react";

export default function CouponSuccessModal({ coupon, show, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (show && coupon) {
      setShouldRender(true);
      // Small delay to trigger fade-in animation
      setTimeout(() => setIsVisible(true), 10);

      // Auto-fade away after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);

      return () => clearTimeout(timer);
    } else {
      handleClose();
    }
  }, [show, coupon]);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for fade-out animation before unmounting
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 300);
  };

  if (!shouldRender || !coupon) return null;

  // Handle both old and new coupon field names
  const discountType = coupon.discountType || coupon.valueType;
  const discountValue = coupon.discountValue || coupon.value;

  const discountText =
    discountType === "percentage" ||
    discountType === "%" ||
    discountType === "0"
      ? `${discountValue}% OFF`
      : discountType === "fixed_amount" ||
        discountType === "fixed" ||
        discountType === "$"
      ? `$${discountValue} OFF`
      : discountValue > 0
      ? `$${discountValue} OFF`
      : "Discount Applied";

  return (
    <div
      className={`coupon-success-modal-overlay ${isVisible ? "visible" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`coupon-success-modal ${isVisible ? "visible" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="coupon-modal-close"
          onClick={handleClose}
          aria-label="Close"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="coupon-modal-content">
          <div className="coupon-modal-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#28a745"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M8 12L11 15L16 9"
                stroke="#28a745"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h3 className="coupon-modal-title">Coupon Applied Successfully!</h3>

          <div className="coupon-modal-code">
            <strong>Code:</strong> {coupon.code}
          </div>

          {coupon.name && <h4 className="coupon-modal-name">{coupon.name}</h4>}

          {coupon.description && (
            <p className="coupon-modal-description">{coupon.description}</p>
          )}

          <div className="coupon-modal-discount">
            <span className="discount-badge">{discountText}</span>
            {coupon.freeShipping && (
              <span className="shipping-badge">FREE SHIPPING</span>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .coupon-success-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }

        .coupon-success-modal-overlay.visible {
          opacity: 1;
        }

        .coupon-success-modal {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          transform: scale(0.9) translateY(-20px);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .coupon-success-modal.visible {
          transform: scale(1) translateY(0);
          opacity: 1;
        }

        .coupon-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
          transition: color 0.2s ease;
          border-radius: 50%;
          width: 32px;
          height: 32px;
        }

        .coupon-modal-close:hover {
          color: #000;
          background-color: #f8f9fa;
        }

        .coupon-modal-content {
          text-align: center;
        }

        .coupon-modal-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
          animation: checkmark 0.6s ease-in-out;
        }

        @keyframes checkmark {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        .coupon-modal-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #28a745;
          margin-bottom: 1rem;
          font-family: inherit;
        }

        .coupon-modal-code {
          font-size: 1rem;
          color: #6c757d;
          margin-bottom: 1rem;
          padding: 0.75rem 1rem;
          background-color: #f8f9fa;
          border-radius: 8px;
          font-family: monospace;
        }

        .coupon-modal-code strong {
          color: #333;
          margin-right: 0.5rem;
        }

        .coupon-modal-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.75rem;
          font-family: inherit;
        }

        .coupon-modal-description {
          font-size: 0.95rem;
          color: #6c757d;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .coupon-modal-discount {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: center;
        }

        .discount-badge,
        .shipping-badge {
          display: inline-block;
          padding: 0.5rem 1.25rem;
          border-radius: 25px;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
        }

        .discount-badge {
          background-color: #dc3545;
          color: white;
        }

        .shipping-badge {
          background-color: #28a745;
          color: white;
        }

        @media (max-width: 576px) {
          .coupon-success-modal {
            padding: 1.5rem;
            width: 95%;
          }

          .coupon-modal-title {
            font-size: 1.25rem;
          }

          .coupon-modal-name {
            font-size: 1.1rem;
          }

          .coupon-modal-description {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
