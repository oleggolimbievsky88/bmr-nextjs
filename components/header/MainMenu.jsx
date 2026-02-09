"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// Provide a default structure to show immediately
const defaultMenuData = {
  fordLinks: [],
  moparLinks: [],
  gmLateModelLinks: [],
  gmMidMuscleLinks: [],
  gmClassicMuscleLinks: [],
};

export default function MainMenu({ initialMenuData }) {
  const [menuData, setMenuData] = useState(initialMenuData || defaultMenuData);
  const [isLoading, setIsLoading] = useState(!initialMenuData);
  const [isDataFetched, setIsDataFetched] = useState(!!initialMenuData);
  const [megaMenuTop, setMegaMenuTop] = useState(null);

  // Update menuData when initialMenuData changes (from Header18)
  useEffect(() => {
    if (initialMenuData && Object.keys(initialMenuData).length > 0) {
      setMenuData(initialMenuData);
      setIsDataFetched(true);
      setIsLoading(false);
    }
  }, [initialMenuData]);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [activePlatform, setActivePlatform] = useState(null);
  const hoverTimeoutRef = useRef(null);

  // Fetch data immediately when component mounts
  useEffect(() => {
    if (!initialMenuData && !isDataFetched) {
      const fetchMenuData = async () => {
        setIsLoading(true);
        try {
          // Fetch with caching - this will use browser cache and Next.js cache
          const response = await fetch("/api/menu", {
            next: { revalidate: 3600 },
          });
          if (!response.ok) throw new Error("Failed to fetch menu");
          const data = await response.json();
          setMenuData(data);
          setIsDataFetched(true);
        } catch (err) {
          console.error("Error fetching menu:", err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMenuData();
    }
  }, [initialMenuData, isDataFetched]);

  // Function to handle platform hover with delay
  const handlePlatformHover = (platform, e) => {
    clearTimeout(hoverTimeoutRef.current);

    // Set platform immediately
    setActivePlatform(platform);
    setActiveVehicle(null);

    // Position mega menu directly under the hovered nav item
    if (e?.currentTarget?.getBoundingClientRect) {
      const rect = e.currentTarget.getBoundingClientRect();
      let topbarOffset = 0;
      const topbar = document.querySelector(".tf-top-bar");
      if (topbar?.getBoundingClientRect) {
        const topbarRect = topbar.getBoundingClientRect();
        const topbarStyle = window.getComputedStyle(topbar);
        const isTopbarVisible =
          topbarStyle.display !== "none" &&
          topbarStyle.visibility !== "hidden" &&
          topbarRect.height > 0 &&
          topbarRect.bottom > 0 &&
          topbarRect.top < window.innerHeight;
        if (isTopbarVisible) {
          topbarOffset = Math.round(topbarRect.height);
        }
      }

      setMegaMenuTop(Math.round(rect.bottom - topbarOffset));
    }

    // Get the links array for the selected platform
    const platformLinks = menuData[`${platform}Links`];
  };

  // Function to handle platform leave
  const handlePlatformLeave = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActivePlatform(null);
      setActiveVehicle(null);
    }, 150);
  };

  const handleVehicleHover = (vehicleSlug) => {
    setActiveVehicle(vehicleSlug);
  };

  // Function to handle image error
  const handleImageError = (e) => {
    // Replace with fallback image on error
    e.target.onerror = null; // Prevent infinite loops
    e.target.src = "/images/logo/BMR-Logo-White.png";
  };

  // Render function for the mega menu - simple list with thumbnails
  const renderMegaMenu = (links, platform) => {
    const isActive = activePlatform === platform;

    // Always render the menu, but control visibility with CSS classes
    const menuContent =
      !links || links.length === 0 ? (
        isLoading ? (
          <div className="mega-menu-inner">
            <div className="container">
              <div className="row g-2 p-4">
                <div className="col-12 text-center py-4">Loading...</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mega-menu-inner">
            <div className="container">
              <div className="row g-2 p-4">
                <div className="col-12 text-center py-4 text-muted">
                  No platforms in this category yet.
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="mega-menu-inner">
          <div className="mega-menu-container">
            <div className="container">
              <div className="row g-3 px-5">
                {links.map((platformItem) => (
                  <div
                    key={platformItem.slug || platformItem.bodyId}
                    className="col-12 col-md-6 col-lg-4 mega-menu-platform-col"
                  >
                    <Link
                      href={`/products/${encodeURIComponent(
                        platformItem.slug,
                      )}`}
                      className="platform-menu-item d-flex align-items-center text-decoration-none"
                    >
                      {platformItem.image && (
                        <div className="platform-thumbnail me-3 flex-shrink-0">
                          <img
                            src={platformItem.image}
                            alt={platformItem.heading}
                            className="img-fluid"
                            style={{
                              objectFit: "contain",
                              maxHeight: "50px",
                              maxWidth: "80px",
                              width: "auto",
                              transition: "transform 0.3s ease",
                            }}
                            onError={handleImageError}
                          />
                        </div>
                      )}
                      <div className="text-dark fw-semibold small">
                        {platformItem.heading}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    return (
      <div
        className={`dropdown-menu mega-menu ${isActive ? "show active" : ""}`}
        onMouseEnter={() => clearTimeout(hoverTimeoutRef.current)}
        onMouseLeave={handlePlatformLeave}
        style={{
          position: "fixed",
          top: megaMenuTop !== null ? `${megaMenuTop}px` : "100%",
          zIndex: 99999,
          isolation: "isolate",
          backgroundColor: "#ffffff",
          background: "#ffffff",
        }}
      >
        {menuContent}
      </div>
    );
  };

  // Always render the menu structure, even if data is loading
  return (
    <nav
      className="navbar navbar-expand-xxl text-center"
      style={{
        position: "static",
        overflow: "visible",
        zIndex: 1000,
        minHeight: "44px",
      }}
    >
      <div
        className="container-fluid"
        style={{ position: "static", overflow: "visible", zIndex: 1000 }}
      >
        <div
          className="collapse navbar-collapse show"
          id="navbarNavDropdown"
          style={{
            display: "flex",
            justifyContent: "center",
            position: "static",
            overflow: "visible",
            zIndex: 1000,
          }}
        >
          <ul
            className="navbar-nav"
            style={{ position: "static", overflow: "visible", zIndex: 1000 }}
          >
            {/* <li className="nav-item">
              <Link href="/" className="nav-link">
                Home
              </Link>
            </li> */}

            {/* Ford Dropdown */}
            <li
              className="nav-item dropdown position-static"
              onMouseEnter={(e) => handlePlatformHover("ford", e)}
              onMouseLeave={handlePlatformLeave}
            >
              <Link href="/products/ford" className="nav-link dropdown-toggle">
                Ford
              </Link>
              {renderMegaMenu(menuData.fordLinks || [], "ford")}
            </li>

            {/* GM Late Model Dropdown */}
            <li
              className="nav-item dropdown position-static"
              onMouseEnter={(e) => handlePlatformHover("gmLateModel", e)}
              onMouseLeave={handlePlatformLeave}
            >
              <Link
                href="/products/gm/late-model"
                className="nav-link dropdown-toggle"
              >
                GM Late Model Cars
              </Link>
              {renderMegaMenu(menuData.gmLateModelLinks || [], "gmLateModel")}
            </li>

            {/* GM Mid Muscle Dropdown */}
            <li
              className="nav-item dropdown position-static"
              onMouseEnter={(e) => handlePlatformHover("gmMidMuscle", e)}
              onMouseLeave={handlePlatformLeave}
            >
              <Link
                href="/products/gm/mid-muscle"
                className="nav-link dropdown-toggle"
              >
                GM Mid Muscle Cars
              </Link>
              {renderMegaMenu(menuData.gmMidMuscleLinks || [], "gmMidMuscle")}
            </li>

            {/* GM Classic Muscle Dropdown */}
            <li
              className="nav-item dropdown position-static"
              onMouseEnter={(e) => handlePlatformHover("gmClassicMuscle", e)}
              onMouseLeave={handlePlatformLeave}
            >
              <Link
                href="/products/gm/classic-muscle"
                className="nav-link dropdown-toggle"
              >
                GM Classic Muscle Cars
              </Link>
              {renderMegaMenu(
                menuData.gmClassicMuscleLinks || [],
                "gmClassicMuscle",
              )}
            </li>

            {/* Mopar Dropdown */}
            <li
              className="nav-item dropdown position-static"
              onMouseEnter={(e) => handlePlatformHover("mopar", e)}
              onMouseLeave={handlePlatformLeave}
            >
              <Link href="/products/mopar" className="nav-link dropdown-toggle">
                Mopar
              </Link>
              {renderMegaMenu(menuData.moparLinks || [], "mopar")}
            </li>

            {/* Static Links */}
            <li className="nav-item nav-item-installation">
              <Link href="/installation" className="nav-link">
                Installation
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/view-cart" className="nav-link">
                Cart
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
