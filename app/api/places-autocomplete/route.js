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
    // Return empty predictions instead of error - user can still type manually
    return NextResponse.json({ 
      predictions: [],
      apiUnavailable: true,
    });
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
      // Return empty predictions instead of throwing - user can still type manually
      return NextResponse.json({ 
        predictions: [],
        apiUnavailable: true,
      });
    }

    // Check for API disabled/suspended status
    if (data.status === "REQUEST_DENIED" || data.status === "OVER_QUERY_LIMIT") {
      console.error("Google Places API status error:", {
        status: data.status,
        errorMessage: data.error_message,
      });
      // Return empty predictions - user can still type manually
      return NextResponse.json({ 
        predictions: [],
        apiUnavailable: true,
      });
    }

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API status error:", {
        status: data.status,
        errorMessage: data.error_message,
      });
      // Return empty predictions instead of throwing
      return NextResponse.json({ 
        predictions: [],
        apiUnavailable: true,
      });
    }

    return NextResponse.json({
      predictions: data.predictions || [],
    });
  } catch (error) {
    console.error("Places Autocomplete error:", error);
    // Return empty predictions instead of error - user can still type manually
    return NextResponse.json({ 
      predictions: [],
      apiUnavailable: true,
    });
  }
}
