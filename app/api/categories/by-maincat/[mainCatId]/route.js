import { getCategoriesByMainCatId } from "@/lib/queries";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { mainCatId } = await params;

    if (!mainCatId) {
      return NextResponse.json(
        { error: "Main Category ID is required" },
        { status: 400 }
      );
    }

    const categories = await getCategoriesByMainCatId(mainCatId);
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories by main category:", error);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}
