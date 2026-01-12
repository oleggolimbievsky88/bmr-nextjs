"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import CartLength from "../common/CartLength.jsx";
import SearchInput from "../search/SearchInput.jsx";
import VehicleSearch from "../common/VehicleSearch.jsx";

const defaultMenuData = {
  fordLinks: [],
  moparLinks: [],
  gmLateModelLinks: [],
  gmMidMuscleLinks: [],
  gmClassicMuscleLinks: [],
};

export default function Header18({
  initialMenuData,
  showVehicleSearch = true,
}) {
  const [menuData, setMenuData] = useState(initialMenuData || defaultMenuData);
  const [isLoading, setIsLoading] = useState(!initialMenuData);
  const [isDataFetched, setIsDataFetched] = useState(!!initialMenuData);
  const [activePlatform, setActivePlatform] = useState(null);
  const [megaMenuTop, setMegaMenuTop] = useState("120px");
  const hoverTimeoutRef = useRef(null);
  const headerBottomRef = useRef(null);
  const navUlRef = useRef(null);

  useEffect(() => {
    if (!initialMenuData && !isDataFetched) {
      const fetchMenuData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch("/api/menu");
          if (!response.ok) throw new Error("Failed to fetch menu");
          const data = await response.json();
          setMenuData(data);
          setIsDataFetched(true);
        } catch (err) {
          console.error("Error fetching menu:", err);
          setMenuData(defaultMenuData);
          setIsDataFetched(true);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMenuData();
    } else if (initialMenuData) {
      setMenuData(initialMenuData);
      setIsDataFetched(true);
      setIsLoading(false);
    }
  }, [initialMenuData, isDataFetched]);

  // Run on mount and when menuData changes
  useEffect(() => {
    console.log("Mega menu position useEffect running, menuData:", menuData);

    const updateMegaMenuPosition = () => {
      // Use headerBottomRef first to get the bottom of the entire header-bottom div
      // Fall back to navUlRef if headerBottomRef isn't available
      const targetElement = headerBottomRef.current || navUlRef.current;
      console.log(
        "updateMegaMenuPosition - targetElement:",
        targetElement,
        "className:",
        targetElement?.className
      );
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        // Add gap below the header-bottom div
        const newTop = rect.bottom + 22;
        console.log(
          "Setting megaMenuTop to:",
          newTop,
          "rect.bottom:",
          rect.bottom
        );
        setMegaMenuTop(`${newTop}px`);
      } else {
        console.log("No target element found");
      }
    };

    // Wait for DOM to be ready
    const checkAndUpdate = () => {
      console.log(
        "checkAndUpdate - headerBottomRef:",
        headerBottomRef.current,
        "navUlRef:",
        navUlRef.current
      );
      if (headerBottomRef.current || navUlRef.current) {
        updateMegaMenuPosition();
      } else {
        // If refs aren't ready yet, try again
        console.log("Refs not ready, retrying...");
        setTimeout(checkAndUpdate, 50);
      }
    };

    // Initial calculation with a small delay to ensure DOM is ready
    const initialTimeout = setTimeout(checkAndUpdate, 100);

    // Update on resize and scroll
    window.addEventListener("resize", updateMegaMenuPosition);
    window.addEventListener("scroll", updateMegaMenuPosition);

    // Also update when menu data loads (in case header height changes)
    const dataTimeout = setTimeout(updateMegaMenuPosition, 200);

    // Use requestAnimationFrame for more accurate positioning after layout
    const rafId = requestAnimationFrame(() => {
      updateMegaMenuPosition();
    });

    return () => {
      window.removeEventListener("resize", updateMegaMenuPosition);
      window.removeEventListener("scroll", updateMegaMenuPosition);
      clearTimeout(initialTimeout);
      clearTimeout(dataTimeout);
      cancelAnimationFrame(rafId);
    };
  }, [menuData]);

  // Also run on mount regardless of menuData
  useEffect(() => {
    console.log("Mega menu position useEffect (mount only) running");

    const updateMegaMenuPosition = () => {
      // Prioritize headerBottomRef to get the bottom of the entire header-bottom div
      const targetElement = headerBottomRef.current || navUlRef.current;
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const newTop = rect.bottom + 22;
        console.log(
          "Mount effect - Setting megaMenuTop to:",
          newTop,
          "from element:",
          targetElement.className
        );
        setMegaMenuTop(`${newTop}px`);
      }
    };

    // Try multiple times to ensure DOM is ready
    const timeouts = [
      setTimeout(updateMegaMenuPosition, 100),
      setTimeout(updateMegaMenuPosition, 300),
      setTimeout(updateMegaMenuPosition, 500),
    ];

    window.addEventListener("resize", updateMegaMenuPosition);
    window.addEventListener("scroll", updateMegaMenuPosition);

    return () => {
      timeouts.forEach(clearTimeout);
      window.removeEventListener("resize", updateMegaMenuPosition);
      window.removeEventListener("scroll", updateMegaMenuPosition);
    };
  }, []);

  const handlePlatformHover = (platform) => {
    clearTimeout(hoverTimeoutRef.current);
    setActivePlatform(platform);
  };

  const handlePlatformLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActivePlatform(null);
    }, 400);
  };

  const renderMegaMenu = (platformName, links, baseUrl) => {
    if (!links || links.length === 0) {
      return (
        <li className="menu-item">
          <Link href={baseUrl} className="item-link">
            {platformName}
          </Link>
        </li>
      );
    }

    const isActive =
      activePlatform === platformName.toLowerCase().replace(/\s+/g, "");

    // Split links into columns (3-4 columns depending on number of links)
    const linksPerColumn = Math.ceil(links.length / 4);
    const columns = [];
    for (let i = 0; i < links.length; i += linksPerColumn) {
      columns.push(links.slice(i, i + linksPerColumn));
    }

    return (
      <li
        className="menu-item dropdown position-static"
        onMouseEnter={() =>
          handlePlatformHover(platformName.toLowerCase().replace(/\s+/g, ""))
        }
        onMouseLeave={handlePlatformLeave}
      >
        <Link href={baseUrl} className="item-link dropdown-toggle">
          {platformName}
        </Link>
        {isActive && (
          <div
            className="dropdown-menu mega-menu show"
            onMouseEnter={() => clearTimeout(hoverTimeoutRef.current)}
            onMouseLeave={handlePlatformLeave}
            style={{
              display: "block !important",
              position: "fixed",
              top: megaMenuTop,
              left: 0,
              right: 0,
              width: "100%",
              zIndex: 9999999,
              opacity: 1,
              visibility: "visible",
              isolation: "isolate",
              backgroundColor: "#ffffff",
              background: "#ffffff",
              marginTop: 0,
              paddingTop: 0,
            }}
          >
            <div className="container">
              <div
                className="row-demo"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.min(
                    columns.length,
                    4
                  )}, 1fr)`,
                  columnGap: "40px",
                  rowGap: "0px",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                }}
              >
                {columns.map((columnLinks, colIdx) => (
                  <div
                    key={colIdx}
                    className="demo-item"
                    style={{
                      padding: "20px 16px",
                      transition: "all 0.3s ease",
                      backgroundColor: "transparent",
                    }}
                  >
                    {columnLinks.map((link, idx) => (
                      <Link
                        key={idx}
                        href={`/products/${link.slug}`}
                        className="demo-name"
                        style={{
                          lineHeight: "1.6",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          textWrap: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          textAlign: "left",
                          fontWeight: 500,
                          fontSize: "15px",
                          color: "#333",
                          textDecoration: "none",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          padding: "12px 8px 12px 16px",
                          borderRadius: "0",
                          minWidth: "0",
                          marginBottom:
                            idx < columnLinks.length - 1 ? "4px" : "0",
                          position: "relative",
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--primary)";
                          const accentLine =
                            e.currentTarget.querySelector(".accent-line");
                          if (accentLine) {
                            accentLine.style.opacity = "1";
                          }
                          const image =
                            e.currentTarget.querySelector(".platform-image");
                          if (image) {
                            image.style.transform = "scale(1.1)";
                            image.style.filter = "brightness(1.1)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#333";
                          const accentLine =
                            e.currentTarget.querySelector(".accent-line");
                          if (accentLine) {
                            accentLine.style.opacity = "0";
                          }
                          const image =
                            e.currentTarget.querySelector(".platform-image");
                          if (image) {
                            image.style.transform = "scale(1)";
                            image.style.filter = "brightness(1)";
                          }
                        }}
                      >
                        <span
                          className="accent-line"
                          style={{
                            position: "absolute",
                            left: "0",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "3px",
                            height: "60%",
                            backgroundColor: "var(--primary)",
                            opacity: "0",
                            transition:
                              "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        />
                        {link.image && (
                          <Image
                            src={link.image}
                            alt={link.heading}
                            width={40}
                            height={40}
                            style={{
                              width: "60px",
                              height: "50px",
                              objectFit: "contain",
                              flexShrink: 0,
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                            className="platform-image"
                          />
                        )}
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: "1",
                          }}
                        >
                          {link.heading}
                        </span>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </li>
    );
  };

  return (
    <header
      id="header"
      className="header-default header-style-2 header-style-4"
    >
      <div className="main-header line">
        <div className="container">
          <div className="row wrapper-header align-items-center">
            <div className="col-xl-2 col-md-4 col-2 d-md-none header-left-icon">
              <a
                href="#mobileMenu"
                data-bs-toggle="offcanvas"
                aria-controls="offcanvasLeft"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={16}
                  viewBox="0 0 24 16"
                  fill="none"
                  color="white"
                >
                  <path
                    d="M2.00056 2.28571H16.8577C17.1608 2.28571 17.4515 2.16531 17.6658 1.95098C17.8802 1.73665 18.0006 1.44596 18.0006 1.14286C18.0006 0.839753 17.8802 0.549063 17.6658 0.334735C17.4515 0.120408 17.1608 0 16.8577 0H2.00056C1.69745 0 1.40676 0.120408 1.19244 0.334735C0.978109 0.549063 0.857702 0.839753 0.857702 1.14286C0.857702 1.44596 0.978109 1.73665 1.19244 1.95098C1.40676 2.16531 1.69745 2.28571 2.00056 2.28571ZM0.857702 8C0.857702 7.6969 0.978109 7.40621 1.19244 7.19188C1.40676 6.97755 1.69745 6.85714 2.00056 6.85714H22.572C22.8751 6.85714 23.1658 6.97755 23.3801 7.19188C23.5944 7.40621 23.7148 7.6969 23.7148 8C23.7148 8.30311 23.5944 8.59379 23.3801 8.80812C23.1658 9.02245 22.8751 9.14286 22.572 9.14286H2.00056C1.69745 9.14286 1.40676 9.02245 1.19244 8.80812C0.978109 8.59379 0.857702 8.30311 0.857702 8ZM0.857702 14.8571C0.857702 14.554 0.978109 14.2633 1.19244 14.049C1.40676 13.8347 1.69745 13.7143 2.00056 13.7143H12.2863C12.5894 13.7143 12.8801 13.8347 13.0944 14.049C13.3087 14.2633 13.4291 14.554 13.4291 14.8571C13.4291 15.1602 13.3087 15.4509 13.0944 15.6653C12.8801 15.8796 12.5894 16 12.2863 16H2.00056C1.69745 16 1.40676 15.8796 1.19244 15.6653C0.978109 15.4509 0.857702 15.1602 0.857702 14.8571Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>
            <div className="col-xl-3 col-md-4 col-8 text-center">
              <Link href={`/`} className="logo-header">
                <Image
                  alt="logo"
                  className="logo"
                  src="https://bmrsuspension.com/siteart/logo/bmr-logo-white.png"
                  width={500}
                  height={100}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                  priority
                />
              </Link>
            </div>
            <div className="col-xl-5 col-md-4 d-none d-md-block">
              <div className="tf-form-search">
                <Suspense
                  fallback={
                    <div className="search-loading">Loading search...</div>
                  }
                >
                  <SearchInput />
                </Suspense>
              </div>
            </div>
            <div className="col-xl-2 col-md-4 col-4 text-white header-right-icons">
              <ul className="nav-icon d-flex justify-content-end align-items-center gap-15 text-white">
                <li className="nav-search text-white">
                  <a
                    href="#canvasSearch"
                    data-bs-toggle="offcanvas"
                    aria-controls="offcanvasLeft"
                    className="nav-icon-item"
                  >
                    <i className="icon icon-search" />
                  </a>
                </li>
                <li className="nav-account d-none d-md-inline-block">
                  <a
                    href="#login"
                    data-bs-toggle="modal"
                    className="nav-icon-item"
                  >
                    <i className="icon icon-account" />
                  </a>
                </li>
                <li className="nav-cart">
                  <a
                    href="#shoppingCart"
                    data-bs-toggle="modal"
                    className="nav-icon-item"
                  >
                    <i className="icon icon-bag" />
                    <span className="count-box">
                      <CartLength />
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={headerBottomRef}
        className="header-bottom d-none d-md-block"
        style={{ overflow: "visible" }}
      >
        <div className="container" style={{ overflow: "visible" }}>
          <div
            className="wrapper-header d-flex justify-content-between align-items-center"
            style={{ overflow: "visible" }}
          >
            <div
              className="box-left"
              style={{ width: "100%", overflow: "visible" }}
            >
              <nav
                className="box-navigation text-center"
                style={{ overflow: "visible" }}
              >
                <ul
                  ref={navUlRef}
                  className="box-nav-ul d-flex align-items-center justify-content-center gap-30"
                  style={{ overflow: "visible" }}
                >
                  {renderMegaMenu("Ford", menuData.fordLinks, "/products/ford")}
                  {renderMegaMenu(
                    "GM Late Model Cars",
                    menuData.gmLateModelLinks,
                    "/products/gm/late-model"
                  )}
                  {renderMegaMenu(
                    "GM Mid Muscle Cars",
                    menuData.gmMidMuscleLinks,
                    "/products/gm/mid-muscle"
                  )}
                  {renderMegaMenu(
                    "GM Classic Muscle Cars",
                    menuData.gmClassicMuscleLinks,
                    "/products/gm/classic-muscle"
                  )}
                  {renderMegaMenu(
                    "Mopar",
                    menuData.moparLinks,
                    "/products/mopar"
                  )}
                  <li className="menu-item">
                    <Link href="/installation" className="item-link">
                      Installation
                    </Link>
                  </li>
                  <li className="menu-item">
                    <Link href="/view-cart" className="item-link">
                      Cart
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
      {showVehicleSearch && (
        <div className="header-vehicle-search d-none d-md-block">
          <div className="container">
            <VehicleSearch />
          </div>
        </div>
      )}
    </header>
  );
}
