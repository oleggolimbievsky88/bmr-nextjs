// Test script to verify coupon functionality
const testCoupon = async () => {
  const testCartItems = [
    {
      ProductID: 1,
      ProductName: "Test Product",
      Price: "100.00",
      quantity: 1,
    },
  ];

  try {
    const response = await fetch("http://localhost:3000/api/validate-coupon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        couponCode: "TEST15",
        cartItems: testCartItems,
      }),
    });

    const result = await response.json();
    console.log("Coupon validation result:", result);
  } catch (error) {
    console.error("Error testing coupon:", error);
  }
};

// Run the test
testCoupon();
