"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function MegaMenu() {
  const [platforms, setPlatforms] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch("/api/menu");
        const data = await response.json();
        setPlatforms(data);
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
          <div
            className="d-flex gap-3"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <button className="px-3 py-2 text-secondary bg-transparent border-0 fw-semibold">
              Platforms
            </button>

            {isOpen && platforms.length > 0 && (
              <div
                className="position-absolute start-0 mt-2 w-100 bg-white border shadow rounded"
                style={{
                  zIndex: 9999,
                  background: "white",
                  top: 40,
                }}
              >
                <div className="p-4">
                  <div className="row g-3">
                    {platforms.map((platform) => (
                      <div
                        key={platform.id}
                        className="col-6 col-md-4 col-lg-3 col-xl-2"
                      >
                        <Link
                          href={`/products/${encodeURIComponent(
                            platform.slug
                          )}`}
                          className="text-decoration-none d-block"
                        >
                          <div className="text-center">
                            {platform.image && (
                              <div className="mb-2">
                                <Image
                                  src={platform.image}
                                  alt={platform.heading}
                                  width={150}
                                  height={100}
                                  className="img-fluid"
                                  style={{
                                    objectFit: "contain",
                                    maxHeight: "100px",
                                  }}
                                />
                              </div>
                            )}
                            <div className="text-dark fw-semibold small">
                              {platform.heading}
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
