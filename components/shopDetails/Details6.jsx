"use client";
import React, { useState, useEffect } from "react";
import Slider2 from "./sliders/Slider2";
import Slider3 from "./sliders/Slider3";
import Image from "next/image";
import CountdownComponent from "../common/Countdown";
import BoughtTogether from "./BoughtTogether";
import {
  colors,
  paymentImages,
  sizeOptions,
  greaseOptions,
} from "@/data/singleProductOptions";
import StickyItem from "./StickyItem";
import Quantity from "./Quantity";
import Slider3BottomThumbs from "./sliders/Slider3BottomThumbs";
import { useRouter, useSearchParams } from "next/navigation";

export default function Details6({ product, initialColor, searchParams }) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();

  console.log("Details6 component rendered with product:", product);
  console.log("Product Color field:", product?.Color);
  console.log("Initial color from query param:", initialColor);
  console.log("Current searchParams:", searchParams);

  const [currentColor, setCurrentColor] = useState(null);
  const [currentGrease, setCurrentGrease] = useState(null);
  const [currentAnglefinder, setCurrentAnglefinder] = useState(null);
  const [currentHardware, setCurrentHardware] = useState(null);
  const [colorOptions, setColorOptions] = useState([]);
  const [greaseOptions, setGreaseOptions] = useState([]);
  const [anglefinderOptions, setAnglefinderOptions] = useState([]);
  const [hardwareOptions, setHardwareOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Helper function to ensure no default selections in static data
  const removeDefaultSelections = (options) => {
    return options.map((option) => ({
      ...option,
      defaultChecked: false,
    }));
  };

  // Helper function to slugify color names for URLs
  const slugifyColor = (colorName) => {
    return colorName
      ? colorName
          .toString()
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9\-]/g, "")
      : "";
  };

  // Helper function to find color by slug
  const findColorBySlug = (colors, slug) => {
    console.log("Finding color by slug:", { colors, slug });
    const foundColor = colors.find((color) => {
      const colorSlug = slugifyColor(color.ColorName);
      console.log(`Comparing: ${colorSlug} === ${slug}`);
      return colorSlug === slug;
    });
    console.log("Found color:", foundColor);
    return foundColor;
  };

  // Helper function to filter colors based on product's available colors
  const filterColorsByProduct = (allColors, productColorField) => {
    console.log("filterColorsByProduct called with:", {
      allColors,
      productColorField,
    });

    if (!productColorField || productColorField === "0") {
      console.log("No color field or color field is 0, returning empty array");
      return [];
    }

    // Parse the Color field (e.g., "1,2" means colors with ColorID 1 and 2)
    const availableColorIds = productColorField
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "0");

    console.log("Parsed available Color IDs:", availableColorIds);

    // Filter colors based on available ColorIDs and add CSS classes
    const filteredColors = allColors
      .filter((color) => {
        const isIncluded = availableColorIds.includes(color.ColorID.toString());
        console.log(
          `Color ${color.ColorName} (ID: ${color.ColorID}) included: ${isIncluded}`
        );
        return isIncluded;
      })
      .map((color) => {
        // Add CSS class based on color name
        let cssClass = "";
        const colorName = color.ColorName.toLowerCase();

        if (colorName === "red") {
          cssClass = "bg-color-red";
        } else if (colorName === "black hammertone") {
          cssClass = "bg-color-black";
        } else if (colorName.includes("black")) {
          cssClass = "bg-color-black";
        } else if (colorName.includes("blue")) {
          cssClass = "bg-color-blue";
        } else if (colorName.includes("white")) {
          cssClass = "bg-color-white";
        } else if (colorName.includes("brown")) {
          cssClass = "bg-color-brown";
        } else if (colorName.includes("beige")) {
          cssClass = "bg-color-beige";
        } else if (colorName.includes("pink")) {
          cssClass = "bg-color-pink";
        } else if (colorName.includes("orange")) {
          cssClass = "bg-color-orange";
        } else if (colorName.includes("light-blue")) {
          cssClass = "bg-color-light-blue";
        } else if (colorName.includes("light-purple")) {
          cssClass = "bg-color-light-purple";
        } else if (colorName.includes("light-green")) {
          cssClass = "bg-color-light-green";
        }

        console.log(`Color: ${color.ColorName}, CSS Class: ${cssClass}`);

        return {
          ...color,
          cssClass,
        };
      });

    console.log("Product Color field:", productColorField);
    console.log("Available Color IDs:", availableColorIds);
    console.log("Filtered colors with CSS classes:", filteredColors);

    return filteredColors;
  };

  // Function to update URL with color parameter
  const updateColorInURL = (color) => {
    console.log("updateColorInURL called with:", color);
    if (!color) {
      console.log("No color provided, removing color param");
      // Remove color parameter while preserving other query params
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.delete("color");
      const newURL = `${window.location.pathname}${
        currentParams.toString() ? `?${currentParams.toString()}` : ""
      }`;
      router.replace(newURL, { scroll: false });
      return;
    }

    const colorSlug = slugifyColor(color.ColorName);
    console.log("Color slug:", colorSlug);

    // Preserve existing query parameters
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("color", colorSlug);

    const newURL = `${window.location.pathname}?${currentParams.toString()}`;
    console.log("New URL:", newURL);

    // Use router.replace to update URL without page reload
    router.replace(newURL, { scroll: false });
  };

  // Fetch options from database
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        console.log("Fetching options from API...");
        const [colorsRes, greaseRes, anglefinderRes, hardwareRes] =
          await Promise.all([
            fetch("/api/colors"),
            fetch("/api/grease"),
            fetch("/api/anglefinder"),
            fetch("/api/hardware"),
          ]);

        // Check if all responses are ok
        if (
          !colorsRes.ok ||
          !greaseRes.ok ||
          !anglefinderRes.ok ||
          !hardwareRes.ok
        ) {
          throw new Error("One or more API calls failed");
        }

        const colorsData = await colorsRes.json();
        const greaseData = await greaseRes.json();
        const anglefinderData = await anglefinderRes.json();
        const hardwareData = await hardwareRes.json();

        console.log("API responses:", {
          colors: colorsData,
          grease: greaseData,
          anglefinder: anglefinderData,
          hardware: hardwareData,
        });

        // Filter colors based on product's available colors
        if (
          colorsData.success &&
          colorsData.colors &&
          colorsData.colors.length > 0
        ) {
          const filteredColors = filterColorsByProduct(
            colorsData.colors,
            product.Color
          );
          console.log("Using filtered database colors:", filteredColors);
          setColorOptions(filteredColors);

          // Check if initial color from URL matches any filtered colors
          const urlColorSlug = searchParamsHook.get("color");
          console.log("URL Color Slug:", urlColorSlug);

          if (urlColorSlug) {
            const colorFromUrl = findColorBySlug(filteredColors, urlColorSlug);
            if (colorFromUrl) {
              console.log("Setting currentColor from URL:", colorFromUrl);
              setCurrentColor(colorFromUrl);
            } else {
              console.log("Color from URL not found in available colors");
              setCurrentColor(null);
            }
          } else {
            // No color in URL
            setCurrentColor(null);
          }
        } else {
          console.log(
            "No database colors available, using static data with no defaults"
          );
          console.log("Colors API response:", colorsData);
          setColorOptions(removeDefaultSelections(colors));
          setCurrentColor(null);
        }

        // No default grease selection
        if (
          greaseData.success &&
          greaseData.grease &&
          greaseData.grease.length > 0
        ) {
          console.log("Using database grease:", greaseData.grease);
          // Remove any default selections
          const processedGreaseOptions = greaseData.grease.map((grease) => ({
            ...grease,
            defaultChecked: false,
          }));

          // Check if initial grease from URL matches any options
          const urlGreaseSlug = searchParamsHook.get("grease");
          console.log("URL Grease Slug:", urlGreaseSlug);
          const greaseFromUrl = urlGreaseSlug
            ? processedGreaseOptions.find(
                (g) => slugifyColor(g.GreaseName) === urlGreaseSlug
              )
            : null;

          console.log("Grease from URL:", greaseFromUrl);

          setGreaseOptions(processedGreaseOptions);
          // Explicitly set current grease to null
          setCurrentGrease(null);
        } else {
          console.log(
            "No database grease available, using static data with no defaults"
          );
          console.log("Grease API response:", greaseData);
          setGreaseOptions(removeDefaultSelections(greaseOptions));
          setCurrentGrease(null);
        }

        if (
          anglefinderData.success &&
          anglefinderData.anglefinder &&
          anglefinderData.anglefinder.length > 0
        ) {
          console.log(
            "Using database anglefinder:",
            anglefinderData.anglefinder
          );
          setAnglefinderOptions(anglefinderData.anglefinder);
        } else {
          console.log("No database anglefinder options");
          setAnglefinderOptions([]);
        }

        if (
          hardwareData.success &&
          hardwareData.hardware &&
          hardwareData.hardware.length > 0
        ) {
          console.log("Using database hardware:", hardwareData.hardware);
          setHardwareOptions(hardwareData.hardware);
        } else {
          console.log("No database hardware options");
          setHardwareOptions([]);
        }
      } catch (error) {
        console.error("Error fetching options:", error);
        // Fallback to static data with no defaults
        setColorOptions(removeDefaultSelections(colors));
        setGreaseOptions(removeDefaultSelections(greaseOptions));
        setCurrentColor(null);
        setCurrentGrease(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [product.Color]);

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    if (!currentColor) {
      newErrors.color = "Please select a color";
    }

    if (!currentGrease) {
      newErrors.grease = "Please select a grease option";
    }

    if (anglefinderOptions.length > 0 && !currentAnglefinder) {
      newErrors.anglefinder = "Please select an angle finder option";
    }

    if (hardwareOptions.length > 0 && !currentHardware) {
      newErrors.hardware = "Please select a hardware option";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear specific error when option is selected
  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Proceed with add to cart logic
    console.log("Adding to cart with options:", {
      color: currentColor,
      grease: currentGrease,
      anglefinder: currentAnglefinder,
      hardware: currentHardware,
    });
  };

  if (isLoading) {
    return (
      <section
        className="flat-spacing-4 pt_0"
        style={{ maxWidth: "100vw", overflow: "clip" }}
      >
        <div className="tf-main-product section-image-zoom">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <div className="tf-product-media-wrap thumbs-bottom sticky-top">
                  <div className="thumbs-slider" style={{ maxHeight: 600 }}>
                    <Slider3BottomThumbs
                      productId={product.ProductID}
                      selectedColor={currentColor}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="tf-product-info-wrap position-relative">
                  <div className="tf-product-info-list">
                    <div className="tf-product-info-title">
                      <h5>{product?.ProductName}</h5>
                    </div>
                    <div className="tf-product-info-price">
                      <div className="price-on-sale">
                        {product.Price ? `$${product.Price}` : "Price"}
                      </div>
                    </div>
                    <div className="tf-product-info-variant-picker">
                      <div className="text-center py-4">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading product options...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="flat-spacing-4 pt_0"
      style={{ maxWidth: "100vw", overflow: "clip" }}
    >
      <div className="tf-main-product section-image-zoom">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="tf-product-media-wrap thumbs-bottom sticky-top">
                <div className="thumbs-slider" style={{ maxHeight: 600 }}>
                  <Slider3BottomThumbs
                    productId={product.ProductID}
                    selectedColor={currentColor}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="tf-product-info-wrap position-relative">
                <div className="tf-zoom-main" />
                <div className="tf-product-info-list other-image-zoom">
                  <div className="tf-product-info-title">
                    <h5>{product?.ProductName}</h5>
                  </div>
                  <div className="tf-breadcrumb-list">
                    <span>
                      <h6
                        style={{
                          fontSize: 15,
                          marginBottom: 0,
                          marginTop: 0,
                          paddingTop: 0,
                          paddingBottom: 0,
                        }}
                      >
                        Part Number: {product.PartNumber}
                      </h6>
                    </span>
                  </div>

                  <div className="tf-product-info-price">
                    <div className="price-on-sale">
                      {product.Price ? `$${product.Price}` : "Price"}
                    </div>
                  </div>

                  <div className="tf-product-info-variant-picker">
                    {/* Show message if no options are available */}
                    {colorOptions.length === 0 &&
                      greaseOptions.length === 0 &&
                      anglefinderOptions.length === 0 &&
                      hardwareOptions.length === 0 && (
                        <div className="text-center py-3">
                          <p className="text-muted">
                            No product options available at this time.
                          </p>
                        </div>
                      )}

                    {/* Color Selection */}
                    {colorOptions.length > 0 && (
                      <div className="variant-picker-item">
                        <div className="variant-picker-label">
                          Color:{" "}
                          <span className="fw-6 variant-picker-label-value">
                            {currentColor
                              ? currentColor.ColorName || currentColor.value
                              : "Please select"}
                          </span>
                          {errors.color && (
                            <span className="text-danger ms-2">
                              {errors.color}
                            </span>
                          )}
                        </div>
                        <form className="variant-picker-values">
                          {colorOptions.map((color) => {
                            console.log("Rendering color option:", color);
                            return (
                              <React.Fragment key={color.ColorID || color.id}>
                                {color.ColorName}
                                <input
                                  type="radio"
                                  name="color"
                                  id={`color-${color.ColorID || color.id}`}
                                  checked={
                                    currentColor?.ColorID === color.ColorID ||
                                    currentColor?.id === color.id
                                  }
                                  onChange={() => {
                                    console.log(
                                      "=== COLOR SELECTION DEBUG ==="
                                    );
                                    console.log("Color selected:", color);
                                    console.log("Color ID:", color.ColorID);
                                    console.log("Color Name:", color.ColorName);

                                    // Set the current color
                                    setCurrentColor(color);

                                    // Clear any color-related errors
                                    clearError("color");

                                    // Update the URL with the selected color
                                    updateColorInURL(color);

                                    console.log(
                                      "=== END COLOR SELECTION DEBUG ==="
                                    );
                                  }}
                                  required
                                />
                                <label
                                  className={`hover-tooltip radius-60 ${
                                    errors.color ? "error" : ""
                                  } ${
                                    currentColor?.ColorID === color.ColorID ||
                                    currentColor?.id === color.id
                                      ? "selected"
                                      : ""
                                  }`}
                                  htmlFor={`color-${color.ColorID || color.id}`}
                                  data-value={color.ColorName || color.value}
                                  onClick={() => {
                                    console.log(
                                      "Label clicked for color:",
                                      color.ColorName
                                    );
                                    // Force the radio button to be selected
                                    const radioButton = document.getElementById(
                                      `color-${color.ColorID || color.id}`
                                    );
                                    if (radioButton) {
                                      radioButton.checked = true;
                                      // Set the current color to the full color object
                                      setCurrentColor(color);
                                      console.log(
                                        "Radio button checked:",
                                        radioButton
                                      );
                                    }
                                  }}
                                >
                                  <span
                                    className={`btn-checkbox ${
                                      color.cssClass ||
                                      (color.ColorName || color.value)
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")
                                    }`}
                                  />
                                  <span className="tooltip">
                                    {color.ColorName || color.value}
                                  </span>
                                </label>
                              </React.Fragment>
                            );
                          })}
                        </form>
                      </div>
                    )}

                    {/* Grease Selection */}
                    {greaseOptions.length > 0 && (
                      <div className="variant-picker-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="variant-picker-label">
                            Grease:{" "}
                            <span className="fw-6 variant-picker-label-value">
                              {currentGrease
                                ? currentGrease.GreaseName ||
                                  currentGrease.value
                                : "Please select"}
                            </span>
                            {errors.grease && (
                              <span className="text-danger ms-2">
                                {errors.grease}
                              </span>
                            )}
                          </div>
                        </div>
                        <form className="variant-picker-values">
                          {greaseOptions.map((grease) => (
                            <React.Fragment key={grease.GreaseID || grease.id}>
                              <input
                                type="radio"
                                name="grease"
                                id={`grease-${grease.GreaseID || grease.id}`}
                                checked={false} // Explicitly set to false
                                onChange={() => {
                                  setCurrentGrease(grease);
                                  clearError("grease");
                                }}
                                required
                              />
                              <label
                                className={`style-text ${
                                  errors.grease ? "error" : ""
                                }`}
                                htmlFor={`grease-${
                                  grease.GreaseID || grease.id
                                }`}
                                data-value={grease.GreaseName || grease.value}
                              >
                                <p>
                                  {grease.GreaseName || grease.value}{" "}
                                  {(grease.GreasePrice || grease.price) !== "0"
                                    ? `(+$${
                                        grease.GreasePrice || grease.price
                                      })`
                                    : ""}
                                </p>
                              </label>
                            </React.Fragment>
                          ))}
                        </form>
                      </div>
                    )}

                    {/* Angle Finder Selection */}
                    {anglefinderOptions.length > 0 && (
                      <div className="variant-picker-item">
                        <div className="variant-picker-label">
                          Angle Finder:{" "}
                          <span className="fw-6 variant-picker-label-value">
                            {currentAnglefinder
                              ? currentAnglefinder.AngleName
                              : "Please select"}
                          </span>
                          {errors.anglefinder && (
                            <span className="text-danger ms-2">
                              {errors.anglefinder}
                            </span>
                          )}
                        </div>
                        <form className="variant-picker-values">
                          {anglefinderOptions.map((anglefinder) => (
                            <React.Fragment key={anglefinder.AngleID}>
                              <input
                                type="radio"
                                name="anglefinder"
                                id={`anglefinder-${anglefinder.AngleID}`}
                                checked={
                                  currentAnglefinder?.AngleID ===
                                  anglefinder.AngleID
                                }
                                onChange={() => {
                                  setCurrentAnglefinder(anglefinder);
                                  clearError("anglefinder");
                                }}
                                required
                              />
                              <label
                                className={`style-text ${
                                  errors.anglefinder ? "error" : ""
                                }`}
                                htmlFor={`anglefinder-${anglefinder.AngleID}`}
                                data-value={anglefinder.AngleName}
                              >
                                <p>
                                  {anglefinder.AngleName}{" "}
                                  {anglefinder.AnglePrice !== "0"
                                    ? `(+$${anglefinder.AnglePrice})`
                                    : ""}
                                </p>
                              </label>
                            </React.Fragment>
                          ))}
                        </form>
                      </div>
                    )}

                    {/* Hardware Selection */}
                    {hardwareOptions.length > 0 && (
                      <div className="variant-picker-item">
                        <div className="variant-picker-label">
                          Hardware:{" "}
                          <span className="fw-6 variant-picker-label-value">
                            {currentHardware
                              ? currentHardware.HardwareName
                              : "Please select"}
                          </span>
                          {errors.hardware && (
                            <span className="text-danger ms-2">
                              {errors.hardware}
                            </span>
                          )}
                        </div>
                        <form className="variant-picker-values">
                          {hardwareOptions.map((hardware) => (
                            <React.Fragment key={hardware.HardwareID}>
                              <input
                                type="radio"
                                name="hardware"
                                id={`hardware-${hardware.HardwareID}`}
                                checked={
                                  currentHardware?.HardwareID ===
                                  hardware.HardwareID
                                }
                                onChange={() => {
                                  setCurrentHardware(hardware);
                                  clearError("hardware");
                                }}
                                required
                              />
                              <label
                                className={`style-text ${
                                  errors.hardware ? "error" : ""
                                }`}
                                htmlFor={`hardware-${hardware.HardwareID}`}
                                data-value={hardware.HardwareName}
                              >
                                <p>
                                  {hardware.HardwareName}{" "}
                                  {hardware.HardwarePrice !== "0"
                                    ? `(+$${hardware.HardwarePrice})`
                                    : ""}
                                </p>
                              </label>
                            </React.Fragment>
                          ))}
                        </form>
                      </div>
                    )}
                  </div>

                  <div className="tf-product-info-quantity">
                    <div className="quantity-title fw-6">Quantity</div>
                    <Quantity />
                  </div>

                  <div className="tf-product-info-buy-button">
                    <form onSubmit={handleAddToCart} className="">
                      <button
                        type="submit"
                        className="tf-btn btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn"
                      >
                        <span>Add to cart -&nbsp;</span>
                        <span className="tf-qty-price">${product.Price}</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
