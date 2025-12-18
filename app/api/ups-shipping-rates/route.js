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

    // Define service codes to request based on destination
    // For domestic US, request common services
    // For international, request worldwide services
    let serviceCodesToRequest = [];

    if (toCountryCode === "US" && fromCountryCode === "US") {
      // Domestic US services
      serviceCodesToRequest = [
        { code: "03", name: "UPS Ground" },
        { code: "02", name: "UPS 2nd Day Air" },
        { code: "01", name: "UPS Next Day Air" },
        { code: "13", name: "UPS Next Day Air Saver" },
        { code: "12", name: "UPS 3 Day Select" },
        { code: "59", name: "UPS 2nd Day Air AM" },
      ];
    } else {
      // International services
      serviceCodesToRequest = [
        { code: "08", name: "UPS Worldwide Expedited" },
        { code: "11", name: "UPS Standard" },
        { code: "65", name: "UPS Saver" },
        { code: "07", name: "UPS Worldwide Express" },
        { code: "54", name: "UPS Worldwide Express Plus" },
      ];
    }

    // Base shipment structure
    const baseShipment = {
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

    // Make multiple rate requests for different services
    const ratePromises = serviceCodesToRequest.map(async (serviceInfo) => {
      const rateRequest = {
        RateRequest: {
          Request: {
            RequestOption: "Rate",
            TransactionReference: {
              CustomerContext: `BMR Suspension Rate Request - ${serviceInfo.code}`,
            },
          },
          Shipment: {
            ...baseShipment,
            Service: {
              Code: serviceInfo.code,
              Description: serviceInfo.name,
            },
          },
        },
      };

      try {
        const rateResponse = await fetch(`${baseUrl}/api/rating/v1/Rate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            transId: `BMR-Rate-${serviceInfo.code}-${Date.now()}`,
            transactionSrc: "BMR Suspension",
          },
          body: JSON.stringify(rateRequest),
        });

        if (rateResponse.ok) {
          const rateData = await rateResponse.json();
          return rateData;
        } else {
          // Log but don't fail - some services may not be available
          const errorText = await rateResponse.text();
          console.log(
            `UPS Rate API error for service ${serviceInfo.code}:`,
            errorText
          );
          return null;
        }
      } catch (error) {
        console.log(`Error fetching rate for service ${serviceInfo.code}:`, error);
        return null;
      }
    });

    // Wait for all requests to complete
    const rateResults = await Promise.all(ratePromises);

    // Combine all successful rate responses
    const allShipments = [];
    rateResults.forEach((rateData) => {
      if (rateData?.RateResponse?.RatedShipment) {
        const shipment = rateData.RateResponse.RatedShipment;
        if (Array.isArray(shipment)) {
          allShipments.push(...shipment);
        } else {
          allShipments.push(shipment);
        }
      }
    });

    // Extract shipping options - Shop option returns RatedShipment array
    const shippingOptions = [];

    // Service code mapping for better display names
    const serviceCodeMap = {
      "01": "UPS Next Day Air",
      "02": "UPS 2nd Day Air",
      "03": "UPS Ground",
      "12": "UPS 3 Day Select",
      "13": "UPS Next Day Air Saver",
      "14": "UPS Next Day Air Early AM",
      "15": "UPS Next Day Air Early AM (Commercial)",
      "16": "UPS Next Day Air Early AM (Residential)",
      "17": "UPS Worldwide Express",
      "18": "UPS Worldwide Express Plus",
      "20": "UPS Worldwide Express (Commercial)",
      "21": "UPS Worldwide Express Plus (Commercial)",
      "32": "UPS Next Day Air (Commercial)",
      "33": "UPS 2nd Day Air (Commercial)",
      "59": "UPS 2nd Day Air AM",
      "65": "UPS Saver",
      "66": "UPS Worldwide Express (Residential)",
      "68": "UPS Worldwide Express Plus (Residential)",
      "70": "UPS Access Point Economy",
      "71": "UPS Worldwide Expedited",
      "72": "UPS Worldwide Saver",
      "74": "UPS Express 12:00",
      "82": "UPS Today Standard",
      "83": "UPS Today Dedicated Courier",
      "84": "UPS Today Intercity",
      "85": "UPS Today Express",
      "86": "UPS Today Express Saver",
      "96": "UPS Worldwide Express Freight",
      "08": "UPS Worldwide Expedited",
    };

    // Process all shipments from multiple service requests
    allShipments.forEach((shipment) => {
      const serviceCode = shipment.Service?.Code || "";
      const serviceName =
        serviceCodeMap[serviceCode] ||
        shipment.Service?.Description ||
        "UPS Shipping";

      // Skip if no cost information
      const cost = parseFloat(shipment.TotalCharges?.MonetaryValue || "0");
      if (isNaN(cost)) return;

      // Determine delivery time estimate
      let deliveryDays = "5-10 business days";
      if (shipment.GuaranteedDeliveryTime) {
        deliveryDays = shipment.GuaranteedDeliveryTime;
      } else if (shipment.ScheduledDeliveryTime) {
        deliveryDays = shipment.ScheduledDeliveryTime;
      } else {
        // Estimate based on service code
        if (serviceCode === "01" || serviceCode === "13" || serviceCode === "14") {
          deliveryDays = "1 business day";
        } else if (serviceCode === "02" || serviceCode === "59") {
          deliveryDays = "2 business days";
        } else if (serviceCode === "12") {
          deliveryDays = "3 business days";
        } else if (serviceCode === "03") {
          deliveryDays = "1-5 business days";
        } else if (serviceCode === "08" || serviceCode === "71") {
          deliveryDays = "2-5 business days";
        }
      }

      // Determine description
      let description = "";
      if (toCountryCode !== "US") {
        description = "International shipping";
      } else if (serviceCode === "01" || serviceCode === "13" || serviceCode === "14") {
        description = "Next business day delivery";
      } else if (serviceCode === "02" || serviceCode === "59") {
        description = "Second business day delivery";
      } else if (serviceCode === "03") {
        description = "Standard ground shipping";
      } else {
        description = shipment.Service?.Description || "Standard shipping";
      }

      shippingOptions.push({
        service: serviceName,
        code: serviceCode,
        cost: cost,
        currency: shipment.TotalCharges?.CurrencyCode || "USD",
        deliveryDays: deliveryDays,
        description: description,
      });
    });

    // Sort by cost (cheapest first)
    shippingOptions.sort((a, b) => a.cost - b.cost);

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
