import { getPlatformById } from "@/lib/queries";
import { NextResponse } from "next/server";

// Enable static rendering for this route
export const dynamic = "force-static";

// Generate static params for all possible platformIds
export async function generateStaticParams() {
  // You can fetch all possible platformIds here if needed
  return []; // Return empty array for now as we'll handle 404s in the GET function
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const platformId = searchParams.get("platformId");

    if (!platformId) {
      return NextResponse.json(
        { error: "Missing platformId parameter" },
        { status: 400 }
      );
    }

    const platformDetails = await getPlatformById(platformId);

    if (!platformDetails) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(platformDetails);
  } catch (error) {
    console.error("Error fetching platform details:", error);

    // Format the error response based on the error type
    if (error.message === "Missing platformId parameter") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else if (error.message === "Platform not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    } else {
      return NextResponse.json(
        { error: "Failed to fetch platform details" },
        { status: 500 }
      );
    }
  }
}
