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
    };

    console.log("Environment check:", envCheck);

    // Test database connection
    const dbConnected = await testConnection();

    return NextResponse.json({
      message: "Debug info",
      environment: envCheck,
      database: {
        connected: dbConnected,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      {
        error: "Debug failed",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
