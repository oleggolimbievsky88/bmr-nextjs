import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { fromAddress, toAddress, packages } = await request.json();

    // UPS API credentials
    const upsUsername = process.env.UPS_USERNAME;
    const upsPassword = process.env.UPS_PASSWORD;
    const upsAccessKey = process.env.UPS_ACCESS_KEY;
    const upsAccountNumber = process.env.UPS_ACCOUNT_NUMBER;

    if (!upsUsername || !upsPassword || !upsAccessKey) {
      return NextResponse.json(
        { error: "UPS API credentials not configured" },
        { status: 500 }
      );
    }

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
              CountryCode: "US",
            },
          },
          ShipTo: {
            Name: `${toAddress.firstName} ${toAddress.lastName}`,
            Address: {
              AddressLine: [toAddress.address1],
              City: toAddress.city,
              StateProvinceCode: toAddress.state,
              PostalCode: toAddress.zip,
              CountryCode: "US",
            },
          },
          ShipFrom: {
            Name: "BMR Suspension",
            Address: {
              AddressLine: [fromAddress.address1],
              City: fromAddress.city,
              StateProvinceCode: fromAddress.state,
              PostalCode: fromAddress.zip,
              CountryCode: "US",
            },
          },
          Service: {
            Code: "03", // Ground service
            Description: "UPS Ground",
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

    // Get OAuth token first
    const tokenResponse = await fetch(
      "https://onlinetools.ups.com/security/v1/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-merchant-id": upsUsername,
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: upsAccessKey,
          client_secret: upsPassword,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error(`UPS OAuth error: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Make rate request
    const rateResponse = await fetch(
      "https://onlinetools.ups.com/api/rating/v1/Rate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          transId: "BMR-Rate-" + Date.now(),
          transactionSrc: "BMR Suspension",
        },
        body: JSON.stringify(rateRequest),
      }
    );

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
      shippingOptions.push({
        service: "UPS Ground",
        code: "03",
        cost: parseFloat(shipment.TotalCharges?.MonetaryValue || "0"),
        currency: shipment.TotalCharges?.CurrencyCode || "USD",
        deliveryDays: shipment.GuaranteedDeliveryTime || "1-5 business days",
        description: "Standard ground shipping",
      });
    }

    // Add free shipping option for BMR products
    shippingOptions.unshift({
      service: "FREE SHIPPING",
      code: "FREE",
      cost: 0,
      currency: "USD",
      deliveryDays: "1-5 business days",
      description: "Free shipping on all BMR products",
    });

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
