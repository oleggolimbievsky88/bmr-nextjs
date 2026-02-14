import { getGiftCertificateProducts } from "@/lib/queries";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit"), 10)
    : 50;

  try {
    const products = await getGiftCertificateProducts(limit);
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch gift certificate products:", error);
    return NextResponse.json([]);
  }
}
