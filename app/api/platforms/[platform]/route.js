import { NextResponse } from "next/server";
import {
  getMainCategories,
  getPlatformBySlug,
  getFeaturedProductsByPlatform,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { platform } = params;

    if (!platform) {
      return NextResponse.json(
        { error: "Platform slug is required" },
        { status: 400 }
      );
    }

    // Fetch platform info, main categories, and featured products
    const [platformInfo, mainCategories, featuredProducts] = await Promise.all([
      getPlatformBySlug(platform),
      getMainCategories(platform),
      getFeaturedProductsByPlatform(platform),
    ]);

    if (!platformInfo) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      mainCategories,
      platformInfo,
      featuredProducts,
    });
  } catch (error) {
    console.error("Error fetching platform data:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform data" },
      { status: 500 }
    );
  }
}
