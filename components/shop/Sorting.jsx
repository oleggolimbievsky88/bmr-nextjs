"use client";
import { products1 } from "@/data/products";
import { sortingOptions } from "@/data/shop";
import React, { useEffect, useState } from "react";

export default function Sorting({ products = products1, setFinalSorted }) {
  const [selectedOptions, setSelectedOptions] = useState(sortingOptions[0]);

  // useEffect(() => {
  //   let sorted = [...products];
  //   if (selectedOptions.text === "Alphabetically, A-Z") {
  //     sorted.sort((a, b) => a.ProductName.localeCompare(b.ProductName));
  //   } else if (selectedOptions.text === "Alphabetically, Z-A") {
  //     sorted.sort((a, b) => b.ProductName.localeCompare(a.ProductName));
  //   } else if (selectedOptions.text === "Price, low to high") {
  //     sorted.sort((a, b) => a.Price - b.Price);
  //   } else if (selectedOptions.text === "Price, high to low") {
  //     sorted.sort((a, b) => b.Price - a.Price);
  //   }
  //   // Only update if different
  //   setFinalSorted(sorted);
  // }, [products, selectedOptions]);

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
