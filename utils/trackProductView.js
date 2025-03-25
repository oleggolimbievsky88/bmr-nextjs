export async function trackProductView(productId) {
  try {
    const response = await fetch("/api/products/recently-viewed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });

    if (!response.ok) {
      throw new Error("Failed to track product view");
    }

    return true;
  } catch (error) {
    console.error("Error tracking product view:", error);
    return false;
  }
}
