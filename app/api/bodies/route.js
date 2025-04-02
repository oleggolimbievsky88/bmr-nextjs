import { NextResponse } from "next/server";
import { mcp_MySQL_MCP_query } from "@/lib/db";

export async function GET() {
  try {
    const bodies = await mcp_MySQL_MCP_query({
      sql: "SELECT * FROM bodies ORDER BY Name ASC",
    });

    return NextResponse.json(bodies);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
