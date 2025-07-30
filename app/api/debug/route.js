import { NextResponse } from "next/server";
import { testConnection } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Debug API Route - Use this to test database connectivity on Vercel
 * Remove this route in production for security!
 */
export async function GET() {
  try {
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      hasHost: !!process.env.MYSQL_HOST,
      hasUser: !!process.env.MYSQL_USER,
      hasPassword: !!process.env.MYSQL_PASSWORD,
      hasDatabase: !!process.env.MYSQL_DATABASE,
      sslEnabled: process.env.MYSQL_SSL === "true",
    };

    console.log("Environment check:", envCheck);

    // Test database connection
    const dbConnected = await testConnection();

    // Try a simple query if connected
    let queryResult = null;
    if (dbConnected) {
      try {
        const pool = (await import("@/lib/db")).default;
        const [rows] = await pool.query(
          "SELECT COUNT(*) as count FROM products LIMIT 1"
        );
        queryResult = rows[0];
      } catch (queryError) {
        queryResult = { error: queryError.message };
      }
    }

    return NextResponse.json({
      message: "Debug info",
      environment: envCheck,
      database: {
        connected: dbConnected,
        queryTest: queryResult,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      {
        error: "Debug failed",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
