import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId");
  const sessionToken = searchParams.get("sessionToken") || "default-session";

  if (!placeId) {
    return NextResponse.json(
      { error: "Place ID is required" },
      { status: 400 }
    );
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
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&sessiontoken=${sessionToken}&fields=address_components,formatted_address`
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    // Parse address components
    const addressComponents = data.result.address_components || [];
    const parsedAddress = {
      address1: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    };

    addressComponents.forEach((component) => {
      const types = component.types;
      if (types.includes("street_number") || types.includes("route")) {
        parsedAddress.address1 += component.long_name + " ";
      } else if (types.includes("locality")) {
        parsedAddress.city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        parsedAddress.state = component.short_name;
      } else if (types.includes("postal_code")) {
        parsedAddress.zip = component.long_name;
      } else if (types.includes("country")) {
        parsedAddress.country = component.short_name;
      }
    });

    parsedAddress.address1 = parsedAddress.address1.trim();

    return NextResponse.json({
      address: parsedAddress,
      formattedAddress: data.result.formatted_address,
    });
  } catch (error) {
    console.error("Place Details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch place details" },
      { status: 500 }
    );
  }
}
