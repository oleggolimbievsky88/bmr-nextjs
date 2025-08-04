"use client";
import { useState } from "react";
const categories = [
  { id: 1, name: "Suspension", isActive: true, link: "/shop-default" },
];
const filterColors = [
  { name: "Red", colorClass: "bg_orange-3" },
  { name: "Black Hammertone", colorClass: "bg_dark" },
];
const brands = ["BMR Suspension", "Qa1"];
const availabilities = [
  { id: 1, isAvailable: true, text: "Available", count: 14 },
  { id: 2, isAvailable: false, text: "Out of Stock", count: 2 },
];
const sizes = ["S", "M", "L", "XL"];
import Slider from "rc-slider";
import Link from "next/link";
export default function ShopFilter({
  setSelectedColors,
  setSelectedBrands,
  setSelectedAvailabilities,
  setSelectedSizes,
  setPrice,
  selectedColors = [],
  selectedBrands = [],
  selectedAvailabilities = [],
  selectedSizes = [],
  price = [10, 10000],
}) {
  // Local state for UI only
  const [localPrice, setLocalPrice] = useState(price);
  const handlePrice = (value) => {
    setLocalPrice(value);
    setPrice && setPrice(value);
  };
  const handleSelectColor = (color) => {
    if (!setSelectedColors) return;
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((el) => el !== color)
        : [...prev, color]
    );
  };
  const handleSelectBrand = (brand) => {
    if (!setSelectedBrands) return;
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((el) => el !== brand)
        : [...prev, brand]
    );
  };
  const handleSelectAvailabilities = (availability) => {
    if (!setSelectedAvailabilities) return;
    setSelectedAvailabilities((prev) =>
      prev.includes(availability)
        ? prev.filter((el) => el !== availability)
        : [...prev, availability]
    );
  };
  const handleSelectSizes = (size) => {
    if (!setSelectedSizes) return;
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((el) => el !== size) : [...prev, size]
    );
  };
  const clearFilter = () => {
    setSelectedColors && setSelectedColors([]);
    setSelectedBrands && setSelectedBrands([]);
    setSelectedAvailabilities && setSelectedAvailabilities([]);
    setSelectedSizes && setSelectedSizes([]);
    setPrice && setPrice([10, 20]);
    setLocalPrice([10, 20]);
  };
  return (
    <div className="offcanvas offcanvas-start canvas-filter" id="filterShop">
      <div className="canvas-wrapper">
        <header className="canvas-header">
          <div className="filter-icon">
            <span className="icon icon-filter" />
            <span>Filter</span>
          </div>
          <span
            className="icon-close icon-close-popup"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </header>
        <div className="canvas-body">
          <div className="widget-facet wd-categories">
            <div
              className="facet-title"
              data-bs-target="#categories"
              data-bs-toggle="collapse"
              aria-expanded="true"
              aria-controls="categories"
            >
              <span>Product categories</span>
              <span className="icon icon-arrow-up" />
            </div>
            <div id="categories" className="collapse show">
              <ul className="list-categoris current-scrollbar mb_36">
                {categories.map((category) => (
                  <li key={category.id} className={`cate-item`}>
                    {category.link ? (
                      <Link href={category.link}>
                        <span>{category.name}</span>
                      </Link>
                    ) : (
                      <Link href={`${category.name.toLowerCase()}`}>
                        <span>{category.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            action="#"
            id="facet-filter-form"
            className="facet-filter-form"
          >
            <div className="widget-facet">
              <div
                className="facet-title"
                data-bs-target="#availability"
                data-bs-toggle="collapse"
                aria-expanded="true"
                aria-controls="availability"
              >
                <span>Availability</span>
                <span className="icon icon-arrow-up" />
              </div>
              <div id="availability" className="collapse show">
                <ul className="tf-filter-group current-scrollbar mb_36">
                  {availabilities.map((availability) => (
                    <li
                      key={availability.id}
                      className="list-item d-flex gap-12 align-items-center"
                      onClick={() => handleSelectAvailabilities(availability)}
                    >
                      <input
                        type="radio"
                        className="tf-check"
                        readOnly
                        checked={selectedAvailabilities?.includes(availability)}
                      />
                      <label className="label">
                        <span>{availability.text}</span>&nbsp;
                        <span>({availability.count})</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
                    max={22}
                    min={5}
                    defaultValue={localPrice}
                    value={localPrice}
                    onChange={handlePrice}
                    id="slider"
                  />
                  <div className="box-title-price">
                    <span className="title-price">Price :</span>
                    <div className="caption-price">
                      <div>
                        <span>$</span>
                        <span className="min-price">{localPrice[0]}</span>
                      </div>
                      <span>-</span>
                      <div>
                        <span>$</span>
                        <span className="max-price">{localPrice[1]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                  {brands.map((brand) => (
                    <li
                      key={brand}
                      className="list-item d-flex gap-12 align-items-center"
                      onClick={() => handleSelectBrand(brand)}
                    >
                      <input
                        type="radio"
                        className="tf-check"
                        readOnly
                        checked={selectedBrands?.includes(brand)}
                      />
                      <label className="label">
                        <span>{brand}</span>&nbsp;
                        <span>{/* count not available here */}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
                <ul className="tf-filter-group filter-color current-scrollbar mb_36">
                  {filterColors.map((elm, i) => (
                    <li
                      key={i}
                      className="list-item d-flex gap-12 align-items-center"
                      onClick={() => handleSelectColor(elm.name)}
                    >
                      <input
                        type="checkbox"
                        name="color"
                        className={`tf-check-color ${elm.colorClass}`}
                        readOnly
                        checked={selectedColors?.includes(elm.name)}
                      />
                      <label className="label">
                        <span>{elm.name}</span>&nbsp;
                        <span>{/* count not available here */}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="widget-facet">
              <div
                className="facet-title"
                data-bs-target="#size"
                data-bs-toggle="collapse"
                aria-expanded="true"
                aria-controls="size"
              >
                <span>Size</span>
                <span className="icon icon-arrow-up" />
              </div>
              <div id="size" className="collapse show">
                <ul className="tf-filter-group current-scrollbar">
                  {sizes.map((elm, i) => (
                    <li
                      key={i}
                      onClick={() => handleSelectSizes(elm)}
                      className="list-item d-flex gap-12 align-items-center"
                    >
                      <input
                        type="radio"
                        className="tf-check tf-check-size"
                        readOnly
                        checked={selectedSizes?.includes(elm)}
                      />
                      <label className="label">
                        <span>{elm}</span>&nbsp;
                        <span>{/* count not available here */}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </form>
          <div className="mt-5"></div>
          <a
            className="tf-btn style-2 btn-fill rounded animate-hover-btn"
            onClick={clearFilter}
          >
            Clear Filter
          </a>
        </div>
      </div>
    </div>
  );
}
