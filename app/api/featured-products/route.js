import { NextResponse } from "next/server";
import { getFeaturedProductsByPlatform } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const limit = parseInt(searchParams.get("limit")) || 8;

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      );
    }

    const products = await getFeaturedProductsByPlatform(platform, limit);
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured products" },
      { status: error.message === "Platform not found" ? 404 : 500 }
    );
  }
}
