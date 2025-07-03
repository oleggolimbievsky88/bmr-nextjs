import { NextResponse } from "next/server";
import {
  getCategoriesByPlatform,
  getMainCategoryProductCounts,
  getProductsByMainCategory,
} from "@/lib/queries";

// Enable dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { platform, mainCategory } = params;
    if (!platform || !mainCategory) {
      return NextResponse.json(
        { error: "Platform and main category are required" },
        { status: 400 }
      );
    }

    // Get subcategories and initial products
    const [{ categories, platformInfo }, products] = await Promise.all([
      getCategoriesByPlatform(platform, mainCategory),
      getProductsByMainCategory(platform, mainCategory, 16), // Limit to 8 products
      getMainCategoryProductCounts(platform, mainCategory), // Get product counts for each subcategory
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
