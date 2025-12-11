import { NextResponse } from "next/server";
import { getCountryCode } from "@/lib/countryCodes";

export async function POST(request) {
  try {
    const { fromAddress, toAddress, packages } = await request.json();

    // UPS API credentials - Client Credentials flow only needs Client ID and Client Secret
    const upsClientId = process.env.UPS_CLIENT_ID || process.env.UPS_ACCESS_KEY;
    const upsClientSecret =
      process.env.UPS_CLIENT_SECRET || process.env.UPS_PASSWORD;
    const upsAccountNumber = process.env.UPS_ACCOUNT_NUMBER;

    if (!upsClientId || !upsClientSecret) {
      console.error("Missing UPS credentials:", {
        hasClientId: !!upsClientId,
        hasClientSecret: !!upsClientSecret,
      });
      return NextResponse.json(
        { error: "UPS API credentials not configured" },
        { status: 500 }
      );
    }

    console.log("UPS OAuth request with credentials:", {
      clientId: upsClientId,
      clientSecretLength: upsClientSecret?.length,
      clientIdPreview: upsClientId?.substring(0, 10) + "...",
      clientSecretPreview: upsClientSecret?.substring(0, 10) + "...",
    });

    // Calculate total weight and dimensions
    const totalWeight = packages.reduce(
      (sum, pkg) => sum + (pkg.weight || 1),
      0
    );
    const maxLength = Math.max(...packages.map((pkg) => pkg.length || 10));
    const maxWidth = Math.max(...packages.map((pkg) => pkg.width || 10));
    const maxHeight = packages.reduce(
      (sum, pkg) => sum + (pkg.height || 10),
      0
    );

    // Get country codes - ensure we have valid codes
    const toCountryCode = toAddress.country || "US";
    const fromCountryCode = fromAddress.country || "US";

    // Build ShipTo address - handle international addresses
    const shipToAddress = {
      AddressLine: [toAddress.address1],
      City: toAddress.city,
      PostalCode: toAddress.zip,
      CountryCode: toCountryCode,
    };

    // State/Province is required for US/CA, optional for others
    if (toAddress.state && (toCountryCode === "US" || toCountryCode === "CA")) {
      shipToAddress.StateProvinceCode = toAddress.state;
    } else if (toAddress.state) {
      // For international, include as part of address if provided
      shipToAddress.StateProvinceCode = toAddress.state;
    }

    // Build ShipFrom address
    const shipFromAddress = {
      AddressLine: [fromAddress.address1],
      City: fromAddress.city,
      StateProvinceCode: fromAddress.state,
      PostalCode: fromAddress.zip,
      CountryCode: fromCountryCode,
    };

    // Determine service code based on destination
    // For international, use Worldwide Expedited or Standard
    let serviceCode = "03"; // Ground (domestic US)
    let serviceDescription = "UPS Ground";

    if (toCountryCode !== "US") {
      // International shipping - use Worldwide Expedited
      serviceCode = "08"; // Worldwide Expedited
      serviceDescription = "UPS Worldwide Expedited";
    } else if (toCountryCode === "US" && fromCountryCode === "US") {
      // Domestic US
      serviceCode = "03"; // Ground
      serviceDescription = "UPS Ground";
    }

    // UPS Rate API request
    const rateRequest = {
      RateRequest: {
        Request: {
          RequestOption: "Rate",
          TransactionReference: {
            CustomerContext: "BMR Suspension Rate Request",
          },
        },
        Shipment: {
          Shipper: {
            Name: "BMR Suspension",
            ShipperNumber: upsAccountNumber,
            Address: {
              AddressLine: [fromAddress.address1],
              City: fromAddress.city,
              StateProvinceCode: fromAddress.state,
              PostalCode: fromAddress.zip,
              CountryCode: fromCountryCode,
            },
          },
          ShipTo: {
            Name:
              `${toAddress.firstName || ""} ${
                toAddress.lastName || ""
              }`.trim() || "Customer",
            Address: shipToAddress,
          },
          ShipFrom: {
            Name: "BMR Suspension",
            Address: shipFromAddress,
          },
          Service: {
            Code: serviceCode,
            Description: serviceDescription,
          },
          Package: {
            PackagingType: {
              Code: "02", // Customer Supplied Package
              Description: "Package",
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: "IN",
                Description: "Inches",
              },
              Length: maxLength.toString(),
              Width: maxWidth.toString(),
              Height: maxHeight.toString(),
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: "LBS",
                Description: "Pounds",
              },
              Weight: totalWeight.toString(),
            },
          },
        },
      },
    };

    // Determine if we're in test mode
    const isTestMode =
      process.env.NODE_ENV === "development" ||
      process.env.UPS_TEST_MODE === "true";
    const baseUrl = isTestMode
      ? "https://wwwcie.ups.com"
      : "https://onlinetools.ups.com";

    console.log(
      `Using UPS ${isTestMode ? "TEST" : "PRODUCTION"} environment: ${baseUrl}`
    );

    // Get OAuth token using Client Credentials flow
    const basicAuth = Buffer.from(`${upsClientId}:${upsClientSecret}`).toString(
      "base64"
    );

    console.log("Basic Auth header:", {
      credentials: `${upsClientId}:${upsClientSecret}`,
      basicAuth: basicAuth,
      basicAuthPreview: basicAuth.substring(0, 20) + "...",
    });

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

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("UPS OAuth error details:", errorText);
      throw new Error(
        `UPS OAuth error: ${tokenResponse.status} - ${errorText}`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Make rate request
    const rateResponse = await fetch(`${baseUrl}/api/rating/v1/Rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        transId: "BMR-Rate-" + Date.now(),
        transactionSrc: "BMR Suspension",
      },
      body: JSON.stringify(rateRequest),
    });

    if (!rateResponse.ok) {
      const errorText = await rateResponse.text();
      console.error("UPS Rate API error:", errorText);
      throw new Error(`UPS Rate API error: ${rateResponse.status}`);
    }

    const rateData = await rateResponse.json();

    // Extract shipping options
    const shippingOptions = [];

    if (rateData.RateResponse?.RatedShipment) {
      const shipment = rateData.RateResponse.RatedShipment;
      const serviceName =
        shipment.Service?.Code === "08"
          ? "UPS Worldwide Expedited"
          : shipment.Service?.Code === "03"
          ? "UPS Ground"
          : shipment.Service?.Description || "UPS Shipping";

      shippingOptions.push({
        service: serviceName,
        code: shipment.Service?.Code || serviceCode,
        cost: parseFloat(shipment.TotalCharges?.MonetaryValue || "0"),
        currency: shipment.TotalCharges?.CurrencyCode || "USD",
        deliveryDays:
          shipment.GuaranteedDeliveryTime ||
          shipment.ScheduledDeliveryTime ||
          "5-10 business days",
        description:
          toCountryCode !== "US"
            ? "International shipping"
            : "Standard ground shipping",
      });
    }

    // Add free shipping option for BMR products (only for domestic US)
    if (toCountryCode === "US") {
      shippingOptions.unshift({
        service: "FREE SHIPPING",
        code: "FREE",
        cost: 0,
        currency: "USD",
        deliveryDays: "1-5 business days",
        description: "Free shipping on all BMR products",
      });
    }

    return NextResponse.json({
      success: true,
      shippingOptions,
      fromAddress,
      toAddress,
      packageInfo: {
        weight: totalWeight,
        dimensions: {
          length: maxLength,
          width: maxWidth,
          height: maxHeight,
        },
      },
    });
  } catch (error) {
    console.error("UPS shipping rates error:", error);

    // Fallback to free shipping if UPS API fails
    return NextResponse.json({
      success: true,
      shippingOptions: [
        {
          service: "FREE SHIPPING",
          code: "FREE",
          cost: 0,
          currency: "USD",
          deliveryDays: "1-5 business days",
          description: "Free shipping on all BMR products",
        },
      ],
      error: "Using fallback shipping rates",
    });
  }
}
