import { NextResponse } from "next/server";
import {
  getCategoriesByPlatform,
  getProductsByMainCategory,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const platformSlug = searchParams.get("platform");
    const mainCategory = searchParams.get("mainCategory");
    const categoryId = searchParams.get("categoryId");

    if (!platformSlug || !mainCategory) {
      return NextResponse.json(
        { error: "Platform and main category are required" },
        { status: 400 }
      );
    }

    // Get subcategories and initial products
    const [{ categories, platformInfo }, products] = await Promise.all([
      getCategoriesByPlatform(platformSlug, mainCategory),
      getProductsByMainCategory(platformSlug, mainCategory, 12), // Limit to 12 products
    ]);

    return NextResponse.json({
      categories,
      products,
      platformInfo,
    });
  } catch (error) {
    console.error("Error in main category route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
