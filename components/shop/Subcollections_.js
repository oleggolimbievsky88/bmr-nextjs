// Subcollections.jsx

"use client";

import { useEffect, useState } from "react";

export default function SubcollectionsTest() {
  const [mainCategories, setMainCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        // Adjust `catName` to match the category you're querying for
        const catName = "Suspension"; // replace with your actual category
        const response = await fetch(`/api/categories/${catName}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch main categories");
        }

        const data = await response.json();
        setMainCategories(data);
      } catch (error) {
        console.error("Error fetching main categories:", error);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="subcollections">
      <h2>Categories</h2>
      <ul>
        {mainCategories.map((category) => (
          <li key={category.maincatid}>{category.name}</li>
        ))}
      </ul>
    </div>
  );
}
