import { getProductTypes } from "@/lib/queries";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");
  const category = searchParams.get("category");

  try {
    const productTypes = await getProductTypes(platform, category);
    return NextResponse.json(productTypes);
  } catch (error) {
    console.error("Failed to fetch product types:", error);
    return NextResponse.json(
      { error: "Failed to fetch product types" },
      { status: 500 }
    );
  }
}
