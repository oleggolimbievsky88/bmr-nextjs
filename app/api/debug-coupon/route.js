import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Test basic connection
    const connection = await pool.getConnection();

    // Test coupon query from coupons_new table
    const [rows] = await connection.query(
      "SELECT id, code, name, discount_type, discount_value, start_date, end_date, is_active, is_public FROM coupons_new WHERE code = ?",
      ["PEACOCK7"],
    );

    // Test database name
    const [dbRows] = await connection.query("SELECT DATABASE() as db_name");

    // Test all coupons with this code
    const [allRows] = await connection.query(
      "SELECT id, code, name, discount_type, discount_value, start_date, end_date, is_active, is_public FROM coupons_new WHERE code = ? ORDER BY id",
      ["PEACOCK7"],
    );

    connection.release();

    return NextResponse.json({
      success: true,
      coupon: rows[0] || null,
      allCoupons: allRows,
      dbName: dbRows[0] || null,
    });
  } catch (error) {
    console.error("Debug: Database connection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
