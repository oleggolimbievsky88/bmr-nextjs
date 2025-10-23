// app/api/debug/route.js

import { NextResponse } from "next/server";
import { testConnection } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Debug API Route - Use this to test database connectivity on Vercel
 * Remove this route in production for security!
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const testSlug = searchParams.get("test");
  const slug = searchParams.get("slug");

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
    // const dbConnected = await Promise.race([
    //   testConnection(),
    //   new Promise((_, reject) =>
    //     setTimeout(() => reject(new Error("Connection timeout")), 10000)
    //   ),
    // ]);

    // Try a simple query if connected
    let queryResult = null;
    let platformTest = null;
    if (dbConnected) {
      try {
        const pool = (await import("@/lib/db")).default;
        const [rows] = await pool.query(
          "SELECT COUNT(*) as count FROM products LIMIT 1"
        );
        queryResult = rows[0];

        // Test platform slug if requested
        if (testSlug === "platform" && slug) {
          const [platformRows] = await pool.query(
            "SELECT BodyID, Name, slug FROM bodies WHERE slug = ?",
            [slug]
          );
          platformTest = {
            slug,
            found: platformRows.length > 0,
            data: platformRows[0] || null,
            allSlugs: (
              await pool.query(
                "SELECT slug FROM bodies WHERE slug IS NOT NULL LIMIT 5"
              )
            )[0],
          };
        }
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
        platformTest,
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
