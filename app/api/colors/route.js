import { getAllColors } from "@/lib/queries";
import pool from "@/lib/db";

export async function GET() {
  try {
    // Test database connection first
    try {
      const connection = await pool.getConnection();
      connection.release();
    } catch (dbError) {
      console.error("Colors API - database connection failed:", dbError);
      throw dbError;
    }

    const colors = await getAllColors();

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
      { status: 500 },
    );
  }
}
