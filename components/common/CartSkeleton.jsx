export default function CartSkeleton() {
  return (
    <div className="cart-skeleton">
      {/* Order Summary Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">ORDER SUMMARY</h4>
        <div
          className="skeleton-text"
          style={{ width: "80px", height: "20px" }}
        ></div>
      </div>

      {/* Cart Items Skeleton */}
      <div className="cart-items-skeleton">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="cart-item-skeleton d-flex align-items-center mb-3 p-3 border rounded"
          >
            {/* Product Image Skeleton */}
            <div
              className="skeleton-image me-3"
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
              }}
            ></div>

            {/* Product Details Skeleton */}
            <div className="flex-grow-1">
              <div
                className="skeleton-text mb-2"
                style={{ width: "70%", height: "16px" }}
              ></div>
              <div
                className="skeleton-text mb-1"
                style={{ width: "50%", height: "14px" }}
              ></div>
              <div
                className="skeleton-text mb-2"
                style={{ width: "40%", height: "14px" }}
              ></div>

              {/* Quantity and Price Skeleton */}
              <div className="d-flex justify-content-between align-items-center">
                <div
                  className="skeleton-text"
                  style={{ width: "60px", height: "32px" }}
                ></div>
                <div
                  className="skeleton-text"
                  style={{ width: "80px", height: "18px" }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Code Skeleton */}
      <div className="coupon-skeleton mb-3">
        <div
          className="skeleton-text mb-2"
          style={{ width: "60%", height: "16px" }}
        ></div>
        <div className="d-flex gap-2">
          <div
            className="skeleton-text flex-grow-1"
            style={{ height: "40px" }}
          ></div>
          <div
            className="skeleton-text"
            style={{ width: "80px", height: "40px" }}
          ></div>
        </div>
      </div>

      {/* Totals Skeleton */}
      <div className="totals-skeleton">
        <div className="d-flex justify-content-between mb-2">
          <div
            className="skeleton-text"
            style={{ width: "80px", height: "16px" }}
          ></div>
          <div
            className="skeleton-text"
            style={{ width: "60px", height: "16px" }}
          ></div>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <div
            className="skeleton-text"
            style={{ width: "80px", height: "16px" }}
          ></div>
          <div
            className="skeleton-text"
            style={{ width: "60px", height: "16px" }}
          ></div>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <div
            className="skeleton-text"
            style={{ width: "80px", height: "16px" }}
          ></div>
          <div
            className="skeleton-text"
            style={{ width: "60px", height: "16px" }}
          ></div>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <div
            className="skeleton-text"
            style={{ width: "80px", height: "16px" }}
          ></div>
          <div
            className="skeleton-text"
            style={{ width: "60px", height: "16px" }}
          ></div>
        </div>
        <hr />
        <div className="d-flex justify-content-between mb-3">
          <div
            className="skeleton-text"
            style={{ width: "100px", height: "20px" }}
          ></div>
          <div
            className="skeleton-text"
            style={{ width: "80px", height: "20px" }}
          ></div>
        </div>
      </div>

      {/* Terms Checkbox Skeleton */}
      <div className="terms-skeleton mb-3">
        <div className="d-flex align-items-center">
          <div
            className="skeleton-text me-2"
            style={{ width: "20px", height: "20px" }}
          ></div>
          <div
            className="skeleton-text"
            style={{ width: "80%", height: "16px" }}
          ></div>
        </div>
      </div>

      {/* Continue Button Skeleton */}
      <div
        className="skeleton-text"
        style={{ width: "100%", height: "50px" }}
      ></div>

      <style jsx>{`
        .skeleton-text {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-image {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .cart-item-skeleton {
          background-color: #fafafa;
        }
      `}</style>
    </div>
  );
}
