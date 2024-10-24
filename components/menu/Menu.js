'use client';
import { useEffect, useState } from "react";

export default function Menu() {
  const [menuData, setMenuData] = useState([]);

  // Fetch menu data from the API
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const res = await fetch("/api/menu");
        const data = await res.json();
        setMenuData(data);
      } catch (error) {
        console.error("Failed to fetch menu data:", error);
      }
    };
    fetchMenuData();
  }, []);

  // Render the menu dynamically
  return (
    <nav>
      {menuData.map((category) => (
        <div key={category.heading}>
          <h3>{category.heading}</h3>
          <ul>
            {category.links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.text}</a>
              </li>
            ))}
            <li>test</li>
          </ul>
        </div>
      ))}
    </nav>
  );
}
