import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input");
  const sessionToken = searchParams.get("sessionToken") || "default-session";

  if (!input || input.length < 3) {
    return NextResponse.json({ predictions: [] });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Maps API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${apiKey}&sessiontoken=${sessionToken}&types=address&components=country:us`
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Google Places API error:", {
        status: response.status,
        statusText: response.statusText,
        apiStatus: data.status,
        errorMessage: data.error_message,
      });
      throw new Error(
        data.error_message ||
          `Google Places API error: ${response.status} - ${data.status}`
      );
    }

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API status error:", {
        status: data.status,
        errorMessage: data.error_message,
      });
      throw new Error(
        data.error_message || `Google Places API error: ${data.status}`
      );
    }

    return NextResponse.json({
      predictions: data.predictions || [],
    });
  } catch (error) {
    console.error("Places Autocomplete error:", error);
    return NextResponse.json(
      { error: "Failed to fetch address suggestions" },
      { status: 500 }
    );
  }
}
