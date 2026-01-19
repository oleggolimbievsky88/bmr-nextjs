import { getMenuData } from "@/lib/queries";
import { NextResponse } from "next/server";

// Cache the menu data for 1 hour (3600 seconds)
export const revalidate = 3600;

export async function GET() {
  try {
    const menuData = await getMenuData();
    return NextResponse.json(menuData, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Failed to fetch menu data:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu data", details: error.message },
      { status: 500 }
    );
  }
}
