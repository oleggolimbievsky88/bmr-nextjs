// Direct UPS API Test
const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  });
}

async function testUPSDirect() {
  console.log("🚀 Direct UPS API Test\n");

  const upsUsername = process.env.UPS_USERNAME;
  const upsPassword = process.env.UPS_PASSWORD;
  const upsAccessKey = process.env.UPS_ACCESS_KEY;
  const upsAccountNumber = process.env.UPS_ACCOUNT_NUMBER;

  console.log("📋 Credentials Check:");
  console.log("  Username:", upsUsername || "❌ Missing");
  console.log(
    "  Password:",
    upsPassword ? "✅ Set (" + upsPassword.length + " chars)" : "❌ Missing"
  );
  console.log(
    "  Access Key:",
    upsAccessKey ? "✅ Set (" + upsAccessKey.length + " chars)" : "❌ Missing"
  );
  console.log("  Account Number:", upsAccountNumber || "❌ Missing");
  console.log("");

  if (!upsAccessKey || !upsPassword) {
    console.error("❌ Missing required credentials");
    return;
  }

  try {
    // Test OAuth Token
    const isTestMode =
      process.env.NODE_ENV === "development" ||
      process.env.UPS_TEST_MODE === "true";
    const baseUrl = isTestMode
      ? "https://wwwcie.ups.com"
      : "https://onlinetools.ups.com";

    console.log(`🌐 Using ${isTestMode ? "TEST" : "PRODUCTION"} environment`);
    console.log(`   Base URL: ${baseUrl}\n`);

    const basicAuth = Buffer.from(`${upsAccessKey}:${upsPassword}`).toString(
      "base64"
    );

    console.log("🔐 Step 1: Getting OAuth Token...");
    const tokenResponse = await fetch(`${baseUrl}/security/v1/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    });

    console.log("   Status:", tokenResponse.status, tokenResponse.statusText);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("   ❌ Error Response:", errorText);
      return;
    }

    const tokenData = await tokenResponse.json();
    console.log("   ✅ Token received!");
    console.log("   Token type:", tokenData.token_type);
    console.log("   Expires in:", tokenData.expires_in, "seconds");
    console.log("");

    // Test Rate Request
    console.log("📦 Step 2: Getting Shipping Rates...");

    const rateRequest = {
      RateRequest: {
        Request: {
          RequestOption: "Rate",
          TransactionReference: {
            CustomerContext: "BMR Test Rate Request",
          },
        },
        Shipment: {
          Shipper: {
            Name: "BMR Suspension",
            ShipperNumber: upsAccountNumber,
            Address: {
              AddressLine: ["1234 Main St"],
              City: "Lakeland",
              StateProvinceCode: "FL",
              PostalCode: "33801",
              CountryCode: "US",
            },
          },
          ShipTo: {
            Name: "John Doe",
            Address: {
              AddressLine: ["456 Oak Ave"],
              City: "Los Angeles",
              StateProvinceCode: "CA",
              PostalCode: "90001",
              CountryCode: "US",
            },
          },
          ShipFrom: {
            Name: "BMR Suspension",
            Address: {
              AddressLine: ["1234 Main St"],
              City: "Lakeland",
              StateProvinceCode: "FL",
              PostalCode: "33801",
              CountryCode: "US",
            },
          },
          Service: {
            Code: "03",
            Description: "UPS Ground",
          },
          Package: {
            PackagingType: {
              Code: "02",
              Description: "Package",
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: "IN",
                Description: "Inches",
              },
              Length: "12",
              Width: "8",
              Height: "6",
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: "LBS",
                Description: "Pounds",
              },
              Weight: "10",
            },
          },
        },
      },
    };

    const rateResponse = await fetch(`${baseUrl}/api/rating/v1/Rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
        transId: "BMR-Test-" + Date.now(),
        transactionSrc: "BMR Suspension",
      },
      body: JSON.stringify(rateRequest),
    });

    console.log("   Status:", rateResponse.status, rateResponse.statusText);

    if (!rateResponse.ok) {
      const errorText = await rateResponse.text();
      console.error("   ❌ Error Response:", errorText);
      return;
    }

    const rateData = await rateResponse.json();
    console.log("   ✅ Rate received!");
    console.log("");

    if (rateData.RateResponse?.RatedShipment) {
      const shipment = rateData.RateResponse.RatedShipment;
      console.log("💰 Shipping Cost:");
      console.log(
        "   Total:",
        shipment.TotalCharges?.MonetaryValue,
        shipment.TotalCharges?.CurrencyCode
      );
      console.log("   Service:", shipment.Service?.Code);
      if (shipment.GuaranteedDeliveryTime) {
        console.log("   Delivery:", shipment.GuaranteedDeliveryTime);
      }
    }

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

testUPSDirect();
