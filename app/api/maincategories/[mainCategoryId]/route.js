import { NextResponse } from "next/server";
import {
  getCategoriesByPlatform,
  getProductsByMainCategory,
  getProductBySlug,
} from "@/lib/queries";

// Enable dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const url = useSearchParams();
    const platformSlug = url.get("platform");
    const mainCategory = url.get("mainCategory");

    if (!platformSlug || !mainCategory) {
      return NextResponse.json(
        { error: "Platform and main category are required" },
        { status: 400 }
      );
    }

    // Get subcategories and initial products
    const [{ mainCategories, platformInfo }, products] = await Promise.all([
      getCategoriesByPlatform(platformSlug, mainCategory),
      getProductsByMainCategory(platformSlug, mainCategory, 8), // Limit to 8 products
    ]);

    return NextResponse.json({
      mainCategories,
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
