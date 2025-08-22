import { getAllColors } from "@/lib/queries";
import pool from "@/lib/db";

export async function GET() {
  try {
    console.log("Colors API - starting database query...");

    // Test database connection first
    try {
      const connection = await pool.getConnection();
      console.log("Colors API - database connection successful");
      connection.release();
    } catch (dbError) {
      console.error("Colors API - database connection failed:", dbError);
      throw dbError;
    }

    const colors = await getAllColors();

    console.log("Colors API - fetched colors:", colors);
    console.log("Colors API - colors length:", colors ? colors.length : 0);

    return Response.json({
      success: true,
      colors: colors || [],
    });
  } catch (error) {
    console.error("Error fetching colors:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch colors",
        colors: [],
      },
      { status: 500 }
    );
  }
}
