import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    // Google Address Validation API
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: {
            addressLines: [address.address1, address.address2].filter(Boolean),
            locality: address.city,
            administrativeArea: address.state,
            postalCode: address.zip,
            regionCode: "US", // Assuming US addresses for now
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();

    // Check if address is valid
    const isValid =
      data.result?.verdict?.inputGranularity === "SUB_PREMISE" ||
      data.result?.verdict?.inputGranularity === "PREMISE" ||
      data.result?.verdict?.inputGranularity === "ROUTE";

    const correctedAddress = data.result?.address;

    return NextResponse.json({
      isValid,
      correctedAddress: correctedAddress
        ? {
            address1: correctedAddress.addressLines?.[0] || "",
            address2: correctedAddress.addressLines?.[1] || "",
            city: correctedAddress.locality || "",
            state: correctedAddress.administrativeArea || "",
            zip: correctedAddress.postalCode || "",
            country: "US",
          }
        : null,
      suggestions: data.result?.address?.addressLines || [],
      confidence: data.result?.verdict?.addressComplete,
      geocode: data.result?.geocode,
    });
  } catch (error) {
    console.error("Address validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate address" },
      { status: 500 }
    );
  }
}
