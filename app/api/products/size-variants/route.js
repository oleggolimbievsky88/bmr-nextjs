import { getMerchandiseSizeVariants } from "@/lib/queries";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  try {
    const variants = await getMerchandiseSizeVariants(productId);
    return NextResponse.json(variants);
  } catch (error) {
    console.error("Failed to fetch size variants:", error);
    return NextResponse.json([]);
  }
}
