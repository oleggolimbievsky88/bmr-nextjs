import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Connect to database
    await global.mcp_MySQL_MCP_connect_db({
      host: "localhost",
      user: "root",
      password: "Amelia1",
      database: "bmrsuspension",
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
