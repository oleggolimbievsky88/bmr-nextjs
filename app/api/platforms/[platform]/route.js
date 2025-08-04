import { NextResponse } from "next/server";
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

export async function GET(request, { params }) {
  try {
    const { platform } = await params;

    if (!platform) {
      return NextResponse.json(
        { error: "Platform slug or bodyid is required" },
        { status: 400 }
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
