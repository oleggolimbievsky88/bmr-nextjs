"use client";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Only fetch if no initial data was provided
    if (!initialMenuData) {
      const fetchMenuData = async () => {
        try {
          const response = await fetch("/api/menu");
          if (!response.ok) throw new Error("Failed to fetch menu");
          const data = await response.json();
          setMenuData(data);
          setIsLoading(false);
        } catch (err) {
          console.error("Error fetching menu:", err);
          setIsLoading(false);
        }
      };

      fetchMenuData();
    }
  }, [initialMenuData]);

  // Render function for menu sections
  const renderMenuSection = (links, baseLink) => (
    <div className="dropdown-menu mega-menu">
      <div className="mega-menu-section">
        {links.map((section, idx) => (
          <div key={idx} className="platform-section">
            <h3>{section.heading}</h3>
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

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link href="/" className="nav-link">
                Home
              </Link>
            </li>

            {/* Ford Dropdown */}
            <li className="nav-item dropdown">
              <Link href="/ford" className="nav-link dropdown-toggle">
                Ford
              </Link>
              {renderMenuSection(menuData.fordLinks, "/ford")}
            </li>

            {/* GM Late Model Dropdown */}
            <li className="nav-item dropdown">
              <Link href="/gm-late-model" className="nav-link dropdown-toggle">
                GM Late Model Cars
              </Link>
              {renderMenuSection(menuData.gmLateModelLinks, "/gm-late-model")}
            </li>

            {/* GM Mid Muscle Dropdown */}
            <li className="nav-item dropdown">
              <Link href="/gm-mid-muscle" className="nav-link dropdown-toggle">
                GM Mid Muscle Cars
              </Link>
              {renderMenuSection(menuData.gmMidMuscleLinks, "/gm-mid-muscle")}
            </li>

            {/* GM Classic Muscle Dropdown */}
            <li className="nav-item dropdown">
              <Link href="/gm-classic" className="nav-link dropdown-toggle">
                GM Classic Muscle Cars
              </Link>
              {renderMenuSection(menuData.gmClassicMuscleLinks, "/gm-classic")}
            </li>

            {/* Mopar Dropdown */}
            <li className="nav-item dropdown">
              <Link href="/mopar" className="nav-link dropdown-toggle">
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

            <li className="nav-item">
              <Link href="/about-us" className="nav-link">
                About Us
              </Link>
            </li>

            <li className="nav-item">
              <Link href="/contact" className="nav-link">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
