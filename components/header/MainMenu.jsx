"use client";
import { useState, useEffect, useCallback } from "react";
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

  // Fetch data immediately when component mounts
  useEffect(() => {
    if (!initialMenuData && !isDataFetched) {
      const fetchMenuData = async () => {
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

  // Render function for menu sections with conditional rendering
  const renderMenuSection = (links, baseLink) => {
    if (links.length === 0 && isLoading) {
      return <div className="dropdown-menu mega-menu loading">Loading...</div>;
    }

    return (
      <div className="dropdown-menu mega-menu">
        <div className="mega-menu-section">
          {links.map((section, idx) => (
            <div key={idx} className="platform-section">
              <h3>
                <Link href={`/products/${section.slug}`}>
                  {section.heading}
                </Link>
              </h3>
              <ul>
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link href={link.href}>{link.text}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <nav className="navbar navbar-expand-lg" style={{maxHeight: "20px", padding: "0px", margin: "0px"}}>
      <div className="container-fluid">
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav">
            {/* <li className="nav-item">
              <Link href="/" className="nav-link">
                Home
              </Link>
            </li> */}

            {/* Ford Dropdown */}
            <li className="nav-item dropdown">
              <Link href="/ford" className="nav-link dropdown-toggle">
                Ford
              </Link>
              {renderMenuSection(menuData.fordLinks, "/ford")}
            </li>

            {/* GM Late Model Dropdown */}
            <li className="nav-item dropdown">
              <Link href="#" className="nav-link dropdown-toggle">
                GM Late Model Cars
              </Link>
              {renderMenuSection(menuData.gmLateModelLinks, "/gm-late-model")}
            </li>

            {/* GM Mid Muscle Dropdown */}
            <li className="nav-item dropdown">
              <Link href="#" className="nav-link dropdown-toggle">
                GM Mid Muscle Cars
              </Link>
              {renderMenuSection(menuData.gmMidMuscleLinks, "/gm-mid-muscle")}
            </li>

            {/* GM Classic Muscle Dropdown */}
            <li className="nav-item dropdown">
              <Link href="#" className="nav-link dropdown-toggle">
                GM Classic Muscle Cars
              </Link>
              {renderMenuSection(menuData.gmClassicMuscleLinks, "/gm-classic")}
            </li>

            {/* Mopar Dropdown */}
            <li className="nav-item dropdown">
              <Link href="#" className="nav-link dropdown-toggle">
                Mopar
              </Link>
              {renderMenuSection(menuData.moparLinks, "/mopar")}
            </li>

            {/* Static Links */}
            <li className="nav-item">
              <Link href="/installation" className="nav-link">
                Installation
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
