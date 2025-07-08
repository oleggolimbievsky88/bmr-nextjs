"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function MegaMenu() {
  const [menuData, setMenuData] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch("/api/menu");
        const data = await response.json();
        setMenuData(data);
      } catch (error) {
        console.error("Error fetching menu data:", error);
      }
    };

    fetchMenuData();
  }, []);

  return (
    <nav className="bg-white shadow-lg">
      <div className="container px-0">
        <div className="position-relative">
          <div className="d-flex gap-3">
            {menuData.map((group) => (
              <div
                key={group.id}
                className="position-relative"
                onMouseEnter={() => setActiveGroup(group.id)}
                onMouseLeave={() => setActiveGroup(null)}
              >
                <button className="px-3 py-2 text-secondary bg-transparent border-0 fw-semibold">
                  {group.name}
                </button>

                {activeGroup === group.id && (
                  <div
                    className="position-absolute start-0 mt-2 w-100 bg-white border shadow rounded"
                    style={{
                      zIndex: 9999,
                      background: "white",
                      top: 40,
                    }}
                  >
                    <div className="row g-4 p-4">
                      {group.platforms.map((platform) => (
                        <div
                          key={platform.id}
                          className="col-12 col-md-6 col-lg-3"
                        >
                          <h3 className="h6 fw-bold text-dark">
                            <Link
                              href={`/products/${platform.name.toLowerCase()}`}
                              className="text-dark text-decoration-none"
                            >
                              {platform.name}
                            </Link>
                          </h3>
                          <Link
                            href={`/products/${platform.name.toLowerCase()}`}
                            className="d-block text-secondary text-decoration-none mb-2"
                          >
                            View All {platform.name} Products
                          </Link>
                          {platform.category && (
                            <Link
                              href={`/products/${platform.name.toLowerCase()}/${platform.category.name.toLowerCase()}`}
                              className="d-block text-secondary text-decoration-none"
                            >
                              {platform.category.name}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
