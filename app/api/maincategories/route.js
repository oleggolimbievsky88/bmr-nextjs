import { NextResponse } from "next/server";
import { getMainCategoriesByPlatform } from "@/lib/queries";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");

  if (!platform) {
    return NextResponse.json(
      { error: "Platform parameter is required" },
      { status: 400 }
    );
  }

  try {
    const mainCategories = await getMainCategoriesByPlatform(platform);
    return NextResponse.json(mainCategories);
  } catch (error) {
    console.error("Error fetching main categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch main categories" },
      { status: 500 }
    );
  }
}
