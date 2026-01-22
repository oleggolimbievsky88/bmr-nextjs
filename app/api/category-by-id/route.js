import { getCategoriesByMainCatId } from "@/lib/queries";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Get categories by Main Category ID
 * 
 * WARNING: The query parameter is named 'catId' but it actually expects a MainCatID.
 * This is a legacy naming issue maintained for backward compatibility.
 * 
 * @deprecated Use /api/categories/by-maincat/[mainCatId] instead for clarity
 * 
 * Supports both 'catId' (legacy) and 'mainCatId' (correct) query parameters
 * 
 * @param {string} catId - Actually expects a MainCatID (main category ID), not a regular category ID
 * @param {string} mainCatId - Correct parameter name (preferred)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // Support both legacy 'catId' and correct 'mainCatId' parameter names
    const mainCatId = searchParams.get("mainCatId") || searchParams.get("catId");

    if (!mainCatId) {
      return NextResponse.json(
        { 
          error: "Main Category ID is required",
          note: "Use 'mainCatId' (preferred) or legacy 'catId' parameter. This route expects a MainCatID (main category ID), not a regular category ID. The function filters by WHERE c.MainCatID = ?"
        },
        { status: 400 }
      );
    }

    // IMPORTANT: The legacy 'catId' query parameter actually expects a MainCatID.
    // This is semantically incorrect but maintained for backward compatibility.
    // The function getCategoriesByMainCatId() filters by WHERE c.MainCatID = ?
    const categories = await getCategoriesByMainCatId(mainCatId);
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}
