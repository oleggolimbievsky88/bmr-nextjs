import { cookies } from "next/headers";

export default function ServerCartCount() {
  const cookieStore = cookies();
  const cartCookie = cookieStore.get("cartList");

  let cartCount = 0;
  try {
    if (cartCookie) {
      const cartData = decodeURIComponent(cartCookie.value);
      const cartProducts = JSON.parse(cartData);
      cartCount = Array.isArray(cartProducts) ? cartProducts.length : 0;
    }
  } catch (error) {
    console.error("Error parsing cart cookie:", error);
    cartCount = 0;
  }

  return <span>{cartCount} ITEMS</span>;
}
