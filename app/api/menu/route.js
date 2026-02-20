import { getMenuData } from "@/lib/queries";
import { NextResponse } from "next/server";

// Cache the menu data for 1 hour (3600 seconds)
export const revalidate = 3600;

// Empty menu shape so nav still works when DB is unavailable (e.g. DATABASE_URL missing in prod)
const emptyMenuData = {
  fordLinks: [],
  moparLinks: [],
  gmLateModelLinks: [],
  gmMidMuscleLinks: [],
  gmClassicMuscleLinks: [],
};

export async function GET() {
  try {
    const menuData = await getMenuData();
    return NextResponse.json(menuData, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    // Log full details for debugging (check Vercel logs; often DATABASE_URL missing or DB unreachable)
    console.error("Menu API: getMenuData failed", {
      message: error?.message,
      code: error?.code,
      errno: error?.errno,
      sqlState: error?.sqlState,
      stack: error?.stack,
    });
    // Return 200 with empty menu so the site doesn't show "Menu temporarily unavailable"
    return NextResponse.json(emptyMenuData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Menu-Fallback": "1",
      },
    });
  }
}
