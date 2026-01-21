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

    // If no API key, return a graceful "unavailable" response
    if (!apiKey) {
      return NextResponse.json({
        isValid: true,
        apiUnavailable: true,
        correctedAddress: null,
        message: "Address validation unavailable - proceeding without validation",
      });
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
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error?.message || `Google API error: ${response.status}`;
      console.error("Google Address Validation API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData.error,
      });
      
      // Check if it's a permission/suspension error - return graceful response
      if (response.status === 403 || 
          errorMessage.includes('suspended') || 
          errorMessage.includes('Permission denied') ||
          errorMessage.includes('disabled')) {
        return NextResponse.json({
          isValid: true,
          apiUnavailable: true,
          correctedAddress: null,
          message: "Address validation service temporarily unavailable",
        });
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Stricter validity rules
    // Require a complete address at premise/sub-premise granularity with no
    // unconfirmed components. This prevents obviously bad inputs from passing.
    const verdict = data.result?.verdict || {};
    const granularity = verdict.inputGranularity;
    const addressComplete = verdict.addressComplete === true;
    const hasUnconfirmed = verdict.hasUnconfirmedComponents === true;

    const isValid =
      addressComplete &&
      (granularity === "PREMISE" || granularity === "SUB_PREMISE") &&
      !hasUnconfirmed;

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
      // expose raw signal for UI messaging
      confidence: addressComplete,
      granularity,
      hasUnconfirmed,
      geocode: data.result?.geocode,
    });
  } catch (error) {
    console.error("Address validation error:", error);
    // Return a graceful response instead of 500 error
    // This allows checkout to continue even if validation fails
    return NextResponse.json({
      isValid: true,
      apiUnavailable: true,
      correctedAddress: null,
      message: "Address validation unavailable - proceeding without validation",
    });
  }
}
