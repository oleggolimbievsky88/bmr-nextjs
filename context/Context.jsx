"use client";
import { openCartModal } from "@/utlis/openCartModal";
//import { openCart } from "@/utlis/toggleCart";
import React, { useEffect } from "react";
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

      const totalItemPrice = (basePrice + addOnPrice) * quantity;

      console.log(
        `Product ${product.ProductID}: basePrice=${basePrice}, addOnPrice=${addOnPrice}, quantity=${quantity}, totalItemPrice=${totalItemPrice}`
      );

      return accumulator + totalItemPrice;
    }, 0);
    console.log("Calculated subtotal:", subtotal);
    setTotalPrice(subtotal);
  }, [cartProducts]);

  const addProductToCart = async (productId, qty = 1, options = {}) => {
    console.log("addProductToCart called with:", { productId, qty, options });

    try {
      // Fetch product data from API
      const response = await fetch(`/api/product-by-id?id=${productId}`);
      if (response.ok) {
        const productData = await response.json();
        console.log("Product data from API:", productData);

        const newItem = {
          ...productData.product,
          quantity: qty,
          selectedColor: options.selectedColor || null,
          selectedGrease: options.selectedGrease || null,
          selectedAnglefinder: options.selectedAnglefinder || null,
          selectedHardware: options.selectedHardware || null,
        };

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
              JSON.stringify(newItem.selectedHardware)
          );
        });

        if (existingItemIndex !== -1) {
          // Same product with same options - increase quantity
          const updatedCart = [...cartProducts];
          updatedCart[existingItemIndex].quantity += qty;
          setCartProducts(updatedCart);
          console.log("Increased quantity of existing item");
        } else {
          // Different product or different options - add as new item
          setCartProducts((pre) => [...pre, newItem]);
          console.log("Added new item to cart");
        }

        openCartModal();
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };
  const isAddedToCartProducts = (productId, options = {}) => {
    // Check if exact same product with same options already exists
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
          JSON.stringify(options.selectedHardware || null)
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
  };

  const applyCoupon = async (couponCode) => {
    try {
      const response = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode,
          cartItems: cartProducts,
        }),
      });

      const result = await response.json();

      if (result.valid) {
        setAppliedCoupon(result.coupon);
        setCouponDiscount(result.coupon.discountAmount);
        setFreeShipping(result.coupon.freeShipping);
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
      // Filter out any invalid items and ensure proper structure
      const validItems = items.filter(
        (item) => item && item.ProductID && item.ProductName && item.Price
      );
      console.log("Valid items from localStorage:", validItems);
      setCartProducts(validItems);
    }
    setCartLoading(false);
  }, []);

  useEffect(() => {
    console.log("Saving cart to localStorage:", cartProducts);
    localStorage.setItem("cartList", JSON.stringify(cartProducts));

    // Also save to cookies for server-side access
    try {
      const cartData = JSON.stringify(cartProducts);
      document.cookie = `cartList=${encodeURIComponent(
        cartData
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
