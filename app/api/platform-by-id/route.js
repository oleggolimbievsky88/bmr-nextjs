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

    console.log("🔍 Platform API called with bodyId:", bodyId);

    if (!bodyId) {
      console.log("❌ No bodyId provided");
      return NextResponse.json(
        { error: "Platform bodyId is required" },
        { status: 400 }
      );
    }

    // Check if bodyId is numeric
    const isBodyId = /^\d+$/.test(bodyId);
    console.log("🔍 Is numeric bodyId:", isBodyId);

    if (!isBodyId) {
      console.log("❌ Invalid bodyId format");
      return NextResponse.json(
        { error: "Invalid bodyId format" },
        { status: 400 }
      );
    }

    console.log("🔍 Fetching platform by ID:", parseInt(bodyId));
    const platform = await getPlatformById(parseInt(bodyId));
    console.log("🔍 Platform result:", platform);

    if (!platform) {
      console.log("❌ Platform not found");
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 }
      );
    }

    console.log("🔍 Fetching main categories by BodyID");
    const mainCategories = await getMainCategoriesWithProductCountByBodyId(
      parseInt(bodyId)
    );
    console.log("🔍 Main categories result:", mainCategories);

    // Transform main categories to match expected format
    const transformedMainCategories = mainCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      image: cat.image,
      slug: cat.slug,
      productCount: cat.productCount,
      link: `/products/${bodyId}/${cat.slug}`,
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
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in Platform API:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform data" },
      { status: 500 }
    );
  }
}
