"use client";

import { useEffect, useState } from "react";
import Slider from "rc-slider";
import { products1 } from "@/data/products";
import Link from "next/link";

export default function SidebarFilter({ 
  setProducts, 
  selectedCategory, 
  selectedSubCategory 
}) {
  const [price, setPrice] = useState([10, 20]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedAvailabilities, setSelectedAvailabilities] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Fetch products based on selected category and sub-category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Construct query parameters
        const params = new URLSearchParams();
        if (selectedCategory) {
          params.append('mainCategoryId', selectedCategory.MainCatID);
        }
        if (selectedSubCategory) {
          params.append('subCategoryId', selectedSubCategory.CatID);
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const fetchedProducts = await response.json();
        
        // Apply additional filters
        let filteredProducts = fetchedProducts;

        // Price filter
        filteredProducts = filteredProducts.filter(
          (product) => parseFloat(product.Price) >= price[0] && parseFloat(product.Price) <= price[1]
        );

        // Color filter (if implemented)
        if (selectedColors.length > 0) {
          filteredProducts = filteredProducts.filter(
            (product) => selectedColors.includes(product.Color)
          );
        }

        // Brand filter
        if (selectedBrands.length > 0) {
          filteredProducts = filteredProducts.filter(
            (product) => selectedBrands.includes(product.ManName)
          );
        }

        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [
    selectedCategory, 
    selectedSubCategory, 
    price, 
    selectedColors, 
    selectedBrands
  ]);

  const handlePrice = (value) => {
    setPrice(value);
  };

  const handleSelectColor = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color) 
        : [...prev, color]
    );
  };

  const handleSelectBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand) 
        : [...prev, brand]
    );
  };

  const clearFilter = () => {
    setSelectedColors([]);
    setSelectedBrands([]);
    setPrice([10, 20]);
  };

  return (
    <div className="tf-shop-sidebar wrap-sidebar-mobile">
      {/* Price Filter */}
      <div className="widget-facet wrap-price">
        <div
          className="facet-title"
          data-bs-target="#price"
          data-bs-toggle="collapse"
          aria-expanded="true"
          aria-controls="price"
        >
          <span>Price</span>
          <span className="icon icon-arrow-up" />
        </div>
        <div id="price" className="collapse show">
          <div className="widget-price filter-price">
            <Slider
              formatLabel={() => ``}
              range
              max={1000}  // Adjust based on your product prices
              min={0}
              defaultValue={price}
              onChange={(value) => handlePrice(value)}
            />
            <div className="price-label d-flex justify-content-between">
              <span>${price[0]}</span>
              <span>${price[1]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Color Filter */}
      <div className="widget-facet">
        <div
          className="facet-title"
          data-bs-target="#color"
          data-bs-toggle="collapse"
          aria-expanded="true"
          aria-controls="color"
        >
          <span>Color</span>
          <span className="icon icon-arrow-up" />
        </div>
        <div id="color" className="collapse show">
          <ul className="tf-color-filter d-flex flex-wrap gap-10">
            {['Red', 'Blue', 'Green', 'Black', 'White'].map((color) => (
              <li 
                key={color} 
                className={`color-item ${selectedColors.includes(color) ? 'active' : ''}`}
                onClick={() => handleSelectColor(color)}
              >
                <span className={`color-box bg-${color.toLowerCase()}`} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Brand Filter */}
      <div className="widget-facet">
        <div
          className="facet-title"
          data-bs-target="#brand"
          data-bs-toggle="collapse"
          aria-expanded="true"
          aria-controls="brand"
        >
          <span>Brand</span>
          <span className="icon icon-arrow-up" />
        </div>
        <div id="brand" className="collapse show">
          <ul className="tf-filter-group current-scrollbar mb_36">
            {['BMR', 'Performance', 'Racing'].map((brand) => (
              <li
                key={brand}
                className="list-item d-flex gap-12 align-items-center"
                onClick={() => handleSelectBrand(brand)}
              >
                <input
                  type="checkbox"
                  className="tf-check"
                  checked={selectedBrands.includes(brand)}
                  readOnly
                />
                <label className="label">{brand}</label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Clear Filter Button */}
      <div className="widget-facet">
        <button 
          className="tf-btn-filter w-100"
          onClick={clearFilter}
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}
