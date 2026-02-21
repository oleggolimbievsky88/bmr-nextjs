"use client";
import React, { useState, useEffect } from "react";
import Slider2 from "./sliders/Slider2";
import Slider3 from "./sliders/Slider3";
import Image from "next/image";
import CountdownComponent from "../common/Countdown";
import {
  colors,
  paymentImages,
  sizeOptions,
  greaseOptions,
} from "@/data/singleProductOptions";
import StickyItem from "./StickyItem";
import Quantity from "./Quantity";
import Slider3BottomThumbs from "./sliders/Slider3BottomThumbs";
import { useRouter } from "next/navigation";
import { useContextElement } from "@/context/Context";

export default function ProductDetails({
  product,
  initialColor,
  searchParams,
  sizeVariants = [],
}) {
  const router = useRouter();
  const { addProductToCart, isAddedToCartProducts, clearCart } =
    useContextElement();

  const [currentColor, setCurrentColor] = useState(null);
  const [selectedSizeVariant, setSelectedSizeVariant] = useState(null);

  const effectiveProduct =
    selectedSizeVariant && sizeVariants.length > 1
      ? selectedSizeVariant
      : product;
  const displayProduct = effectiveProduct || product;
  const [currentGrease, setCurrentGrease] = useState(undefined);
  const [currentAnglefinder, setCurrentAnglefinder] = useState(undefined);
  const maxQty = (product?.Qty || 0) > 0 ? parseInt(product.Qty, 10) : null;
  const [quantity, setQuantity] = useState(1);

  // Clamp quantity when product has limited stock (maxQty)
  useEffect(() => {
    if (maxQty != null && quantity > maxQty) {
      setQuantity(maxQty);
    }
  }, [maxQty, product?.ProductID, quantity]);

  // Set default size variant when sizeVariants loads (match current product)
  useEffect(() => {
    if (sizeVariants.length > 1) {
      const match =
        sizeVariants.find((v) => v.ProductID === product?.ProductID) ||
        sizeVariants[0];
      setSelectedSizeVariant(match);
    } else {
      setSelectedSizeVariant(null);
    }
  }, [sizeVariants, product?.ProductID]);

  const [colorOptions, setColorOptions] = useState([]);
  const [greaseOptions, setGreaseOptions] = useState([]);
  const [anglefinderOptions, setAnglefinderOptions] = useState([]);
  const [selectedHardwarePacks, setSelectedHardwarePacks] = useState(undefined);
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
          `Color ${color.ColorName} (ID: ${color.ColorID}) included: ${isIncluded}`,
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
        const [colorsRes, greaseRes, anglefinderRes] = await Promise.all([
          fetch("/api/colors"),
          fetch("/api/grease"),
          fetch("/api/anglefinder"),
        ]);

        if (!colorsRes.ok || !greaseRes.ok || !anglefinderRes.ok) {
          throw new Error("One or more API calls failed");
        }

        const colorsData = await colorsRes.json();
        const greaseData = await greaseRes.json();
        const anglefinderData = await anglefinderRes.json();

        console.log("API responses:", {
          colors: colorsData,
          grease: greaseData,
          anglefinder: anglefinderData,
        });

        // Filter colors based on product's available colors
        if (
          colorsData.success &&
          colorsData.colors &&
          colorsData.colors.length > 0
        ) {
          const filteredColors = filterColorsByProduct(
            colorsData.colors,
            product.Color,
          );
          console.log("Using filtered database colors:", filteredColors);
          setColorOptions(filteredColors);

          // Check if initial color from URL matches any filtered colors
          const urlColorSlug = new URLSearchParams(
            typeof window !== "undefined" ? window.location.search : "",
          ).get("color");
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
            // Auto-select if there's only one color option
            if (filteredColors.length === 1) {
              const singleColor = filteredColors[0];
              console.log(
                "Only one color option available, auto-selecting:",
                singleColor,
              );
              setCurrentColor(singleColor);
              // Update URL with the auto-selected color
              updateColorInURL(singleColor);
            } else {
              // No color in URL and multiple options - require selection
              console.log(
                "No color in URL - requiring selection for all color options",
              );
              setCurrentColor(null);
            }
          }
        } else {
          console.log(
            "No database colors available, using static data with no defaults",
          );
          console.log("Colors API response:", colorsData);
          setColorOptions(removeDefaultSelections(colors));
          setCurrentColor(null);
        }

        // No default grease selection - always require selection
        if (
          greaseData.success &&
          greaseData.grease &&
          greaseData.grease.length > 0 &&
          product.Grease &&
          product.Grease !== "0"
        ) {
          console.log("Using database grease:", greaseData.grease);
          // Remove any default selections
          const processedGreaseOptions = greaseData.grease.map((grease) => ({
            ...grease,
            defaultChecked: false,
          }));

          setGreaseOptions(processedGreaseOptions);
          // Always start with undefined - no pre-selection
          setCurrentGrease(undefined);
        } else {
          console.log(
            "No database grease available or product doesn't support grease, hiding grease options",
          );
          console.log("Grease API response:", greaseData);
          console.log("Product Grease field:", product.Grease);
          setGreaseOptions([]);
          setCurrentGrease(undefined);
        }

        if (
          anglefinderData.success &&
          anglefinderData.anglefinder &&
          anglefinderData.anglefinder.length > 0 &&
          product.AngleFinder &&
          product.AngleFinder !== "0"
        ) {
          console.log(
            "Using database anglefinder:",
            anglefinderData.anglefinder,
          );
          setAnglefinderOptions(anglefinderData.anglefinder);
          // Always start with undefined - no pre-selection
          setCurrentAnglefinder(undefined);
        } else {
          console.log(
            "No database anglefinder options or product doesn't support angle finder, hiding angle finder options",
          );
          console.log("Product AngleFinder field:", product.AngleFinder);
          setAnglefinderOptions([]);
          setCurrentAnglefinder(undefined);
        }
      } catch (error) {
        console.error("Error fetching options:", error);
        // Fallback to static data with no defaults
        setColorOptions(removeDefaultSelections(colors));
        setGreaseOptions(removeDefaultSelections(greaseOptions));
        setCurrentColor(null);
        setCurrentGrease(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [product.Color]);

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    // Require color selection if there are any color options available
    if (colorOptions.length > 0 && !currentColor) {
      newErrors.color = "Please select a color";
    }

    // Require grease selection if there are any grease options available
    if (greaseOptions.length > 0 && currentGrease === undefined) {
      newErrors.grease = "Please select a grease option";
    }

    // Require angle finder selection if there are any angle finder options available
    if (anglefinderOptions.length > 0 && currentAnglefinder === undefined) {
      newErrors.anglefinder = "Please select an angle finder option";
    }

    // Require hardware selection if product has hardware pack options
    if (
      product.hardwarePackProducts &&
      product.hardwarePackProducts.length > 0 &&
      selectedHardwarePacks === undefined
    ) {
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

  const qtyAvailable = parseInt(product?.Qty, 10) || 0;
  const isBlemOutOfStock = product?.BlemProduct && qtyAvailable <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();

    if (isBlemOutOfStock) return;

    if (!validateForm()) {
      return;
    }

    console.log("Adding to cart with options:", {
      color: currentColor,
      grease: currentGrease,
      anglefinder: currentAnglefinder,
      selectedHardwarePacks: selectedHardwarePacks,
    });

    const productToAdd = displayProduct || product;
    addProductToCart(productToAdd.ProductID, quantity, {
      selectedColor: currentColor,
      selectedGrease: currentGrease,
      selectedAnglefinder: currentAnglefinder,
      selectedHardware: null,
      selectedHardwarePacks: selectedHardwarePacks ?? [],
      selectedSize:
        sizeVariants.length > 1 && productToAdd?.sizeLabel
          ? productToAdd.sizeLabel
          : undefined,
    });
  };

  if (isLoading) {
    return (
      <section
        className="pt-1 pb-2"
        style={{ maxWidth: "100vw", overflow: "clip" }}
      >
        <div className="tf-main-product section-image-zoom">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <div className="tf-product-media-wrap thumbs-bottom sticky-top">
                  <div className="thumbs-slider">
                    {/* <Slider3BottomThumbs
                      productId={product.ProductID}
                      selectedColor={currentColor}
                    /> */}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="tf-product-info-wrap position-relative">
                  <div className="tf-product-info-list">
                    <div className="tf-product-info-title">
                      <h5>{product?.ProductName}</h5>
                      {product?.StartAppYear &&
                        product?.EndAppYear &&
                        String(product.StartAppYear).trim() !== "" &&
                        String(product.EndAppYear).trim() !== "" && (
                          <span
                            className="d-inline-block mt-2 px-3 py-1 rounded-pill fw-semibold"
                            style={{
                              fontSize: "0.8rem",
                              letterSpacing: "0.04em",
                              backgroundColor:
                                "var(--tf-theme-primary, #e8b923)",
                              color: "#1a1a1a",
                            }}
                          >
                            Fits:{" "}
                            {product.StartAppYear === product.EndAppYear
                              ? product.StartAppYear
                              : `${product.StartAppYear} – ${product.EndAppYear}`}
                          </span>
                        )}
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
      className="pt-1 pb-2"
      style={{ maxWidth: "100vw", overflow: "clip" }}
    >
      <div className="tf-main-product section-image-zoom">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="tf-product-media-wrap thumbs-bottom sticky-top tf-product-media-wrap-zoom">
                <div className="thumbs-slider">
                  <Slider3BottomThumbs
                    productId={displayProduct?.ProductID || product?.ProductID}
                    selectedColor={currentColor}
                  />
                </div>
                <div className="tf-zoom-main" />
              </div>
            </div>
            <div className="col-md-6">
              <div
                className="tf-product-info-wrap position-relative"
                style={{ overflow: "visible" }}
              >
                <div className="tf-product-info-list other-image-zoom">
                  <div className="tf-product-info-title">
                    <h5>
                      {displayProduct?.ProductName || product?.ProductName}
                    </h5>
                    {(() => {
                      const p = product || {};
                      const hasProductYears =
                        p.StartAppYear &&
                        String(p.StartAppYear).trim() !== "" &&
                        parseInt(p.StartAppYear, 10) > 0 &&
                        p.EndAppYear &&
                        String(p.EndAppYear).trim() !== "" &&
                        parseInt(p.EndAppYear, 10) > 0;
                      const startYear = hasProductYears
                        ? String(p.StartAppYear).trim()
                        : (Array.isArray(p.platforms) && p.platforms[0]
                            ? String(p.platforms[0].startYear || "").trim()
                            : null) ||
                          (p.YearRange
                            ? String(p.YearRange).split("-")[0]?.trim()
                            : null);
                      const endYear = hasProductYears
                        ? String(p.EndAppYear).trim()
                        : (Array.isArray(p.platforms) && p.platforms[0]
                            ? String(p.platforms[0].endYear || "").trim()
                            : null) ||
                          (p.YearRange
                            ? String(p.YearRange).split("-")[1]?.trim()
                            : null);
                      if (!startYear && !endYear) return null;
                      const label =
                        startYear && endYear
                          ? startYear === endYear
                            ? startYear
                            : `${startYear} – ${endYear}`
                          : startYear || endYear;
                      return (
                        <span
                          className="d-inline-block mt-2 px-3 py-1 rounded-pill fw-semibold"
                          style={{
                            fontSize: "0.8rem",
                            letterSpacing: "0.04em",
                            backgroundColor: "var(--tf-theme-primary, #e8b923)",
                            color: "#1a1a1a",
                          }}
                        >
                          Fits: {label}
                        </span>
                      );
                    })()}
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
                        Part Number:{" "}
                        {displayProduct?.PartNumber || product?.PartNumber}
                      </h6>
                    </span>
                  </div>

                  <div className="tf-product-info-price">
                    <div className="price-on-sale">
                      {displayProduct?.Price
                        ? `$${displayProduct.Price}`
                        : "Price"}
                    </div>
                  </div>

                  {(sizeVariants.length > 1 ||
                    colorOptions.length > 0 ||
                    greaseOptions.length > 0 ||
                    anglefinderOptions.length > 0 ||
                    (product.hardwarePackProducts &&
                      product.hardwarePackProducts.length > 0)) && (
                    <div
                      className="tf-product-info-variant-picker"
                      style={{ borderRadius: "20px", padding: "16px" }}
                    >
                      {/* Size Selection (merchandise) */}
                      {sizeVariants.length > 1 && (
                        <div
                          className="variant-picker-item"
                          style={{ borderRadius: "20px", marginBottom: "1rem" }}
                        >
                          <div className="variant-picker-label">
                            Size:{" "}
                            <span className="fw-6 variant-picker-label-value">
                              {selectedSizeVariant?.sizeLabel || "Select size"}
                            </span>
                          </div>
                          <form className="variant-picker-values">
                            {sizeVariants.map((v) => (
                              <React.Fragment key={v.ProductID}>
                                <input
                                  type="radio"
                                  name="product-size"
                                  id={`size-${v.ProductID}`}
                                  checked={
                                    selectedSizeVariant?.ProductID ===
                                    v.ProductID
                                  }
                                  onChange={() => setSelectedSizeVariant(v)}
                                />
                                <label
                                  htmlFor={`size-${v.ProductID}`}
                                  className="style-text"
                                >
                                  <p>{v.sizeLabel}</p>
                                </label>
                              </React.Fragment>
                            ))}
                          </form>
                        </div>
                      )}
                      {/* Color Selection */}
                      {colorOptions.length > 0 && (
                        <div
                          className="variant-picker-item"
                          style={{ borderRadius: "20px" }}
                        >
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
                            {/* Hidden radio button for when no color is selected */}
                            <input
                              type="radio"
                              name="color"
                              id="color-none"
                              checked={!currentColor}
                              onChange={() => {}}
                              style={{ display: "none" }}
                            />
                            {colorOptions.map((color) => {
                              console.log("Rendering color option:", color);
                              console.log("Current color state:", currentColor);
                              const isSelected =
                                currentColor &&
                                (currentColor.ColorID === color.ColorID ||
                                  currentColor.id === color.id);
                              console.log(
                                "Is this color selected?",
                                isSelected,
                              );
                              return (
                                <React.Fragment key={color.ColorID || color.id}>
                                  {color.ColorName}
                                  <input
                                    type="radio"
                                    name="color"
                                    id={`color-${color.ColorID || color.id}`}
                                    checked={isSelected || false}
                                    onChange={() => {
                                      console.log(
                                        "=== COLOR SELECTION DEBUG ===",
                                      );
                                      console.log("Color selected:", color);
                                      console.log("Color ID:", color.ColorID);
                                      console.log(
                                        "Color Name:",
                                        color.ColorName,
                                      );

                                      // Set the current color
                                      setCurrentColor(color);

                                      // Clear any color-related errors
                                      clearError("color");

                                      // Update the URL with the selected color
                                      updateColorInURL(color);

                                      console.log(
                                        "=== END COLOR SELECTION DEBUG ===",
                                      );
                                    }}
                                  />
                                  <label
                                    className={`hover-tooltip radius-60 ${
                                      errors.color ? "error" : ""
                                    } ${isSelected ? "selected" : ""}`}
                                    htmlFor={`color-${color.ColorID || color.id}`}
                                    data-value={color.ColorName || color.value}
                                    onClick={() => {
                                      console.log(
                                        "Label clicked for color:",
                                        color.ColorName,
                                      );
                                      // Force the radio button to be selected
                                      const radioButton =
                                        document.getElementById(
                                          `color-${color.ColorID || color.id}`,
                                        );
                                      if (radioButton) {
                                        radioButton.checked = true;
                                        // Set the current color to the full color object
                                        setCurrentColor(color);
                                        console.log(
                                          "Radio button checked:",
                                          radioButton,
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
                        <div
                          className="variant-picker-item"
                          style={{ borderRadius: "20px" }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="variant-picker-label">
                              Grease:{" "}
                              <span className="fw-6 variant-picker-label-value">
                                {currentGrease === undefined
                                  ? "Please select"
                                  : currentGrease === null
                                    ? "No Thanks"
                                    : currentGrease
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
                            {/* No Thanks option */}
                            <React.Fragment key="grease-none">
                              <input
                                type="radio"
                                name="grease"
                                id="grease-none"
                                checked={currentGrease === null}
                                onChange={() => {
                                  setCurrentGrease(null);
                                  clearError("grease");
                                }}
                              />
                              <label
                                className={`style-text ${
                                  errors.grease ? "error" : ""
                                }`}
                                htmlFor="grease-none"
                                data-value="No Thanks"
                              >
                                <p>No Thanks</p>
                              </label>
                            </React.Fragment>
                            {greaseOptions.map((grease) => (
                              <React.Fragment
                                key={grease.GreaseID || grease.id}
                              >
                                <input
                                  type="radio"
                                  name="grease"
                                  id={`grease-${grease.GreaseID || grease.id}`}
                                  checked={
                                    currentGrease?.GreaseID ===
                                      grease.GreaseID || false
                                  }
                                  onChange={() => {
                                    setCurrentGrease(grease);
                                    clearError("grease");
                                  }}
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
                                    {(grease.GreasePrice || grease.price) !==
                                    "0"
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
                        <div
                          className="variant-picker-item"
                          style={{ borderRadius: "20px" }}
                        >
                          <div className="variant-picker-label">
                            Angle Finder:{" "}
                            <span className="fw-6 variant-picker-label-value">
                              {currentAnglefinder === undefined
                                ? "Please select"
                                : currentAnglefinder === null
                                  ? "No Thanks"
                                  : currentAnglefinder
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
                            {/* No Thanks option */}
                            <React.Fragment key="anglefinder-none">
                              <input
                                type="radio"
                                name="anglefinder"
                                id="anglefinder-none"
                                checked={currentAnglefinder === null}
                                onChange={() => {
                                  setCurrentAnglefinder(null);
                                  clearError("anglefinder");
                                }}
                              />
                              <label
                                className={`style-text ${
                                  errors.anglefinder ? "error" : ""
                                }`}
                                htmlFor="anglefinder-none"
                                data-value="No Thanks"
                              >
                                <p>No Thanks</p>
                              </label>
                            </React.Fragment>
                            {anglefinderOptions.map((anglefinder) => (
                              <React.Fragment key={anglefinder.AngleID}>
                                <input
                                  type="radio"
                                  name="anglefinder"
                                  id={`anglefinder-${anglefinder.AngleID}`}
                                  checked={
                                    currentAnglefinder?.AngleID ===
                                      anglefinder.AngleID || false
                                  }
                                  onChange={() => {
                                    setCurrentAnglefinder(anglefinder);
                                    clearError("anglefinder");
                                  }}
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

                      {/* Hardware: No Thanks + hardware packs from product.hardwarePackProducts */}
                      {product.hardwarePackProducts &&
                        product.hardwarePackProducts.length > 0 && (
                          <div
                            className="variant-picker-item"
                            style={{ borderRadius: "20px" }}
                          >
                            <div className="variant-picker-label">
                              Hardware:{" "}
                              <span className="fw-6 variant-picker-label-value">
                                {selectedHardwarePacks === undefined
                                  ? "Please select"
                                  : selectedHardwarePacks.length === 0
                                    ? "No Thanks"
                                    : selectedHardwarePacks.length === 1
                                      ? `${selectedHardwarePacks[0].ProductName}${selectedHardwarePacks[0].Price && parseFloat(selectedHardwarePacks[0].Price) > 0 ? ` (+$${parseFloat(selectedHardwarePacks[0].Price).toFixed(2)})` : ""}`
                                      : `${selectedHardwarePacks.length} pack(s) selected`}
                              </span>
                              {errors.hardware && (
                                <span className="text-danger ms-2">
                                  {errors.hardware}
                                </span>
                              )}
                            </div>
                            <form className="variant-picker-values">
                              <label
                                className={`style-text ${
                                  errors.hardware ? "error" : ""
                                }`}
                                style={{
                                  cursor: "pointer",
                                  borderRadius: "20px",
                                }}
                                onClick={() => {
                                  setSelectedHardwarePacks([]);
                                  clearError("hardware");
                                }}
                              >
                                <input
                                  type="radio"
                                  name="hardware"
                                  readOnly
                                  checked={
                                    selectedHardwarePacks !== undefined &&
                                    selectedHardwarePacks.length === 0
                                  }
                                />
                                <p>No Thanks</p>
                              </label>
                              {product.hardwarePackProducts.map((pack) => {
                                const isSelected =
                                  Array.isArray(selectedHardwarePacks) &&
                                  selectedHardwarePacks.some(
                                    (p) => p.ProductID === pack.ProductID,
                                  );
                                return (
                                  <label
                                    key={pack.ProductID}
                                    className={`style-text d-flex align-items-center gap-2 ${
                                      errors.hardware ? "error" : ""
                                    }`}
                                    style={{
                                      cursor: "pointer",
                                      borderRadius: "20px",
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {
                                        setSelectedHardwarePacks((prev) => {
                                          const current =
                                            prev === undefined ? [] : prev;
                                          return isSelected
                                            ? current.filter(
                                                (p) =>
                                                  p.ProductID !==
                                                  pack.ProductID,
                                              )
                                            : [...current, pack];
                                        });
                                        clearError("hardware");
                                      }}
                                    />
                                    <span>
                                      {pack.ProductName}{" "}
                                      {pack.Price && parseFloat(pack.Price) > 0
                                        ? `(+$${parseFloat(pack.Price).toFixed(2)})`
                                        : ""}
                                    </span>
                                  </label>
                                );
                              })}
                            </form>
                          </div>
                        )}
                    </div>
                  )}

                  <div
                    className="tf-product-info-quantity"
                    style={{ borderRadius: "20px" }}
                  >
                    <div className="quantity-title fw-6">Quantity</div>
                    <Quantity
                      value={quantity}
                      onChange={setQuantity}
                      max={maxQty ?? undefined}
                    />
                  </div>

                  <div className="tf-product-info-buy-button">
                    <form onSubmit={handleAddToCart} className="">
                      <button
                        type="submit"
                        className="tf-btn btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn"
                        style={{ borderRadius: "20px" }}
                        disabled={isBlemOutOfStock}
                      >
                        <span>
                          {isBlemOutOfStock ? "Out of Stock" : "Add to cart -"}
                        </span>
                        {!isBlemOutOfStock && (
                          <span className="tf-qty-price">
                            $
                            {(
                              (Number(product.Price) || 0) * (quantity || 1) +
                              (currentGrease
                                ? (parseFloat(currentGrease.GreasePrice) || 0) *
                                  (quantity || 1)
                                : 0) +
                              (currentAnglefinder
                                ? (parseFloat(currentAnglefinder.AnglePrice) ||
                                    0) * (quantity || 1)
                                : 0) +
                              ((selectedHardwarePacks ?? []).length > 0
                                ? (selectedHardwarePacks ?? []).reduce(
                                    (sum, p) =>
                                      sum +
                                      (parseFloat(p.Price) || 0) *
                                        (quantity || 1),
                                    0,
                                  )
                                : 0)
                            ).toFixed(2)}
                          </span>
                        )}
                      </button>
                    </form>
                    {/* Temporary debug buttons - remove after testing */}
                    {/* <div className="d-flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          clearCart();
                          console.log("Cart cleared");
                        }}
                        className="btn btn-sm btn-outline-danger"
                        style={{ fontSize: "12px" }}
                      >
                        Clear Cart (Debug)
                      </button>
                    </div> */}
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
