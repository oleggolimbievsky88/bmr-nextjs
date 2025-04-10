"use client";

export default function Loading() {
  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-6">
          <div className="product-gallery placeholder-glow">
            <div className="main-image">
              <span
                className="placeholder w-100"
                style={{ height: "600px" }}
              ></span>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="product-details placeholder-glow">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <span className="placeholder col-4"></span>
                </li>
                <li className="breadcrumb-item">
                  <span className="placeholder col-4"></span>
                </li>
                <li className="breadcrumb-item">
                  <span className="placeholder col-4"></span>
                </li>
              </ol>
            </nav>

            <h1 className="product-title">
              <span className="placeholder col-8"></span>
            </h1>

            <div className="product-price">
              <span className="placeholder col-4"></span>
            </div>

            <div className="product-description">
              <span className="placeholder col-12"></span>
              <span className="placeholder col-12"></span>
              <span className="placeholder col-8"></span>
            </div>

            <div className="product-actions">
              <span
                className="placeholder col-12 mb-3"
                style={{ height: "48px" }}
              ></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
