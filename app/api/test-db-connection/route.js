import { NextResponse } from "next/server";
import { testConnection } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Test Database Connection API Route
 * Use this to test database connectivity on Vercel
 */
export async function GET(request) {
  try {
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      hasHost: !!process.env.MYSQL_HOST,
      hasUser: !!process.env.MYSQL_USER,
      hasPassword: !!process.env.MYSQL_PASSWORD,
      hasDatabase: !!process.env.MYSQL_DATABASE,
      sslEnabled: process.env.MYSQL_SSL === "true",
      // Don't log actual values for security
      hostLength: process.env.MYSQL_HOST?.length || 0,
    };

    console.log("Environment check:", envCheck);

    // Test database connection with timeout
    const dbConnected = await Promise.race([
      testConnection(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Connection timeout after 10 seconds")),
          10000
        )
      ),
    ]);

    // Try a simple query if connected
    let queryResult = null;
    if (dbConnected) {
      try {
        const pool = (await import("@/lib/db")).default;
        const [rows] = await pool.query(
          "SELECT COUNT(*) as count FROM products LIMIT 1"
        );
        queryResult = rows[0];

        // Test a coupon query
        const [couponRows] = await pool.query(
          "SELECT CouponID, CouponName, Value, ValueType FROM coupons WHERE CouponCode = ? LIMIT 1",
          ["PEACOCK7"]
        );

        return NextResponse.json({
          success: true,
          message: "Database connection successful",
          environment: envCheck,
          database: {
            connected: dbConnected,
            productCount: queryResult?.count || 0,
            couponTest:
              couponRows.length > 0 ? couponRows[0] : "No coupon found",
            timestamp: new Date().toISOString(),
          },
        });
      } catch (queryError) {
        return NextResponse.json(
          {
            success: false,
            message: "Database connected but query failed",
            environment: envCheck,
            database: {
              connected: dbConnected,
              queryError: queryError.message,
              timestamp: new Date().toISOString(),
            },
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          environment: envCheck,
          database: {
            connected: false,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Test DB connection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Test failed",
        message: error.message,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL_ENV: process.env.VERCEL_ENV,
          hasHost: !!process.env.MYSQL_HOST,
          hasUser: !!process.env.MYSQL_USER,
          hasPassword: !!process.env.MYSQL_PASSWORD,
          hasDatabase: !!process.env.MYSQL_DATABASE,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
