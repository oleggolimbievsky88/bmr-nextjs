"use client";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import Image from "next/image";
import { getProductImageUrl } from "@/lib/assets";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid } from "swiper/modules";
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/navigation";

export default function LazyNewProducts({ scratchDent = "0" }) {
  const [products, setProducts] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "100px 0px", // Start loading 100px before the element is visible
  });

  const {
    setQuickViewItem,
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const title = scratchDent === "1" ? "Scratch & Dent" : "New Products";
  const description =
    scratchDent === "1"
      ? "BMR Scratch and Dent products have minor to moderate aesthetic defects. Due to the cost of stripping and recoating, BMR has chosen to leave the parts 'as-is' and sell them at a discounted price."
      : "Check out the latest for your vehicle from BMR Suspension!";

  if (!isClient) {
    return <PlaceholderSection title={title} description={description} />;
  }

  return (
    <div ref={ref}>
      {inView && !hasLoaded ? (
        <NewProductsLoader
          scratchDent={scratchDent}
          title={title}
          description={description}
          onLoaded={(loadedProducts) => {
            setProducts(loadedProducts);
            setHasLoaded(true);
          }}
        />
      ) : hasLoaded ? (
        <NewProductsSection
          products={products}
          title={title}
          description={description}
          contextFunctions={{
            setQuickViewItem,
            setQuickAddItem,
            addToWishlist,
            isAddedtoWishlist,
            addToCompareItem,
            isAddedtoCompareItem,
          }}
        />
      ) : (
        <PlaceholderSection title={title} description={description} />
      )}
    </div>
  );
}

// Placeholder section shown before component comes into view
function PlaceholderSection({ title, description }) {
  return (
    <section className="flat-spacing-1">
      <div className="container">
        <div className="flat-title">
          <span className="title wow fadeInUp home-title" data-wow-delay="0s">
            {title}
          </span>
          <h6 className="home-title-description text-center text-muted">
            {description}
          </h6>
        </div>
        <div
          className="text-center p-5"
          style={{
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="text-muted">
            <i
              className="bi bi-box-seam"
              style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                display: "block",
              }}
            ></i>
            Products will load when you scroll down
          </div>
        </div>
      </div>
    </section>
  );
}

