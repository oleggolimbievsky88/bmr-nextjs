import { NextResponse } from "next/server";
import { getPlatformById, getPlatformBySlug } from "@/lib/queries";

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
        { status: 400 }
      );
    }

    // Check if id is a numeric ID or a slug
    const isBodyId = /^\d+$/.test(id);

    let platform;

    if (isBodyId) {
      // ID is numeric (BodyID)
      platform = await getPlatformById(parseInt(id));
    } else {
      // ID is a slug (string)
      platform = await getPlatformBySlug(id);
    }

    if (!platform) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ platform }, { status: 200 });
  } catch (error) {
    console.error("Error fetching platform data:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform data" },
      { status: 500 }
    );
  }
}
