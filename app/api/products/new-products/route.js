import { getNewProducts } from "@/lib/queries";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const scratchDent = searchParams.get("scrachDent") || "0";

  try {
    const newProducts = await getNewProducts(scratchDent);
    return NextResponse.json(newProducts);
  } catch (error) {
    console.error("Failed to fetch new products:", error);
    return NextResponse.json(
      { error: "Failed to fetch new products" },
      { status: 500 }
    );
  }
}
