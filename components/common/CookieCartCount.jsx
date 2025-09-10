"use client";
import { useEffect, useState } from "react";

export default function CookieCartCount() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Function to get cart count from localStorage
    const getCartCount = () => {
      try {
        const cartData = localStorage.getItem("cartList");
        if (cartData) {
          const cartItems = JSON.parse(cartData);
          return Array.isArray(cartItems) ? cartItems.length : 0;
        }
      } catch (error) {
        console.error("Error reading cart from localStorage:", error);
      }
      return 0;
    };

    // Set initial count
    setCartCount(getCartCount());

    // Listen for storage changes (when cart is updated in other tabs)
    const handleStorageChange = () => {
      setCartCount(getCartCount());
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom cart update events
    const handleCartUpdate = () => {
      setCartCount(getCartCount());
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  return <span>{cartCount} ITEMS</span>;
}
