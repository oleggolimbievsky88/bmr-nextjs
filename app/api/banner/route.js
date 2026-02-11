import { NextResponse } from "next/server";
import { getBannerForPublic } from "@/lib/queries";
import pool from "@/lib/db";

export async function GET() {
  try {
    let banner = null;
    try {
      banner = await getBannerForPublic();
    } catch (e) {
      // Fallback if scheduling columns not yet added
      const [rows] = await pool.query(
        "SELECT * FROM banner WHERE display = 1 LIMIT 1",
      );
      banner = rows?.[0] || null;
    }
    if (!banner) {
      return NextResponse.json({ banner: null, images: [] });
    }
    const [imageRows] = await pool.query(
      "SELECT * FROM bannerimages WHERE bannerid = ? ORDER BY ImagePosition ASC, ImageId ASC",
      [banner.bannerid],
    );
    return NextResponse.json({
      banner,
      images: imageRows || [],
    });
  } catch (error) {
    console.error("Error fetching banner:", error);
    return NextResponse.json(
      { error: "Error fetching banner" },
      { status: 500 },
    );
  }
}
