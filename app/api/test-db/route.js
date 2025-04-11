import { testConnection } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Test the connection
    const connected = await testConnection();

    // Get environment variables (don't expose passwords in production)
    const envInfo = {
      MYSQL_HOST: process.env.MYSQL_HOST,
      MYSQL_USER: process.env.MYSQL_USER,
      MYSQL_DATABASE: process.env.MYSQL_DATABASE,
      NODE_ENV: process.env.NODE_ENV,
      // Password is masked for security
      MYSQL_PASSWORD: process.env.MYSQL_PASSWORD ? "******" : "Not set",
    };

    // Check which tables are available in database
    const tables = connected
      ? "Database connection successful"
      : "Could not connect to database";

    return NextResponse.json({
      connected,
      envInfo,
      tables,
      message: connected
        ? "Database connection successful"
        : "Database connection failed",
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      {
        error: "Failed to test database connection",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
