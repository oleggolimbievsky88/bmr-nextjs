import { NextResponse } from "next/server";
import { getProductById } from "@/lib/queries";

export async function GET(request, { params }) {
  console.log("params", params);
  const { id } = await params;
  try {
    const productData = await getProductById(id);

    if (!productData) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Add a formatted name if needed
    productData.formattedName = `${productData.ProductName}`;

    return NextResponse.json(productData);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
