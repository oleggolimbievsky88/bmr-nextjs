import { NextResponse } from "next/server";
import {
  getPlatformById,
  getPlatformBySlug,
  getMainCategoriesWithProductCount,
  getMainCategoriesWithProductCountByBodyId,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

/**
 * API Route: Get platform by ID or slug
 * @param {Request} request
 * @param {Object} context
 * @param {Object} context.params
 * @returns {NextResponse}
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    console.log("🔍 API called with id:", id);

    if (!id) {
      console.log("❌ No ID provided");
      return NextResponse.json(
        { error: "Platform ID or slug is required" },
        { status: 400 },
      );
    }

    // Check if id is a numeric ID or a slug
    const isBodyId = /^\d+$/.test(id);
    console.log("🔍 Is numeric ID:", isBodyId);

    let platform;
    let mainCategories = [];

    if (isBodyId) {
      // ID is numeric (BodyID)
      console.log("🔍 Fetching platform by ID:", parseInt(id));
      platform = await getPlatformById(parseInt(id));
      console.log("🔍 Platform result:", platform);
      if (platform) {
        console.log("🔍 Fetching main categories by BodyID");
        mainCategories = await getMainCategoriesWithProductCountByBodyId(
          parseInt(id),
        );
        console.log("🔍 Main categories result:", mainCategories);
      }
    } else {
      // ID is a slug (string)
      console.log("🔍 Fetching platform by slug:", id);
      platform = await getPlatformBySlug(id);
      console.log("🔍 Platform result:", platform);
      if (platform) {
        console.log("🔍 Fetching main categories by slug");
        mainCategories = await getMainCategoriesWithProductCount(id);
        console.log("🔍 Main categories result:", mainCategories);
      }
    }

    if (!platform) {
      console.log("❌ Platform not found");
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 },
      );
    }

    // Transform main categories to match expected format
    const transformedMainCategories = mainCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      image: cat.image,
      slug: cat.slug,
      productCount: cat.productCount,
      heroImage: cat.heroImage ?? null,
      link: `/products/${id}/${cat.slug}`,
    }));

    console.log("✅ Returning data:", {
      platformInfo: platform,
      mainCategories: transformedMainCategories,
    });

    return NextResponse.json(
      {
        platformInfo: platform,
        mainCategories: transformedMainCategories,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Error in API:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform data" },
      { status: 500 },
    );
  }
}
