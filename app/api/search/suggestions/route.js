import { NextResponse } from "next/server";
import { searchAllQuick } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({
        products: [],
        categories: [],
        platforms: [],
        vehicles: [],
        brands: [],
      });
    }

    // Enhanced limits for better autocomplete experience
    const results = await searchAllQuick(query.trim(), {
      products: 8,      // Increased for better product visibility
      categories: 5,
      platforms: 5,     // Added platforms
      vehicles: 5,
      brands: 3,        // Reduced as less important
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    console.error("Error stack:", error.stack);
    console.error("Error message:", error.message);

    // Return error details in development
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        {
          error: "Search failed",
          message: error.message,
          stack: error.stack,
          products: [],
          categories: [],
          platforms: [],
          vehicles: [],
          brands: [],
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        products: [],
        categories: [],
        platforms: [],
        vehicles: [],
        brands: [],
      },
      { status: 500 }
    );
  }
}
