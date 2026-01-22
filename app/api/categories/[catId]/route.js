import { getCategoriesByMainCatId } from "@/lib/queries";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Get categories by Main Category ID
 * 
 * WARNING: The route parameter is named 'catId' but it actually expects a MainCatID.
 * This is a legacy naming issue maintained for backward compatibility.
 * 
 * @deprecated Use /api/categories/by-maincat/[mainCatId] instead for clarity
 * 
 * @param {string} catId - Actually expects a MainCatID (main category ID), not a regular category ID
 */
export async function GET(request, { params }) {
  try {
    const { catId } = await params;

    if (!catId) {
      return NextResponse.json(
        { 
          error: "Main Category ID is required",
          note: "This route expects a MainCatID (main category ID), not a regular category ID. The parameter name 'catId' is misleading but maintained for backward compatibility."
        },
        { status: 400 }
      );
    }

    // IMPORTANT: The route parameter is named 'catId' but actually expects a MainCatID.
    // This is semantically incorrect but maintained for backward compatibility.
    // The function getCategoriesByMainCatId() filters by WHERE c.MainCatID = ?
    const mainCatId = catId; // Renamed internally for clarity
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
