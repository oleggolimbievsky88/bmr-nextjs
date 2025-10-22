import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    console.log("Debug: Testing database connection...");

    // Test basic connection
    const connection = await pool.getConnection();
    console.log("Debug: Database connection successful");

    // Test coupon query
    const [rows] = await connection.query(
      "SELECT CouponID, CouponCode, CouponName, Value, ValueType FROM coupons WHERE CouponCode = ?",
      ["PEACOCK7"]
    );
    console.log("Debug: Coupon query result:", rows);

    // Test database name
    const [dbRows] = await connection.query("SELECT DATABASE() as db_name");
    console.log("Debug: Database name:", dbRows[0]);

    // Test all coupons with this code
    const [allRows] = await connection.query(
      "SELECT CouponID, CouponCode, CouponName, Value, ValueType FROM coupons WHERE CouponCode = ? ORDER BY CouponID",
      ["PEACOCK7"]
    );
    console.log("Debug: All coupons with PEACOCK7:", allRows);

    connection.release();

    return NextResponse.json({
      success: true,
      coupon: rows[0] || null,
      allCoupons: rows,
    });
  } catch (error) {
    console.error("Debug: Database connection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
