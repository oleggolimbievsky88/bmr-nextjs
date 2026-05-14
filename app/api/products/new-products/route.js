import { getNewProducts } from "@/lib/queries";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const scratchDent =
    searchParams.get("scratchDent") || searchParams.get("scratchDent") || "0";
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit"))
    : 35;

  try {
    const newProducts = await getNewProducts(scratchDent, limit);

    return NextResponse.json(newProducts);
  } catch (error) {
    console.error("Failed to fetch new products:", error);

    // Return empty array instead of error for now
    // This prevents the 500 error while you set up the database
    return NextResponse.json([]);
  }
}
