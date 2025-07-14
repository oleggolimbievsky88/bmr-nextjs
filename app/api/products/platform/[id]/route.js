// app/api/products/platform/[id]/route.js

import { NextResponse } from "next/server";
import { getProductsByPlatformId } from "@/lib/queries";

export async function GET(request, { params }) {
  const { id } = await params; // Get platform ID from the route parameters
  console.log("🔍 Platform ID:", id);

  try {
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
