"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

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
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [categoriesByMainCat, setCategoriesByMainCat] = useState([]);
  const [bodyDetails, setBodyDetails] = useState(null);
  const [vehicleList, setVehicleList] = useState([]);
  const [error, setError] = useState(null);
  const [activePlatform, setActivePlatform] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const megaMenuContainerRef = useRef(null);
  const dataCacheRef = useRef({}); // { [bodyId]: { bodyDetails, categoriesByMainCat, vehicleList } }

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
          setError(null);
        } catch (err) {
          console.error("Error fetching menu:", err);
          setError("Failed to load menu. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchMenuData();
    }
  }, [initialMenuData, isDataFetched]);

  // Prefetch first vehicle for each platform on mount
  useEffect(() => {
    if (menuData) {
      [
        "ford",
        "gmLateModel",
        "gmMidMuscle",
        "gmClassicMuscle",
        "mopar",
      ].forEach((platform) => {
        const links = menuData[platform + "Links"];
        if (links && links[0] && links[0].bodyId) {
          const { slug, bodyId } = links[0];
          if (!dataCacheRef.current[bodyId]) {
            handleVehicleHover(slug, bodyId, true);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuData]);

  // Function to handle platform hover with delay
  const handlePlatformHover = (platform) => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActivePlatform(platform);

      // Get the links array for the selected platform
      const platformLinks = menuData[`${platform}Links`];

      // If there are vehicles in the list, automatically select the first one
      if (platformLinks && platformLinks.length > 0) {
        const firstVehicle = platformLinks[0];
        handleVehicleHover(firstVehicle.slug, firstVehicle.bodyId);
      }
    }, 500);
  };

  // Function to handle platform leave
  const handlePlatformLeave = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActivePlatform(null);
      setActiveVehicle(null);
    }, 500);
  };

  // Function to handle vehicle hover and fetch relevant data
  const handleVehicleHover = async (
    vehicleSlug,
    bodyId,
    prefetchOnly = false
  ) => {
    setActiveVehicle(vehicleSlug);
    if (!bodyId) return;
    // Use cache if available
    if (dataCacheRef.current[bodyId]) {
      const { bodyDetails, categoriesByMainCat, vehicleList } =
        dataCacheRef.current[bodyId];
      setBodyDetails(bodyDetails);
      setCategoriesByMainCat(categoriesByMainCat);
      setVehicleList(vehicleList);
      setIsLoading(false);
      setError(null);
      return;
    }
    try {
      setIsLoading(true);
      const [platformResponse, catResponse, vehiclesResponse] =
        await Promise.all([
          fetch(`/api/platform/${bodyId}`),
          fetch(`/api/categories?bodyId=${bodyId}`),
          fetch(`/api/vehicles?bodyId=${bodyId}`),
        ]);
      if (!platformResponse.ok || !catResponse.ok || !vehiclesResponse.ok)
        throw new Error("Failed to fetch data");
      const platformData = await platformResponse.json();
      const catData = await catResponse.json();
      const vehiclesData = await vehiclesResponse.json();
      const cacheObj = {
        bodyDetails: platformData.platform,
        categoriesByMainCat: catData,
        vehicleList: vehiclesData,
      };
      dataCacheRef.current[bodyId] = cacheObj;
      if (!prefetchOnly) {
        setBodyDetails(cacheObj.bodyDetails);
        setCategoriesByMainCat(cacheObj.categoriesByMainCat);
        setVehicleList(cacheObj.vehicleList);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      if (!prefetchOnly)
        setError(
          "Failed to load data for this vehicle. Please try again later."
        );
    } finally {
      if (!prefetchOnly) setIsLoading(false);
    }
  };

  // Function to handle image error
  const handleImageError = (e) => {
    // Replace with fallback image on error
    e.target.onerror = null; // Prevent infinite loops
    e.target.src = "https://bmrsuspension.com/siteart/logo/bmr-logo-white.png";
  };

  // Render function for the new mega menu
  const renderMegaMenu = (links, baseLink) => {
    if (links.length === 0 && isLoading) {
      return <div className="dropdown-menu mega-menu loading">Loading...</div>;
    }

    // Get the currently selected vehicle details
    const selectedVehicle = links.find(
      (section) => section.slug === activeVehicle
    );

    return (
      <div className="dropdown-menu mega-menu" ref={megaMenuContainerRef}>
        <div className="mega-menu-container">
          {/* Left sidebar - Platforms/Vehicles */}
          <div className="mega-menu-sidebar">
            <ul className="vehicle-list">
              {links.map((section, idx) => (
                <li
                  key={idx}
                  className={activeVehicle === section.slug ? "active" : ""}
                  onMouseEnter={() =>
                    handleVehicleHover(section.slug, section.bodyId)
                  }
                >
                  <Link
                    href={`/products/${section.slug}`}
                    className="vehicle-link"
                  >
                    {section.heading}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Center - Categories */}
          <div className="mega-menu-content">
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {!error && activeVehicle && selectedVehicle && (
              <div className="mega-menu-body">
                {/* Main categories and subcategories */}
                <div className="category-section">
                  {isLoading ? (
                    <div className="loading-categories">
                      Loading categories...
                    </div>
                  ) : categoriesByMainCat.length > 0 ? (
                    <div className="main-categories-container">
                      {categoriesByMainCat.map((categoryGroup, groupIdx) => (
                        <div key={groupIdx} className="main-category-group">
                          <div className="main-category-header">
                            <div className="main-category-image">
                              {categoryGroup.mainCategory.image && (
                                <Image
                                  src={`https://bmrsuspension.com/siteart/categories/${categoryGroup.mainCategory.image}`}
                                  alt={categoryGroup.mainCategory.name}
                                  width={100}
                                  height={100}
                                  style={{ objectFit: "contain" }}
                                  onError={handleImageError}
                                  unoptimized={true}
                                />
                              )}
                            </div>
                            <div>
                              <h3 className="main-category-title">
                                <Link
                                  href={`/products/${
                                    selectedVehicle.slug
                                  }/${encodeURIComponent(
                                    categoryGroup.mainCategory.name
                                  )}`}
                                  className="subcategory-link"
                                >
                                  {categoryGroup.mainCategory.name}
                                </Link>
                              </h3>
                            </div>
                          </div>

                          <div className="subcategories-list">
                            {categoryGroup.subCategories.map(
                              (category, idx) => (
                                <div key={idx} className="subcategory-item">
                                  <Link
                                    href={`/products/${
                                      selectedVehicle.slug
                                    }/${encodeURIComponent(category.CatName)}`}
                                    className="subcategory-link"
                                  >
                                    {category.CatName}
                                    {category.productCount && (
                                      <span className="product-count">
                                        {category.productCount}
                                      </span>
                                    )}
                                  </Link>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-categories">No categories found</div>
                  )}
                </div>
              </div>
            )}

            {/* If no vehicle is hovered, show a message */}
            {!error && !activeVehicle && (
              <div className="no-selection">
                <p>Select a vehicle to see available products</p>
              </div>
            )}
          </div>

          {/* Right side - Fitment section */}
          <div className="fitment-column">
            {bodyDetails && selectedVehicle && (
              <>
                <div className="vehicle-image-container">
                  {bodyDetails.Image && (
                    <Image
                      src={`https://bmrsuspension.com/siteart/cars/${bodyDetails.Image}`}
                      alt={bodyDetails.Name}
                      width={200}
                      height={150}
                      style={{
                        objectFit: "contain",
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                      onError={handleImageError}
                      unoptimized={true}
                      priority
                    />
                  )}
                </div>

                <h3 className="vehicle-title">{selectedVehicle.heading}</h3>

                <div className="fitment-heading">
                  <i className="vehicle-icon">🚗</i> Fitment
                </div>

                <ul className="vehicle-fitment-list">
                  {isLoading ? (
                    <li>Loading vehicles...</li>
                  ) : vehicleList.length > 0 ? (
                    vehicleList.map((vehicle, idx) => (
                      <li key={idx}>
                        {vehicle.StartYear}-{vehicle.EndYear} {vehicle.Make}{" "}
                        {vehicle.Model}
                      </li>
                    ))
                  ) : (
                    <li className="no-vehicles">No vehicles found</li>
                  )}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <nav className="navbar navbar-expand-xxl text-center">
      <div
        className="container-fluid"
        style={{ border: "0px 0px 1px 0px solid red !important" }}
      >
        <div
          className="collapse navbar-collapse"
          id="navbarNavDropdown"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <ul className="navbar-nav">
            {/* <li className="nav-item">
              <Link href="/" className="nav-link">
                Home
              </Link>
            </li> */}

            {/* Ford Dropdown */}
            <li
              className="nav-item dropdown"
              onMouseEnter={() => handlePlatformHover("ford")}
              onMouseLeave={handlePlatformLeave}
            >
              <Link href="/products/ford" className="nav-link dropdown-toggle">
                Ford
              </Link>
              {activePlatform === "ford" &&
                renderMegaMenu(menuData.fordLinks, "/products/ford")}
            </li>

            {/* GM Late Model Dropdown */}
            <li
              className="nav-item dropdown"
              onMouseEnter={() => handlePlatformHover("gmLateModel")}
              onMouseLeave={handlePlatformLeave}
            >
              <Link href="/products/gm" className="nav-link dropdown-toggle">
                GM Late Model Cars
              </Link>
              {activePlatform === "gmLateModel" &&
                renderMegaMenu(menuData.gmLateModelLinks, "/products/gm")}
            </li>

            {/* GM Mid Muscle Dropdown */}
            <li
              className="nav-item dropdown"
              onMouseEnter={() => handlePlatformHover("gmMidMuscle")}
              onMouseLeave={handlePlatformLeave}
            >
              <Link href="/products/gm" className="nav-link dropdown-toggle">
                GM Mid Muscle Cars
              </Link>
              {activePlatform === "gmMidMuscle" &&
                renderMegaMenu(menuData.gmMidMuscleLinks, "/products/gm")}
            </li>

            {/* GM Classic Muscle Dropdown */}
            <li
              className="nav-item dropdown"
              onMouseEnter={() => handlePlatformHover("gmClassicMuscle")}
              onMouseLeave={handlePlatformLeave}
            >
              <Link href="/products/gm" className="nav-link dropdown-toggle">
                GM Classic Muscle Cars
              </Link>
              {activePlatform === "gmClassicMuscle" &&
                renderMegaMenu(menuData.gmClassicMuscleLinks, "/products/gm")}
            </li>

            {/* Mopar Dropdown */}
            <li
              className="nav-item dropdown"
              onMouseEnter={() => handlePlatformHover("mopar")}
              onMouseLeave={handlePlatformLeave}
            >
              <Link href="/products/mopar" className="nav-link dropdown-toggle">
                Mopar
              </Link>
              {activePlatform === "mopar" &&
                renderMegaMenu(menuData.moparLinks, "/products/mopar")}
            </li>

            {/* Static Links */}
            <li className="nav-item">
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
