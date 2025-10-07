// Test script for UPS Shipping Rates API
import "dotenv/config";

const testData = {
  fromAddress: {
    address1: "1234 Main St",
    city: "Lakeland",
    state: "FL",
    zip: "33801",
  },
  toAddress: {
    firstName: "John",
    lastName: "Doe",
    address1: "456 Oak Avenue",
    city: "Los Angeles",
    state: "CA",
    zip: "90001",
  },
  packages: [
    {
      weight: 10,
      length: 12,
      width: 8,
      height: 6,
    },
  ],
};

async function testUPSAPI() {
  console.log("🚀 Testing UPS Shipping Rates API...\n");

  // Check environment variables
  console.log("📋 Environment Check:");
  console.log(
    "  UPS_USERNAME:",
    process.env.UPS_USERNAME ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "  UPS_PASSWORD:",
    process.env.UPS_PASSWORD ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "  UPS_ACCESS_KEY:",
    process.env.UPS_ACCESS_KEY ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "  UPS_ACCOUNT_NUMBER:",
    process.env.UPS_ACCOUNT_NUMBER ? "✅ Set" : "❌ Missing"
  );
  console.log("  NODE_ENV:", process.env.NODE_ENV || "development");
  console.log("");

  try {
    const response = await fetch(
      "http://localhost:3000/api/ups-shipping-rates",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      }
    );

    const data = await response.json();

    console.log("📦 API Response:");
    console.log("  Status:", response.status);
    console.log("  Success:", data.success ? "✅" : "❌");
    console.log("");

    if (data.shippingOptions) {
      console.log("🚚 Shipping Options:");
      data.shippingOptions.forEach((option, index) => {
        console.log(`  ${index + 1}. ${option.service}`);
        console.log(`     Code: ${option.code}`);
        console.log(`     Cost: $${option.cost} ${option.currency}`);
        console.log(`     Delivery: ${option.deliveryDays}`);
        console.log(`     Description: ${option.description}`);
        console.log("");
      });
    }

    if (data.packageInfo) {
      console.log("📦 Package Info:");
      console.log("  Weight:", data.packageInfo.weight, "lbs");
      console.log("  Dimensions:");
      console.log("    Length:", data.packageInfo.dimensions.length, "in");
      console.log("    Width:", data.packageInfo.dimensions.width, "in");
      console.log("    Height:", data.packageInfo.dimensions.height, "in");
      console.log("");
    }

    if (data.error) {
      console.log("⚠️  Warning:", data.error);
      console.log("");
    }

    // Test with different destinations
    console.log("🌎 Testing different destinations...\n");

    const destinations = [
      { city: "New York", state: "NY", zip: "10001" },
      { city: "Chicago", state: "IL", zip: "60601" },
      { city: "Miami", state: "FL", zip: "33101" },
    ];

    for (const dest of destinations) {
      const testRequest = {
        ...testData,
        toAddress: {
          ...testData.toAddress,
          city: dest.city,
          state: dest.state,
          zip: dest.zip,
        },
      };

      const destResponse = await fetch(
        "http://localhost:3000/api/ups-shipping-rates",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testRequest),
        }
      );

      const destData = await destResponse.json();

      console.log(`  📍 ${dest.city}, ${dest.state}:`);
      if (destData.shippingOptions?.[0]) {
        console.log(
          `     ${destData.shippingOptions[0].service}: $${destData.shippingOptions[0].cost}`
        );
      }
    }

    console.log("\n✅ Test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Run the test
testUPSAPI();
