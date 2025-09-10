// Utility functions for cart storage (both localStorage and cookies)

export const saveCartToStorage = (cartProducts) => {
  try {
    // Save to localStorage (for client-side access)
    localStorage.setItem("cartList", JSON.stringify(cartProducts));

    // Also save to cookies (for server-side access)
    const cartData = JSON.stringify(cartProducts);
    document.cookie = `cartList=${encodeURIComponent(
      cartData
    )}; path=/; max-age=86400`; // 24 hours
  } catch (error) {
    console.error("Error saving cart to storage:", error);
  }
};

export const loadCartFromStorage = () => {
  try {
    // Try localStorage first (client-side)
    if (typeof window !== "undefined") {
      const cartData = localStorage.getItem("cartList");
      if (cartData) {
        return JSON.parse(cartData);
      }
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }

  return [];
};

export const getCartFromCookie = (cookieString) => {
  try {
    if (!cookieString) return [];

    const cartCookie = cookieString
      .split(";")
      .find((cookie) => cookie.trim().startsWith("cartList="));

    if (cartCookie) {
      const cartData = decodeURIComponent(cartCookie.split("=")[1]);
      return JSON.parse(cartData);
    }
  } catch (error) {
    console.error("Error parsing cart cookie:", error);
  }

  return [];
};
