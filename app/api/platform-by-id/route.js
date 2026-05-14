import { NextResponse } from "next/server";
import {
  getPlatformById,
  getMainCategoriesWithProductCountByBodyId,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bodyId = searchParams.get("bodyId");

    if (!bodyId) {
      return NextResponse.json(
        { error: "Platform bodyId is required" },
        { status: 400 },
      );
    }

    // Check if bodyId is numeric
    const isBodyId = /^\d+$/.test(bodyId);

    if (!isBodyId) {
      return NextResponse.json(
        { error: "Invalid bodyId format" },
        { status: 400 },
      );
    }

    const platform = await getPlatformById(parseInt(bodyId));

    if (!platform) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 },
      );
    }

    const mainCategories = await getMainCategoriesWithProductCountByBodyId(
      parseInt(bodyId),
    );

    // Transform main categories to match expected format
    const transformedMainCategories = mainCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      image: cat.image,
      slug: cat.slug,
      productCount: cat.productCount,
      heroImage: cat.heroImage ?? null,
      link: `/products/${bodyId}/${cat.slug}`,
    }));

    return NextResponse.json(
      {
        platformInfo: platform,
        mainCategories: transformedMainCategories,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Error in Platform API:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform data" },
      { status: 500 },
    );
  }
}
