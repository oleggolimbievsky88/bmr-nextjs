"use client";

export default function Loading() {
  return (
    <div className="p-0 m-0">
      {/* Skeleton for Platform Header */}
      <div
        style={{
          height: "200px",
          backgroundColor: "#e0e0e0",
          marginBottom: "20px",
        }}
      >
        <div className="container">
          <div
            style={{
              height: "80px",
              width: "60%",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              margin: "0 auto",
              borderRadius: "8px",
            }}
          ></div>
        </div>
      </div>

      <div className="container">
        {/* Skeleton for Breadcrumbs */}
        <div
          style={{
            height: "20px",
            width: "50%",
            backgroundColor: "#e0e0e0",
            marginBottom: "30px",
            borderRadius: "4px",
          }}
        ></div>

        {/* Skeleton for Categories */}
        <div className="row mb-5">
          {Array(8)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="col-md-3 mb-4">
                <div className="card p-3">
                  <div
                    style={{
                      height: "120px",
                      backgroundColor: "#e0e0e0",
                      borderRadius: "4px",
                      marginBottom: "10px",
                    }}
                  ></div>
                  <div
                    style={{
                      height: "16px",
                      backgroundColor: "#e0e0e0",
                      borderRadius: "4px",
                      width: "80%",
                      margin: "0 auto",
                    }}
                  ></div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
