import { NextResponse } from "next/server";
import {
  getMainCategories,
  getPlatformBySlug,
  getFeaturedProductsByPlatform,
} from "@/lib/queries";
import { testConnection } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error("Database connection failed");
    }

    const { platform } = params;

    if (!platform) {
      return NextResponse.json(
        { error: "Platform slug is required" },
        { status: 400 }
      );
    }

    // Fetch platform info, main categories, and featured products
    const [platformInfo, mainCategories, featuredProducts] = await Promise.all([
      getPlatformBySlug(platform).catch((error) => {
        console.error("Error fetching platform:", error);
        return null;
      }),
      getMainCategories(platform).catch((error) => {
        console.error("Error fetching main categories:", error);
        return [];
      }),
      getFeaturedProductsByPlatform(platform).catch((error) => {
        console.error("Error fetching featured products:", error);
        return [];
      }),
    ]);

    if (!platformInfo) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 }
      );
    }

    // Log successful response
    console.log("Successfully fetched platform data for:", platform);

    return NextResponse.json({
      mainCategories,
      platformInfo,
      featuredProducts,
    });
  } catch (error) {
    console.error("Error fetching platform data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch platform data",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