// Loader component to fetch and show products
function NewProductsLoader({ scratchDent, title, description, onLoaded }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    setQuickViewItem,
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        console.log(`Lazy loading ${title} products...`);
        const response = await fetch(
          `/api/products/new-products?scrachDent=${scratchDent}&limit=12`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.text();
        if (!text) {
          throw new Error("Empty response from server");
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (jsonError) {
          console.error("JSON parse error:", jsonError);
          console.error("Response text:", text);
          throw new Error("Invalid JSON response from server");
        }

        const productsArray = Array.isArray(data) ? data : [];
        setProducts(productsArray);
        setError(null);
        onLoaded(productsArray);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [scratchDent, title, onLoaded]);

  if (loading) {
    return (
      <section className="flat-spacing-1">
        <div className="container">
          <div className="flat-title">
            <span className="title wow fadeInUp home-title" data-wow-delay="0s">
              {title}
            </span>
            <h6 className="home-title-description text-center text-muted">
              {description}
            </h6>
          </div>
          <div
            className="text-center p-5"
            style={{
              minHeight: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div>
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="text-muted">Loading {title.toLowerCase()}...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flat-spacing-1">
        <div className="container">
          <div className="flat-title">
            <span className="title wow fadeInUp home-title" data-wow-delay="0s">
              {title}
            </span>
            <h6 className="home-title-description text-center text-muted">
              {description}
            </h6>
          </div>
          <div
            className="text-center p-5 text-danger"
            style={{
              minHeight: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div>
              <i
                className="bi bi-exclamation-triangle"
                style={{
                  fontSize: "3rem",
                  marginBottom: "1rem",
                  display: "block",
                }}
              ></i>
              Error loading products: {error}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <NewProductsSection
      products={products}
      title={title}
      description={description}
      contextFunctions={{
        setQuickViewItem,
        setQuickAddItem,
        addToWishlist,
        isAddedtoWishlist,
        addToCompareItem,
        isAddedtoCompareItem,
      }}
    />
  );
}

// Section to display products
function NewProductsSection({
  products = [],
  title,
  description,
  contextFunctions,
}) {
  const {
    setQuickViewItem,
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = contextFunctions;

  const navigationClass = title.toLowerCase().includes("scratch")
    ? "scratch-dent"
    : "new-products";

  if (!products.length) {
    return (
      <section className="flat-spacing-1">
        <div className="container">
          <div className="flat-title">
            <span className="title wow fadeInUp home-title" data-wow-delay="0s">
              {title}
            </span>
            <h6 className="home-title-description text-center text-muted">
              {description}
            </h6>
          </div>
          <div
            className="text-center p-5"
            style={{
              minHeight: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="text-muted">
              <i
                className="bi bi-box"
                style={{
                  fontSize: "3rem",
                  marginBottom: "1rem",
                  display: "block",
                }}
              ></i>
              No {title.toLowerCase()} found.
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing-1">
      <div className="container">
        <div className="flat-title">
          <span className="title wow fadeInUp home-title" data-wow-delay="0s">
            {title}
          </span>
          <h6 className="home-title-description text-center text-muted">
            {description}
          </h6>
        </div>

        <div
          className={`position-relative slider-container ${navigationClass}-slider`}
        >
          <Swiper
            modules={[Navigation, Grid]}
            navigation={{
              nextEl: `.${navigationClass}-next`,
              prevEl: `.${navigationClass}-prev`,
            }}
            grid={{
              rows: 2,
              fill: "row",
            }}
            spaceBetween={30}
            slidesPerView={4}
            breakpoints={{
              0: {
                slidesPerView: 1,
              },
              576: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              992: {
                slidesPerView: 4,
              },
            }}
            className="swiper-container"
          >
            {products.map((product) => (
              <SwiperSlide key={product.ProductID}>
                <div className="card-product bg_white radius-20 h-100">
                  <div className="card-product-wrapper border-line h-100 d-flex flex-column">
                    <Link
                      href={`/product/${product.ProductID}`}
                      className="product-img"
                    >
                      <Image
                        className="lazyload img-product mb-2"
                        src={getProductImageUrl(
                          product.ImageLarge || product.ImageSmall,
                        )}
                        alt="image-product"
                        width={1200}
                        height={1200}
                      />
                      <Image
                        className="lazyload img-hover"
                        src={getProductImageUrl(product.ImageSmall)}
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
                            isAddedtoCompareItem(product.ProductID)
                              ? "added"
                              : ""
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
                      <div className="NewProductPartNumber">
                        {product.PartNumber}
                      </div>
                      <span
                        className="NewProductPlatformName"
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          margin: "0px",
                          padding: "0px",
                          lineHeight: "0.5",
                        }}
                      >
                        {product.PlatformName}
                      </span>
                      <Link
                        href={`/product/${product.ProductID}`}
                        className="title link"
                      >
                        {product?.ProductName}
                      </Link>
                      <span className="price"> ${product?.Price} </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className={`${navigationClass}-prev swiper-nav-button`}></div>
          <div className={`${navigationClass}-next swiper-nav-button`}></div>
        </div>
      </div>

      <style jsx>{`
        .slider-container {
          padding: 0 50px;
        }
        .swiper-container {
          padding: 20px 0;
        }
        :global(.swiper-nav-button) {
          background-color: var(--primary);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition:
            width 0.2s ease,
            height 0.2s ease;
          &:hover {
            width: 45px;
            height: 45px;
          }
        }
        :global(.new-products-prev),
        :global(.scratch-dent-prev) {
          left: 0;
        }
        :global(.new-products-next),
        :global(.scratch-dent-next) {
          right: 0;
        }
        :global(.swiper-nav-button::after) {
          font-family: "swiper-icons";
          font-size: 20px;
          color: white;
        }
        :global(.new-products-prev::after),
        :global(.scratch-dent-prev::after) {
          content: "prev";
        }
        :global(.new-products-next::after),
        :global(.scratch-dent-next::after) {
          content: "next";
        }
        :global(.swiper-grid-column > .swiper-wrapper) {
          flex-direction: row;
        }
      `}</style>
    </section>
  );
}
