// Simple test script to verify Google Maps API key
const testAddress = {
  address1: "123 Main St",
  city: "New York",
  state: "NY",
  zip: "10001",
};

async function testGoogleAPI() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  console.log("🔑 API Key Status:", apiKey ? "✅ Found" : "❌ Missing");
  console.log(
    "🔑 API Key Preview:",
    apiKey ? `${apiKey.substring(0, 10)}...` : "Not set"
  );

  if (!apiKey) {
    console.log("❌ Please add GOOGLE_MAPS_API_KEY to your .env.local file");
    return;
  }

  try {
    console.log("🧪 Testing Google Address Validation API...");

    const response = await fetch(
      `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: {
            addressLines: [testAddress.address1],
            locality: testAddress.city,
            administrativeArea: testAddress.state,
            postalCode: testAddress.zip,
            regionCode: "US",
          },
        }),
      }
    );

    console.log("📊 Response Status:", response.status);
    console.log("📊 Response OK:", response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API Test Successful!");
      console.log(
        "📋 Validation Result:",
        data.result?.verdict?.inputGranularity
      );
    } else {
      const errorText = await response.text();
      console.log("❌ API Test Failed!");
      console.log("📋 Error Response:", errorText);

      if (response.status === 403) {
        console.log("\n🔧 Troubleshooting 403 Error:");
        console.log("1. Check if billing is enabled in Google Cloud Console");
        console.log("2. Verify Address Validation API is enabled");
        console.log("3. Check API key restrictions");
        console.log("4. Ensure payment method is valid");
      }
    }
  } catch (error) {
    console.log("❌ Network Error:", error.message);
  }
}

testGoogleAPI();
