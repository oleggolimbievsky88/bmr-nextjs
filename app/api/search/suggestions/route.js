import { NextResponse } from "next/server";
import { searchAllQuick } from "@/lib/queries";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({
        products: [],
        categories: [],
        vehicles: [],
        brands: [],
      });
    }

    const results = await searchAllQuick(query.trim(), {
      products: 6,
      categories: 5,
      vehicles: 5,
      brands: 5,
    });
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return NextResponse.json(
      {
        products: [],
        categories: [],
        vehicles: [],
        brands: [],
      },
      { status: 500 }
    );
  }
}
