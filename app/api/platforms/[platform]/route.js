import { NextResponse } from "next/server";
import { getCategoriesByPlatform, getPlatformBySlug } from "@/lib/queries";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const platform = params.platform;

    if (!platform) {
      return NextResponse.json(
        { error: "Platform slug is required" },
        { status: 400 }
      );
    }

    // Log the requested platform for debugging
    console.log("Platform API requested:", platform);

    try {
      // First attempt to get platform data
      const platformData = await getPlatformBySlug(platform);

      if (!platformData) {
        console.log("❌ No platform found for slug:", platform);
        // Return a more helpful error with a 404 status
        return NextResponse.json(
          {
            error: "Platform not found",
            message: `No platform found for: ${platform}`,
            searchedFor: platform,
          },
          { status: 404 }
        );
      }

      console.log("✅ Platform found with ID:", platformData.id);

      // Get categories for this platform
      const { categories, platformInfo } = await getCategoriesByPlatform(
        platform
      );

      // Return platform and categories data
      return NextResponse.json({
        platform: platformData,
        categories,
        platformInfo,
      });
    } catch (error) {
      console.error("Error fetching platform data:", error);
      return NextResponse.json(
        { error: "Error fetching platform data", message: error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Failed to process platform request:", error);
    return NextResponse.json(
      { error: "Failed to process request", message: error.message },
      { status: 500 }
    );
  }
}
