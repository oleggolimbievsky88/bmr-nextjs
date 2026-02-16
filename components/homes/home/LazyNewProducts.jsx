"use client";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import Image from "next/image";
import { getProductImageUrl } from "@/lib/assets";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid } from "swiper/modules";
import SectionHeader from "@/components/common/SectionHeader";
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/navigation";

export default function LazyNewProducts({ scratchDent = "0" }) {
  const [products, setProducts] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "100px 0px", // Start loading 100px before the element is visible
  });

  const { addToWishlist, isAddedtoWishlist } = useContextElement();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const title = scratchDent === "1" ? "Scratch & Dent" : "New Products";
  const description =
    scratchDent === "1"
      ? "BMR Scratch and Dent products have minor to moderate aesthetic defects. Due to the cost of stripping and recoating, BMR has chosen to leave the parts 'as-is' and sell them at a discounted price."
      : "Check out the latest for your vehicle from BMR Suspension!";

  const sectionRef = inViewRef;

  if (!isClient) {
    return (
      <PlaceholderSection
        title={title}
        description={description}
        sectionRef={sectionRef}
      />
    );
  }

  return inView && !hasLoaded ? (
    <NewProductsLoader
      scratchDent={scratchDent}
      title={title}
      description={description}
      onLoaded={(loadedProducts) => {
        setProducts(loadedProducts);
        setHasLoaded(true);
      }}
      sectionRef={sectionRef}
    />
  ) : hasLoaded ? (
    <NewProductsSection
      products={products}
      title={title}
      description={description}
      contextFunctions={{
        addToWishlist,
        isAddedtoWishlist,
      }}
      sectionRef={sectionRef}
    />
  ) : (
    <PlaceholderSection
      title={title}
      description={description}
      sectionRef={sectionRef}
    />
  );
}

// Placeholder section shown before component comes into view
function PlaceholderSection({ title, description, sectionRef }) {
  return (
    <section className="homepage-section" ref={sectionRef}>
      <div className="container">
        <SectionHeader title={title} subtitle={description} />
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
function NewProductsLoader({
  scratchDent,
  title,
  description,
  onLoaded,
  sectionRef,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToWishlist, isAddedtoWishlist } = useContextElement();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        console.log(`Lazy loading ${title} products...`);
        const response = await fetch(
          `/api/products/new-products?scratchDent=${scratchDent}&limit=12`,
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
      <section className="homepage-section" ref={sectionRef}>
        <div className="container">
          <SectionHeader title={title} subtitle={description} />
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
      <section className="homepage-section" ref={sectionRef}>
        <div className="container">
          <SectionHeader title={title} subtitle={description} />
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
        addToWishlist,
        isAddedtoWishlist,
      }}
      sectionRef={sectionRef}
    />
  );
}

// Section to display products
function NewProductsSection({
  products = [],
  title,
  description,
  contextFunctions,
  sectionRef,
}) {
  const { addToWishlist, isAddedtoWishlist } = contextFunctions;

  const isScratchDent = title.toLowerCase().includes("scratch");
  const navigationClass = isScratchDent ? "scratch-dent" : "new-products";

  const itemCount = products.length;
  const useGridLayout = itemCount < 4;

  if (!products.length) {
    return (
      <section className="homepage-section" ref={sectionRef}>
        <div className="container">
          <SectionHeader title={title} subtitle={description} />
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

  const productCard = (product, { featured = false } = {}) => {
    const hasHoverImage = !!product?.ImageSmall;
    return (
      <article
        className={`bmrCard ${featured ? "bmrCard--featured" : ""}`}
        data-product-card
      >
        <div className="bmrCard__inner">
          <Link
            href={`/product/${product.ProductID}`}
            className={`bmrCard__media ${hasHoverImage ? "bmrCard__media--hasHover" : ""}`}
            aria-label={product?.ProductName || "View product"}
          >
            <div className="bmrCard__badges">
              {featured && (
                <span className="bmrBadge bmrBadge--featured">Featured</span>
              )}
              {product?.ScratchDent === "1" && (
                <span className="bmrBadge bmrBadge--warn">Scratch & Dent</span>
              )}
            </div>

            <div className="bmrCard__imageWrap">
              <Image
                className="bmrCard__img"
                src={getProductImageUrl(
                  product.ImageLarge || product.ImageSmall,
                )}
                alt={product?.ProductName || "Product image"}
                width={1200}
                height={1200}
                priority={featured}
              />
              {hasHoverImage ? (
                <Image
                  className="bmrCard__imgHover"
                  src={getProductImageUrl(product.ImageSmall)}
                  alt=""
                  width={360}
                  height={360}
                />
              ) : null}
            </div>
          </Link>

          <div className="bmrCard__actions">
            <button
              type="button"
              onClick={() => addToWishlist(product.ProductID)}
              className={`bmrIconBtn bmrIconBtn--tooltip ${isAddedtoWishlist(product.ProductID) ? "is-active" : ""}`}
              aria-label="Add to wishlist"
              title={
                isAddedtoWishlist(product.ProductID)
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
            >
              <span
                className={`icon icon-heart ${isAddedtoWishlist(product.ProductID) ? "added" : ""}`}
              />
              <span className="bmrIconBtn__tooltip">
                {isAddedtoWishlist(product.ProductID)
                  ? "Remove from wishlist"
                  : "Add to wishlist"}
              </span>
            </button>
          </div>

          <div className="bmrCard__body">
            <div className="bmrCard__meta">
              <span className="bmrCard__part">{product.PartNumber}</span>
              <span className="bmrCard__platform">{product.PlatformName}</span>
            </div>

            <Link
              href={`/product/${product.ProductID}`}
              className="bmrCard__title"
            >
              {product?.ProductName}
            </Link>

            <div className="bmrCard__footer">
              <span className="bmrCard__price">${product?.Price}</span>
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section
      className={`homepage-section ${!isScratchDent ? "homepage-section--newProducts" : ""}`}
      ref={sectionRef}
    >
      <div className="container">
        <SectionHeader title={title} subtitle={description} />

        {useGridLayout ? (
          <div className={`${navigationClass} new-products-content`}>
            {itemCount === 1 ? (
              <div className="newProductsFeatured">
                <div className="newProductsFeatured__inner">
                  {productCard(products[0], { featured: true })}
                </div>
              </div>
            ) : (
              <div className={`newProductsGrid newProductsGrid--${itemCount}`}>
                {products.map((product) => productCard(product))}
              </div>
            )}
          </div>
        ) : (
          <div
            className={`${navigationClass} new-products-content position-relative slider-container ${navigationClass}-slider`}
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
                  {productCard(product)}
                </SwiperSlide>
              ))}
            </Swiper>
            <div className={`${navigationClass}-prev swiper-nav-button`}></div>
            <div className={`${navigationClass}-next swiper-nav-button`}></div>
          </div>
        )}
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
