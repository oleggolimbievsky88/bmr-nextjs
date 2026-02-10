"use client";
import { openCartModal } from "@/utlis/openCartModal";
import { showToast } from "@/utlis/showToast";
//import { openCart } from "@/utlis/toggleCart";
import React, { useEffect, useRef } from "react";
import { useContext, useState } from "react";
const dataContext = React.createContext();
export const useContextElement = () => {
  return useContext(dataContext);
};

export default function Context({ children }) {
  const [cartProducts, setCartProducts] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [wishList, setWishList] = useState([]);
  const [compareItem, setCompareItem] = useState([]);
  const [quickViewItem, setQuickViewItem] = useState({
    ProductID: 1,
    ProductName: "Loading...",
    Price: "0.00",
  });
  const [quickAddItem, setQuickAddItem] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [freeShipping, setFreeShipping] = useState(false);
  useEffect(() => {
    console.log("Cart products changed:", cartProducts);
    const subtotal = cartProducts.reduce((accumulator, product) => {
      const basePrice = parseFloat(product.Price || 0);
      const quantity = parseInt(product.quantity || 1);

      // Calculate add-on prices
      let addOnPrice = 0;

      // Add grease price if selected
      if (product.selectedGrease && product.selectedGrease.GreasePrice) {
        addOnPrice += parseFloat(product.selectedGrease.GreasePrice || 0);
      }

      // Add angle finder price if selected
      if (
        product.selectedAnglefinder &&
        product.selectedAnglefinder.AnglePrice
      ) {
        addOnPrice += parseFloat(product.selectedAnglefinder.AnglePrice || 0);
      }

      // Add hardware price if selected
      if (product.selectedHardware && product.selectedHardware.HardwarePrice) {
        addOnPrice += parseFloat(product.selectedHardware.HardwarePrice || 0);
      }

      // Add hardware pack add-ons (products with hardwarepack=1)
      if (
        product.selectedHardwarePacks &&
        Array.isArray(product.selectedHardwarePacks) &&
        product.selectedHardwarePacks.length > 0
      ) {
        product.selectedHardwarePacks.forEach((pack) => {
          addOnPrice += parseFloat(pack.Price || 0);
        });
      }

      const totalItemPrice = (basePrice + addOnPrice) * quantity;

      console.log(
        `Product ${product.ProductID}: basePrice=${basePrice}, addOnPrice=${addOnPrice}, quantity=${quantity}, totalItemPrice=${totalItemPrice}`,
      );

      return accumulator + totalItemPrice;
    }, 0);
    console.log("Calculated subtotal:", subtotal);
    setTotalPrice(subtotal);
  }, [cartProducts]);

  const MAX_CART_QTY = 10;
  const addProductToCart = async (productId, qty = 1, options = {}) => {
    const cappedQty = Math.min(
      MAX_CART_QTY,
      Math.max(1, parseInt(qty, 10) || 1),
    );
    console.log("addProductToCart called with:", { productId, qty, options });

    try {
      // Fetch product data from API
      const response = await fetch(`/api/product-by-id?id=${productId}`);
      if (response.ok) {
        const productData = await response.json();
        console.log("Product data from API:", productData);

        // Single-color product: use defaultColorName when no color was selected (e.g. add from card)
        const selectedColor =
          options.selectedColor ||
          (productData.product.defaultColorName
            ? { ColorName: productData.product.defaultColorName }
            : null);

        const selectedHardwarePacks = options.selectedHardwarePacks || [];
        const newItem = {
          ...productData.product,
          quantity: cappedQty,
          selectedColor,
          selectedGrease: options.selectedGrease || null,
          selectedAnglefinder: options.selectedAnglefinder || null,
          selectedHardware: options.selectedHardware || null,
          selectedHardwarePacks,
        };

        // Stable comparison for hardware packs (same ProductIDs in same order)
        const hardwarePacksSignature = (packs) =>
          Array.isArray(packs)
            ? JSON.stringify(
                packs.map((p) => p.ProductID).sort((a, b) => a - b),
              )
            : "[]";

        // Check if exact same product with same options already exists
        const existingItemIndex = cartProducts.findIndex((item) => {
          return (
            item.ProductID === productId &&
            JSON.stringify(item.selectedColor) ===
              JSON.stringify(newItem.selectedColor) &&
            JSON.stringify(item.selectedGrease) ===
              JSON.stringify(newItem.selectedGrease) &&
            JSON.stringify(item.selectedAnglefinder) ===
              JSON.stringify(newItem.selectedAnglefinder) &&
            JSON.stringify(item.selectedHardware) ===
              JSON.stringify(newItem.selectedHardware) &&
            hardwarePacksSignature(item.selectedHardwarePacks) ===
              hardwarePacksSignature(newItem.selectedHardwarePacks)
          );
        });

        if (existingItemIndex !== -1) {
          // Same product with same options - increase quantity (cap at MAX_CART_QTY)
          const updatedCart = [...cartProducts];
          updatedCart[existingItemIndex].quantity = Math.min(
            MAX_CART_QTY,
            updatedCart[existingItemIndex].quantity + cappedQty,
          );
          setCartProducts(updatedCart);
          console.log("Increased quantity of existing item");
          showToast(
            `${productData.product.ProductName} quantity updated in cart`,
            "success",
          );
        } else {
          // Different product or different options - add as new item
          setCartProducts((pre) => [...pre, newItem]);
          console.log("Added new item to cart");
          showToast(
            `${productData.product.ProductName} added to cart`,
            "success",
          );
        }

        openCartModal();
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };
  const isAddedToCartProducts = (productId, options = {}) => {
    const optsPacks = options.selectedHardwarePacks || [];
    const packsSig = (packs) =>
      Array.isArray(packs)
        ? JSON.stringify(packs.map((p) => p.ProductID).sort((a, b) => a - b))
        : "[]";
    const existingItem = cartProducts.find((item) => {
      return (
        item.ProductID === productId &&
        JSON.stringify(item.selectedColor) ===
          JSON.stringify(options.selectedColor || null) &&
        JSON.stringify(item.selectedGrease) ===
          JSON.stringify(options.selectedGrease || null) &&
        JSON.stringify(item.selectedAnglefinder) ===
          JSON.stringify(options.selectedAnglefinder || null) &&
        JSON.stringify(item.selectedHardware) ===
          JSON.stringify(options.selectedHardware || null) &&
        packsSig(item.selectedHardwarePacks) === packsSig(optsPacks)
      );
    });

    return existingItem ? true : false;
  };

  const clearCart = () => {
    setCartProducts([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setFreeShipping(false);
    localStorage.removeItem("cartList");
    localStorage.removeItem("appliedCoupon");
    localStorage.removeItem("couponDiscount");
    localStorage.removeItem("freeShipping");
  };

  const applyCoupon = async (couponCode, shippingAddress = null) => {
    try {
      const response = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode,
          cartItems: cartProducts,
          shippingAddress: shippingAddress || undefined,
        }),
      });

      const result = await response.json();

      console.log("Coupon validation result:", result);
      console.log("Discount amount:", result.coupon?.discountAmount);
      console.log("Discount value:", result.coupon?.discountValue);
      console.log("Discount type:", result.coupon?.discountType);

      if (result.valid) {
        const discountAmount = result.coupon.discountAmount || 0;
        console.log("Setting coupon discount to:", discountAmount);
        console.log("Full coupon result:", result.coupon);

        setAppliedCoupon(result.coupon);
        setCouponDiscount(discountAmount);
        setFreeShipping(result.coupon.freeShipping);

        // Persist coupon to localStorage
        try {
          localStorage.setItem("appliedCoupon", JSON.stringify(result.coupon));
          localStorage.setItem("couponDiscount", discountAmount.toString());
          localStorage.setItem(
            "freeShipping",
            result.coupon.freeShipping.toString(),
          );
          console.log("Coupon saved to localStorage");
        } catch (error) {
          console.error("Error saving coupon to localStorage:", error);
        }

        return { success: true, coupon: result.coupon };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      return { success: false, message: "Error applying coupon" };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setFreeShipping(false);

    // Remove coupon from localStorage
    localStorage.removeItem("appliedCoupon");
    localStorage.removeItem("couponDiscount");
    localStorage.removeItem("freeShipping");
  };

  const addToWishlist = (id) => {
    if (!wishList.includes(id)) {
      setWishList((pre) => [...pre, id]);
    } else {
      setWishList((pre) => [...pre].filter((elm) => elm != id));
    }
  };
  const removeFromWishlist = (id) => {
    if (wishList.includes(id)) {
      setWishList((pre) => [...pre.filter((elm) => elm != id)]);
    }
  };
  const addToCompareItem = (id) => {
    if (!compareItem.includes(id)) {
      setCompareItem((pre) => [...pre, id]);
    }
  };
  const removeFromCompareItem = (id) => {
    if (compareItem.includes(id)) {
      setCompareItem((pre) => [...pre.filter((elm) => elm != id)]);
    }
  };
  const isAddedtoWishlist = (id) => {
    if (wishList.includes(id)) {
      return true;
    }
    return false;
  };
  const isAddedtoCompareItem = (id) => {
    if (compareItem.includes(id)) {
      return true;
    }
    return false;
  };
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cartList"));
    console.log("Loading cart from localStorage:", items);
    if (items?.length) {
      // Keep items that have ProductID and ProductName (allow missing Price so we can re-hydrate after login)
      const validItems = items
        .filter((item) => item && item.ProductID && item.ProductName)
        .map((item) => ({
          ...item,
          quantity: Math.min(
            MAX_CART_QTY,
            Math.max(1, parseInt(item.quantity, 10) || 1),
          ),
        }));
      console.log("Valid items from localStorage:", validItems);
      setCartProducts(validItems);
    }

    // Restore coupon from localStorage
    const savedCoupon = localStorage.getItem("appliedCoupon");
    const savedDiscount = localStorage.getItem("couponDiscount");
    const savedFreeShipping = localStorage.getItem("freeShipping");

    if (savedCoupon) {
      try {
        const coupon = JSON.parse(savedCoupon);
        const discount = parseFloat(savedDiscount || 0);
        const freeShip = savedFreeShipping === "true";

        console.log("Restoring coupon from localStorage:", coupon);
        console.log("Restored discount amount:", discount);

        // Set the coupon - it will be re-validated when cartProducts loads
        setAppliedCoupon(coupon);
        setCouponDiscount(discount);
        setFreeShipping(freeShip);
      } catch (error) {
        console.error("Error restoring coupon from localStorage:", error);
        localStorage.removeItem("appliedCoupon");
        localStorage.removeItem("couponDiscount");
        localStorage.removeItem("freeShipping");
      }
    }

    setCartLoading(false);
  }, []);

  // Re-hydrate cart line prices after load (fixes $0 display when cart was saved as guest then user logs in)
  const hasRehydratedRef = useRef(false);
  useEffect(() => {
    if (cartLoading || cartProducts.length === 0) return;
    if (hasRehydratedRef.current) return;

    const hasMissingPrice = cartProducts.some(
      (item) =>
        item.Price == null || item.Price === "" || parseFloat(item.Price) === 0,
    );
    if (!hasMissingPrice) {
      hasRehydratedRef.current = true;
      return;
    }

    hasRehydratedRef.current = true;
    let cancelled = false;
    const itemsToRehydrate = [...cartProducts];
    const rehydrate = async () => {
      const next = [];
      for (const item of itemsToRehydrate) {
        if (cancelled) return;
        try {
          const res = await fetch(`/api/product-by-id?id=${item.ProductID}`);
          if (!res.ok) {
            next.push(item);
            continue;
          }
          const data = await res.json();
          const product = data?.product;
          if (!product) {
            next.push(item);
            continue;
          }
          next.push({
            ...item,
            Price: product.Price ?? item.Price,
            Retail: product.Retail ?? item.Retail,
            selectedGrease:
              item.selectedGrease && product.greaseOptions?.length
                ? product.greaseOptions.find(
                    (g) =>
                      String(g.GreaseID) ===
                      String(item.selectedGrease?.GreaseID),
                  ) || item.selectedGrease
                : item.selectedGrease,
            selectedAnglefinder:
              item.selectedAnglefinder && product.angleFinderOptions?.length
                ? product.angleFinderOptions.find(
                    (a) =>
                      String(a.AngleID) ===
                      String(item.selectedAnglefinder?.AngleID),
                  ) || item.selectedAnglefinder
                : item.selectedAnglefinder,
            selectedHardware:
              item.selectedHardware && product.hardwareOptions?.length
                ? product.hardwareOptions.find(
                    (h) =>
                      String(h.HardwareID) ===
                      String(item.selectedHardware?.HardwareID),
                  ) || item.selectedHardware
                : item.selectedHardware,
          });
        } catch {
          next.push(item);
        }
      }
      if (!cancelled) setCartProducts(next);
    };
    rehydrate();
    return () => {
      cancelled = true;
    };
  }, [cartLoading, cartProducts.length]);

  useEffect(() => {
    console.log("Saving cart to localStorage:", cartProducts);
    localStorage.setItem("cartList", JSON.stringify(cartProducts));

    // Also save to cookies for server-side access
    try {
      const cartData = JSON.stringify(cartProducts);
      document.cookie = `cartList=${encodeURIComponent(
        cartData,
      )}; path=/; max-age=86400`; // 24 hours
    } catch (error) {
      console.error("Error saving cart to cookies:", error);
    }
  }, [cartProducts]);
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("wishlist"));
    if (items?.length) {
      setWishList(items);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishList));
  }, [wishList]);

  // Re-validate coupon when cart products change (but not on initial load)
  useEffect(() => {
    if (cartLoading || !appliedCoupon?.code || cartProducts.length === 0) {
      return;
    }

    const revalidateCoupon = async () => {
      console.log(
        "Re-validating coupon after cart change:",
        appliedCoupon.code,
      );
      console.log("Current cart products:", cartProducts);
      try {
        const result = await applyCoupon(appliedCoupon.code);
        console.log("Re-validation result:", result);
        if (!result.success) {
          console.log("Coupon no longer valid, removing:", result.message);
          removeCoupon();
        } else {
          console.log(
            "Coupon re-validated, new discount amount:",
            result.coupon.discountAmount,
          );
        }
      } catch (error) {
        console.error("Error re-validating coupon:", error);
      }
    };

    // Small delay to avoid re-validation on initial load and ensure cart is ready
    const timer = setTimeout(() => {
      revalidateCoupon();
    }, 1000);

    return () => clearTimeout(timer);
  }, [cartProducts, cartLoading]);

  const contextElement = {
    cartProducts,
    setCartProducts,
    cartLoading,
    totalPrice,
    addProductToCart,
    isAddedToCartProducts,
    clearCart,
    removeFromWishlist,
    addToWishlist,
    isAddedtoWishlist,
    quickViewItem,
    wishList,
    setQuickViewItem,
    quickAddItem,
    setQuickAddItem,
    addToCompareItem,
    isAddedtoCompareItem,
    removeFromCompareItem,
    compareItem,
    setCompareItem,
    appliedCoupon,
    couponDiscount,
    freeShipping,
    applyCoupon,
    removeCoupon,
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
