"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MainMenu() {
  const [menuData, setMenuData] = useState({
    fordLinks: [],
    moparLinks: [],
    gmLateModelLinks: [],
    gmMidMuscleLinks: [],
    gmClassicMuscleLinks: [],
  });

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => setMenuData(data))
      .catch((err) => console.error("Error fetching menu:", err));
  }, []);

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

            <li className="nav-item dropdown">
              <Link href="/ford" className="nav-link dropdown-toggle">
                Ford
              </Link>
              <div className="dropdown-menu mega-menu">
                <div className="mega-menu-section">
                  {menuData.fordLinks.map((section, idx) => (
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
            </li>

            <li className="nav-item dropdown">
              <Link href="/gm-late-model" className="nav-link dropdown-toggle">
                GM Late Model Cars
              </Link>
              <div className="dropdown-menu mega-menu">
                <div className="mega-menu-section">
                  {menuData.gmLateModelLinks.map((section, idx) => (
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
            </li>

            <li className="nav-item dropdown">
              <Link href="/gm-mid-muscle" className="nav-link dropdown-toggle">
                GM Mid Muscle Cars
              </Link>
              <div className="dropdown-menu mega-menu">
                <div className="mega-menu-section">
                  {menuData.gmMidMuscleLinks.map((section, idx) => (
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
            </li>

            <li className="nav-item dropdown">
              <Link href="/gm-classic" className="nav-link dropdown-toggle">
                GM Classic Muscle Cars
              </Link>
              <div className="dropdown-menu mega-menu">
                <div className="mega-menu-section">
                  {menuData.gmClassicMuscleLinks.map((section, idx) => (
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
            </li>

            <li className="nav-item dropdown">
              <Link href="/mopar" className="nav-link dropdown-toggle">
                Mopar
              </Link>
              <div className="dropdown-menu mega-menu">
                <div className="mega-menu-section">
                  {menuData.moparLinks.map((section, idx) => (
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
            </li>

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
