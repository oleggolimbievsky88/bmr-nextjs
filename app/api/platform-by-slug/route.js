import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  getMainCategories,
  getPlatformBySlug,
  getPlatformById,
  getFeaturedProductsByPlatform,
  getFeaturedProductsByBodyId,
  getMainCategoryProductCounts,
  getMainCategoriesWithProductCount,
  getMainCategoriesWithProductCountByBodyId,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");

    if (!platform) {
      return NextResponse.json(
        { error: "Platform slug or bodyid is required" },
        { status: 400 },
      );
    }

    // Check if platform is a numeric ID or a slug
    const isBodyId = /^\d+$/.test(platform);

    let platformInfo, mainCategories, featuredProducts;
    console.log("platform", platform);

    if (isBodyId) {
      // Platform is a BodyID (numeric)
      const bodyId = parseInt(platform);
      [platformInfo, mainCategories, featuredProducts] = await Promise.all([
        getPlatformById(bodyId),
        getMainCategoriesWithProductCountByBodyId(bodyId),
        getFeaturedProductsByBodyId(bodyId),
      ]);
    } else {
      // Platform is a slug (string)
      [platformInfo, mainCategories, featuredProducts] = await Promise.all([
        getPlatformBySlug(platform),
        getMainCategoriesWithProductCount(platform),
        getFeaturedProductsByPlatform(platform),
      ]);
    }

    if (!platformInfo) {
      let similarPlatforms = [];
      try {
        const [platformRows] = await pool.query(
          "SELECT PlatformID AS BodyID, Name, StartYear, EndYear FROM platforms LIMIT 5",
        );
        similarPlatforms = platformRows || [];
      } catch {
        similarPlatforms = [];
      }

      return NextResponse.json(
        {
          error: "Platform not found",
          message: `Platform with slug '${platform}' not found.`,
          availablePlatforms: similarPlatforms,
        },
        { status: 404 },
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
      { status: 500 },
    );
  }
}
