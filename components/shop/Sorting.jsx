"use client";
import { sortingOptions } from "@/data/shop";
import React, { useEffect, useState, useRef } from "react";

// Props:
// products: array of product objects
// setFinalSorted: function to set sorted products (default: no-op)
export default function Sorting({ products = [], setFinalSorted = () => [] }) {
  const [selectedOptions, setSelectedOptions] = useState(sortingOptions[0]);
  const lastSortedRef = useRef(null);

  useEffect(() => {
    if (!products || products.length === 0) {
      return;
    }

    let sorted = [...products];
    if (selectedOptions.text === "Alphabetically, A-Z") {
      sorted.sort((a, b) => a.ProductName.localeCompare(b.ProductName));
    } else if (selectedOptions.text === "Alphabetically, Z-A") {
      sorted.sort((a, b) => b.ProductName.localeCompare(a.ProductName));
    } else if (selectedOptions.text === "Price, low to high") {
      sorted.sort((a, b) => a.Price - b.Price);
    } else if (selectedOptions.text === "Price, high to low") {
      sorted.sort((a, b) => b.Price - a.Price);
    }

    // Only update if the sorted result is actually different
    const sortedString = JSON.stringify(
      sorted.map((p) => ({
        ProductID: p.ProductID,
        ProductName: p.ProductName,
        Price: p.Price,
      }))
    );
    if (lastSortedRef.current !== sortedString) {
      lastSortedRef.current = sortedString;
      setFinalSorted(sorted);
    }
  }, [products, selectedOptions]); // Removed setFinalSorted from dependencies

  return (
    <>
      {" "}
      <div className="btn-select">
        <span className="text-sort-value">{selectedOptions.text}</span>
        <span className="icon icon-arrow-down" />
      </div>
      <div className="dropdown-menu">
        {sortingOptions.map((item, index) => (
          <div
            key={index}
            onClick={() => setSelectedOptions(item)}
            className={`select-item ${item == selectedOptions ? "active" : ""}`}
          >
            <span className="text-value-item">{item.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}
