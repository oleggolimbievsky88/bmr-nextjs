import { getNewProducts } from "@/lib/queries";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const scratchDent = searchParams.get("scrachDent") || "0";
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit"))
    : 35;

  console.log("API route: /api/products/new-products");
  console.log("Parameters:", { scratchDent, limit });

  try {
    const newProducts = await getNewProducts(scratchDent, limit);
    console.log(`Fetched ${newProducts.length} products`);

    return NextResponse.json(newProducts);
  } catch (error) {
    console.error("Failed to fetch new products:", error);

    // Return empty array instead of error for now
    // This prevents the 500 error while you set up the database
    console.log("Returning empty products array due to database error");
    return NextResponse.json([]);
  }
}
