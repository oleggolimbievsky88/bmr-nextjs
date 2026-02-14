import {
  getMerchandiseProducts,
  getAllCategoryNamesForDebug,
} from "@/lib/queries";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit"), 10)
    : 100;
  const listCategories = searchParams.get("listCategories") === "1";

  try {
    if (listCategories) {
      const categories = await getAllCategoryNamesForDebug();
      return NextResponse.json(categories);
    }
    const products = await getMerchandiseProducts(limit);
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch BMR merchandise products:", error);
    return NextResponse.json([]);
  }
}
