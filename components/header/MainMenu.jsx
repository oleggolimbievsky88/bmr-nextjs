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
      console.log(
        "MainMenu: Updating menuData from initialMenuData",
        initialMenuData
      );
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
          const response = await fetch("/api/menu");
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

    // Debug logging
    console.log("Hovering over platform:", platform, "Links:", platformLinks);
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
    e.target.src = "https://bmrsuspension.com/siteart/logo/bmr-logo-white.png";
  };

  // Group vehicles by name (e.g., Camaro, Corvette, CTS-V)
  const groupVehiclesByName = (links) => {
    if (!links || links.length === 0) return [];

    const grouped = {};
    links.forEach((vehicle) => {
      // Extract vehicle name from heading
      // Formats: "2016 - 2021 Camaro", "2024 Mustang", "C8 Corvette"
      let vehicleName = vehicle.heading;

      // Try to extract name after year range (e.g., "2016 - 2021 Camaro" -> "Camaro")
      const yearRangeMatch = vehicle.heading.match(/\d{4}\s*-\s*\d{4}\s+(.+)$/);
      if (yearRangeMatch) {
        vehicleName = yearRangeMatch[1].trim();
      } else {
        // Try single year format (e.g., "2024 Mustang" -> "Mustang")
        const singleYearMatch = vehicle.heading.match(/\d{4}\s+(.+)$/);
        if (singleYearMatch) {
          vehicleName = singleYearMatch[1].trim();
        } else {
          // Try model-first format (e.g., "C8 Corvette" -> "Corvette")
          const modelFirstMatch = vehicle.heading.match(/^[A-Z0-9]+\s+(.+)$/);
          if (modelFirstMatch) {
            vehicleName = modelFirstMatch[1].trim();
          }
        }
      }

      if (!grouped[vehicleName]) {
        grouped[vehicleName] = [];
      }
      grouped[vehicleName].push(vehicle);
    });

    // Convert to array and sort vehicles within each group by start year (newest first)
    return Object.keys(grouped)
      .sort()
      .map((name) => ({
        name,
        vehicles: grouped[name].sort((a, b) => {
          const aYear = parseInt(a.heading.match(/^(\d{4})/)?.[1] || "0");
          const bYear = parseInt(b.heading.match(/^(\d{4})/)?.[1] || "0");
          return bYear - aYear; // Newest first
        }),
      }));
  };

  // Render function for the mega menu
  const renderMegaMenu = (links, platform) => {
    const isActive = activePlatform === platform;
    if (!isActive) return null;

    if (!links || links.length === 0) {
      if (isLoading) {
        return (
          <div className="dropdown-menu mega-menu loading show">Loading...</div>
        );
      }
      return null;
    }

    const vehicleGroups = groupVehiclesByName(links);

    return (
      <div
        className="dropdown-menu mega-menu show"
        onMouseEnter={() => clearTimeout(hoverTimeoutRef.current)}
        onMouseLeave={handlePlatformLeave}
        style={{
          display: "block",
          position: "fixed",
          top: megaMenuTop !== null ? `${megaMenuTop}px` : undefined,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 99999,
          opacity: 1,
          visibility: "visible",
          isolation: "isolate",
          backgroundColor: "#ffffff",
          background: "#ffffff",
        }}
      >
        <div className="mega-menu-container">
          <div className="mega-menu-vehicles">
            <div className="vehicle-grid">
              {vehicleGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="vehicle-group-column">
                  <h4 className="vehicle-group-header">{group.name}</h4>
                  {group.vehicles.map((vehicle) => (
                    <Link
                      key={`${group.name}-${vehicle.slug}`}
                      href={`/products/${vehicle.slug}`}
                      className={`vehicle-card ${
                        activeVehicle === vehicle.slug ? "active" : ""
                      }`}
                      onMouseEnter={() => handleVehicleHover(vehicle.slug)}
                    >
                      {vehicle.heading}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
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
                "gmClassicMuscle"
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
