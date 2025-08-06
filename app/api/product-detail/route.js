import { NextResponse } from "next/server";
import { getProductById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const productData = await getProductById(productId);

    if (!productData) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Add a formatted name if needed
    productData.formattedName = `${productData.ProductName}`;

    // Return in format expected by context
    return NextResponse.json({ product: productData });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
