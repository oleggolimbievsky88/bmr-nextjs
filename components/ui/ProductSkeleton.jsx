"use client";

export default function ProductSkeleton({ count = 4, grid = true }) {
  return (
    <div className={grid ? "row" : ""}>
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div key={index} className={grid ? "col-md-3 mb-4" : "swiper-slide"}>
            <div className="card h-100 p-3">
              <div
                style={{
                  height: "200px",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "8px",
                  marginBottom: "12px",
                }}
              ></div>
              <div
                style={{
                  height: "14px",
                  width: "40%",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "4px",
                  marginBottom: "8px",
                }}
              ></div>
              <div
                style={{
                  height: "14px",
                  width: "70%",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "4px",
                  marginBottom: "8px",
                }}
              ></div>
              <div
                style={{
                  height: "14px",
                  width: "100%",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "4px",
                  marginBottom: "8px",
                }}
              ></div>
              <div
                style={{
                  height: "18px",
                  width: "30%",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "4px",
                  marginTop: "4px",
                }}
              ></div>
            </div>
          </div>
        ))}
    </div>
  );
}
