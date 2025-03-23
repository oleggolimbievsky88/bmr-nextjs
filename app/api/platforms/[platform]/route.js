import { getPlatformBySlug } from "@/lib/queries";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { platform } = params;

  if (!platform) {
    return NextResponse.json(
      { error: "Platform slug is required" },
      { status: 400 }
    );
  }

  try {
    const platformData = await getPlatformBySlug(platform);

    if (!platformData) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(platformData);
  } catch (error) {
    console.error(`Error fetching platform data for ${platform}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch platform data" },
      { status: 500 }
    );
  }
}
