// /pages/api/categories/route.js

import { getCategoriesByBodyId } from "@/lib/queries";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bodyId = searchParams.get("bodyId");

    if (!bodyId) {
      return NextResponse.json(
        { error: "Missing bodyId parameter" },
        { status: 400 }
      );
    }

    const categoriesByMainCat = await getCategoriesByBodyId(bodyId);
    return NextResponse.json(categoriesByMainCat);
  } catch (error) {
    console.error("Error fetching categories:", error);

    // Format the error response based on the error type
    if (error.message === "Missing bodyId parameter") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      );
    }
  }
}
