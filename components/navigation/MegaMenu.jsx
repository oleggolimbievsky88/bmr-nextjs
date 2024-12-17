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
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative">
          <div className="flex space-x-8">
            {menuData.map((group) => (
              <div
                key={group.id}
                className="relative"
                onMouseEnter={() => setActiveGroup(group.id)}
                onMouseLeave={() => setActiveGroup(null)}
              >
                <button className="px-3 py-2 text-gray-700 hover:text-gray-900">
                  {group.name}
                </button>

                {activeGroup === group.id && (
                  <div className="absolute left-0 mt-2 w-screen max-w-screen-xl bg-white border shadow-xl rounded-lg">
                    <div className="grid grid-cols-4 gap-6 p-6">
                      {group.platforms.map((platform) => (
                        <div key={platform.id} className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {platform.name}
                          </h3>
                          <Link
                            href={`/platform/${platform.name.toLowerCase()}`}
                            className="block text-sm text-gray-500 hover:text-gray-900"
                          >
                            View All {platform.name} Products
                          </Link>
                          {platform.category && (
                            <Link
                              href={`/platform/${platform.name.toLowerCase()}/${platform.category.name.toLowerCase()}`}
                              className="block text-sm text-gray-500 hover:text-gray-900"
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
