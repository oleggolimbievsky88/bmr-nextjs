import { NextResponse } from "next/server";
import { getCategoriesByPlatform, getPlatformBySlug } from "@/lib/queries";

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
            message: `No platform found with slug: ${platform}`,
            requestedSlug: platform,
          },
          { status: 404 }
        );
      }

      // If we found the platform, get its categories
      const { categories, platformInfo } = await getCategoriesByPlatform(
        platform
      );

      return NextResponse.json({
        platform: platformData,
        categories,
        platformInfo,
      });
    } catch (error) {
      console.error("Error fetching platform data:", error);

      // Return a proper error response
      return NextResponse.json(
        {
          error: "Error fetching platform data",
          message: error.message,
          requestedSlug: platform,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in platform route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
