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
  const [wishList, setWishList] = useState([]);
  const [compareItem, setCompareItem] = useState([]);
  const [quickViewItem, setQuickViewItem] = useState({
    ProductID: 1,
    ProductName: "Loading...",
    Price: "0.00",
  });
  const [quickAddItem, setQuickAddItem] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  useEffect(() => {
    const subtotal = cartProducts.reduce((accumulator, product) => {
      const price = parseFloat(product.Price || product.price || 0);
      const quantity = parseInt(product.quantity || 1);
      return accumulator + quantity * price;
    }, 0);
    setTotalPrice(subtotal);
  }, [cartProducts]);

  const addProductToCart = async (productId, qty = 1, options = {}) => {
    if (!cartProducts.filter((elm) => elm.ProductID == productId)[0]) {
      try {
        // Fetch product data from API
        const response = await fetch(`/api/product-by-id?id=${productId}`);
        if (response.ok) {
          const productData = await response.json();
          const item = {
            ...productData.product,
            quantity: qty,
            selectedColor: options.selectedColor || null,
            selectedGrease: options.selectedGrease || null,
            selectedAnglefinder: options.selectedAnglefinder || null,
            selectedHardware: options.selectedHardware || null,
          };
          setCartProducts((pre) => [...pre, item]);
          openCartModal();
        }
      } catch (error) {
        console.error("Error adding product to cart:", error);
      }
    }
  };
  const isAddedToCartProducts = (productId) => {
    if (cartProducts.filter((elm) => elm.ProductID == productId)[0]) {
      return true;
    }
    return false;
  };

  const clearCart = () => {
    setCartProducts([]);
    localStorage.removeItem("cartList");
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
    if (items?.length) {
      // Filter out any invalid items and ensure proper structure
      const validItems = items.filter(
        (item) =>
          item &&
          item.ProductID &&
          item.ProductName &&
          (item.Price || item.price)
      );
      setCartProducts(validItems);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartList", JSON.stringify(cartProducts));
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
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
