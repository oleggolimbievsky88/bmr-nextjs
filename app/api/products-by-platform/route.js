import { NextResponse } from "next/server";
import { getProductsByPlatformId } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Platform ID is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Platform ID:", id);

    const products = await getProductsByPlatformId(id);
    return NextResponse.json(products);
  } catch (error) {
    console.error(`Failed to fetch products for platform ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
