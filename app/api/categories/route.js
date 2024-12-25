// /pages/api/categories/route.js

import { getCategoriesByPlatform, getMainCategories } from "@/lib/queries";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");
  const mainCategoryId = searchParams.get("mainCategory");

  try {
    const [categories, mainCategories] = await Promise.all([
      getCategoriesByPlatform(platform, mainCategoryId),
      getMainCategories(platform)
    ]);

    console.log('API Response:', { categories, mainCategories }); // Debug log

    return NextResponse.json({
      categories: categories || [],
      mainCategories: mainCategories || []
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ 
      error: "Failed to fetch categories",
      details: error.message 
    }, { status: 500 });
  }
}
