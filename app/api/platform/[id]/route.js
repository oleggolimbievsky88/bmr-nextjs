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

    if (!id) {
      return NextResponse.json(
        { error: "Platform ID or slug is required" },
        { status: 400 },
      );
    }

    // Check if id is a numeric ID or a slug
    const isBodyId = /^\d+$/.test(id);

    let platform;
    let mainCategories = [];

    if (isBodyId) {
      // ID is numeric (BodyID)
      platform = await getPlatformById(parseInt(id));
      if (platform) {
        mainCategories = await getMainCategoriesWithProductCountByBodyId(
          parseInt(id),
        );
      }
    } else {
      // ID is a slug (string)
      platform = await getPlatformBySlug(id);
      if (platform) {
        mainCategories = await getMainCategoriesWithProductCount(id);
      }
    }

    if (!platform) {
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
