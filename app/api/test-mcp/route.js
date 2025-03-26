import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    try {
      // Try a simple query
      const [result] = await connection.query("SELECT 1 as test");

      return NextResponse.json({
        success: true,
        result,
        message: "Database connection and query successful",
      });
    } finally {
      // Always release the connection back to the pool
      connection.release();
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
