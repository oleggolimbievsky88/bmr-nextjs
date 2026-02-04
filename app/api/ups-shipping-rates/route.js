import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCountryCode } from "@/lib/countryCodes";
import { isLower48UsState } from "@/lib/shipping";
import { areAllProductsCouponEligible } from "@/lib/queries";

const DEALER_FLAT_RATE_LOWER48 = 14.95;

export async function POST(request) {
  let fromAddress, toAddress, packages, productIds;
  try {
    const body = await request.json();
    fromAddress = body.fromAddress;
    toAddress = body.toAddress;
    packages = body.packages;
    productIds = Array.isArray(body.productIds) ? body.productIds : [];
  } catch (parseErr) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    const dealerTier = parseInt(session?.user?.dealerTier ?? 0, 10);
    const isDealer = role === "dealer" || role === "admin";
    const toCountryForDealer = getCountryCode(toAddress?.country) || "US";
    const lower48 =
      toCountryForDealer === "US" && isLower48UsState(toAddress?.state);

    if (isDealer && dealerTier >= 1 && dealerTier <= 3 && lower48) {
      return NextResponse.json({
        success: true,
        shippingOptions: [
          {
            service: "Dealer Flat Rate (Lower 48)",
            code: "DEALER_FLAT",
            cost: DEALER_FLAT_RATE_LOWER48,
            currency: "USD",
            deliveryDays: "3–5 business days",
            description: "Flat rate for Tier 1 - 3 dealers in lower 48",
          },
        ],
      });
    }
    if (isDealer && dealerTier >= 4) {
      // Tier 3+ always pay full shipping; fall through to UPS rates below
    }
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

    // Each product is preboxed; we ship N boxes and charge N × (rate for one box).
    const packageCount = Math.max(1, packages.length);
    const singlePkg =
      packages.length > 0
        ? packages.reduce((a, b) => {
            const aw = a.weight || 1;
            const bw = b.weight || 1;
            return aw * (a.length || 10) * (a.height || 10) >=
              bw * (b.length || 10) * (b.height || 10)
              ? a
              : b;
          })
        : { weight: 1, length: 10, width: 10, height: 10 };
    const singleWeight = singlePkg.weight || 1;
    const singleLength = singlePkg.length || 10;
    const singleWidth = singlePkg.width || 10;
    const singleHeight = singlePkg.height || 10;

    // Get country codes - convert country names to ISO codes
    const toCountryCode = getCountryCode(toAddress.country) || "US";
    const fromCountryCode = getCountryCode(fromAddress.country) || "US";

    console.log("Country code conversion:", {
      originalTo: toAddress.country,
      convertedTo: toCountryCode,
      originalFrom: fromAddress.country,
      convertedFrom: fromCountryCode,
    });

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
          `${toAddress.firstName || ""} ${toAddress.lastName || ""}`.trim() ||
          "Customer",
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
          Length: singleLength.toString(),
          Width: singleWidth.toString(),
          Height: singleHeight.toString(),
        },
        PackageWeight: {
          UnitOfMeasurement: {
            Code: "LBS",
            Description: "Pounds",
          },
          Weight: singleWeight.toString(),
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
        console.log(
          `Error fetching rate for service ${serviceInfo.code}:`,
          error
        );
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
      "07": "UPS Worldwide Express",
      "08": "UPS Worldwide Expedited",
      11: "UPS Standard",
      12: "UPS 3 Day Select",
      13: "UPS Next Day Air Saver",
      14: "UPS Next Day Air Early AM",
      15: "UPS Next Day Air Early AM (Commercial)",
      16: "UPS Next Day Air Early AM (Residential)",
      17: "UPS Worldwide Express",
      18: "UPS Worldwide Express Plus",
      20: "UPS Worldwide Express (Commercial)",
      21: "UPS Worldwide Express Plus (Commercial)",
      32: "UPS Next Day Air (Commercial)",
      33: "UPS 2nd Day Air (Commercial)",
      59: "UPS 2nd Day Air AM",
      65: "UPS Saver",
      66: "UPS Worldwide Express (Residential)",
      68: "UPS Worldwide Express Plus (Residential)",
      70: "UPS Access Point Economy",
      71: "UPS Worldwide Expedited",
      72: "UPS Worldwide Saver",
      74: "UPS Express 12:00",
      82: "UPS Today Standard",
      83: "UPS Today Dedicated Courier",
      84: "UPS Today Intercity",
      85: "UPS Today Express",
      86: "UPS Today Express Saver",
      96: "UPS Worldwide Express Freight",
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
        if (
          serviceCode === "01" ||
          serviceCode === "13" ||
          serviceCode === "14"
        ) {
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
      if (toCountryCode === "CA") {
        description = "Shipping to Canada";
      } else if (toCountryCode !== "US") {
        description = "International shipping";
      } else if (
        serviceCode === "01" ||
        serviceCode === "13" ||
        serviceCode === "14"
      ) {
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
        cost: Math.round(cost * packageCount * 100) / 100,
        currency: shipment.TotalCharges?.CurrencyCode || "USD",
        deliveryDays: deliveryDays,
        description: description,
      });
    });

    // Sort by cost (cheapest first)
    shippingOptions.sort((a, b) => a.cost - b.cost);

    // Free shipping only for BMR products (not Low Margin, not Package) to lower 48 US
    const stateForShipping = (
      toAddress?.state ??
      toAddress?.stateProvince ??
      toAddress?.region ??
      ""
    )
      .toString()
      .trim();
    const allowFreeShipping =
      toCountryCode === "US" &&
      isLower48UsState(stateForShipping) &&
      (await areAllProductsCouponEligible(productIds));
    if (allowFreeShipping) {
      shippingOptions.unshift({
        service: "FREE SHIPPING",
        code: "FREE",
        cost: 0,
        currency: "USD",
        deliveryDays: "1-5 business days",
        description:
          "Free shipping on BMR products (excl. low margin & package) in lower 48 US",
      });
    }

    return NextResponse.json({
      success: true,
      shippingOptions,
      fromAddress,
      toAddress,
      packageInfo: {
        packageCount,
        weightPerPackage: singleWeight,
        dimensions: {
          length: singleLength,
          width: singleWidth,
          height: singleHeight,
        },
      },
    });
  } catch (error) {
    console.error("UPS shipping rates error:", error);

    // Fallback shipping options when UPS API fails
    // Free shipping only when BMR (not low margin/package) + lower 48 US
    let allowFreeShipping = false;
    const toCountryCode = getCountryCode(toAddress?.country) || "US";
    const stateForFallback = (
      toAddress?.state ??
      toAddress?.stateProvince ??
      toAddress?.region ??
      ""
    )
      .toString()
      .trim();
    try {
      allowFreeShipping =
        toCountryCode === "US" &&
        isLower48UsState(stateForFallback) &&
        (await areAllProductsCouponEligible(
          Array.isArray(productIds) ? productIds : []
        ));
    } catch (e) {
      allowFreeShipping = false;
    }
    let fallbackOptions;
    if (toCountryCode === "US") {
      fallbackOptions = [
        {
          service: "UPS 3 Day Select",
          code: "12",
          cost: 64.99,
          currency: "USD",
          deliveryDays: "3 business days",
          description: "Guaranteed 3-day delivery",
        },
        {
          service: "UPS 2nd Day Air",
          code: "02",
          cost: 99.99,
          currency: "USD",
          deliveryDays: "2 business days",
          description: "Second business day delivery",
        },
        {
          service: "UPS Next Day Air",
          code: "01",
          cost: 149.99,
          currency: "USD",
          deliveryDays: "1 business day",
          description: "Next business day delivery",
        },
      ];
      if (allowFreeShipping) {
        fallbackOptions.unshift({
          service: "FREE Standard Shipping",
          code: "FREE",
          cost: 0,
          currency: "USD",
          deliveryDays: "5-7 business days",
          description:
            "Free shipping on BMR products (excl. low margin & package) in lower 48 US",
        });
      }
    } else if (toCountryCode === "CA") {
      fallbackOptions = [
        {
          service: "UPS Standard to Canada",
          code: "11",
          cost: 99.99,
          currency: "USD",
          deliveryDays: "3-7 business days",
          description: "Economy shipping to Canada",
        },
        {
          service: "UPS Worldwide Expedited",
          code: "08",
          cost: 149.99,
          currency: "USD",
          deliveryDays: "2-5 business days",
          description: "Expedited shipping to Canada",
        },
        {
          service: "UPS Worldwide Express",
          code: "07",
          cost: 199.99,
          currency: "USD",
          deliveryDays: "1-3 business days",
          description: "Express shipping to Canada",
        },
      ];
    } else {
      fallbackOptions = [
        {
          service: "UPS Worldwide Expedited",
          code: "08",
          cost: 199.99,
          currency: "USD",
          deliveryDays: "3-7 business days",
          description: "International expedited shipping",
        },
        {
          service: "UPS Worldwide Express",
          code: "07",
          cost: 299.99,
          currency: "USD",
          deliveryDays: "2-5 business days",
          description: "International express shipping",
        },
        {
          service: "UPS Worldwide Saver",
          code: "65",
          cost: 280.99,
          currency: "USD",
          deliveryDays: "2-5 business days",
          description: "International saver shipping",
        },
      ];
    }
    return NextResponse.json({
      success: true,
      shippingOptions: fallbackOptions,
      error: "Using fallback shipping rates",
    });
  }
}
