import { NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Connect to database using environment variables
    await global.mcp_MySQL_MCP_connect_db({
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "bmrsuspension",
    });

    // Query featured products
    const result = await global.mcp_MySQL_MCP_query({
      sql: `
        SELECT p.*, b.Name as PlatformName
        FROM products p
        LEFT JOIN bodies b ON p.BodyID = b.BodyID
        WHERE p.fproduct = 1
        AND p.Display = 1
        ORDER BY p.ProductID DESC
        LIMIT 12
      `,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
