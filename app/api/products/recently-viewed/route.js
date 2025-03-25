import { cookies } from "next/headers";
import { mcp_MySQL_MCP_connect_db, mcp_MySQL_MCP_query } from "@/lib/db";
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  try {
    // Create MySQL connection
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // Get recently viewed products (for now, just get the latest 8 products)
    const [products] = await connection.execute(
      `SELECT ProductID, ProductName, Price, Qty, ImageSmall, Description
       FROM products
       WHERE Display = 1
       ORDER BY ProductID DESC
       LIMIT 8`
    );

    await connection.end();

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recently viewed products" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { productId } = await request.json();

    if (!productId || isNaN(parseInt(productId))) {
      return Response.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const cookieStore = cookies();
    const recentlyViewed = cookieStore.get("recently_viewed");

    let productIds = [];
    if (recentlyViewed && recentlyViewed.value) {
      try {
        productIds = JSON.parse(recentlyViewed.value);
      } catch (e) {
        console.error("Error parsing recently viewed cookie:", e);
      }
    }

    if (!Array.isArray(productIds)) {
      productIds = [];
    }

    // Remove if exists and add to front
    productIds = productIds.filter((id) => id !== productId);
    productIds.unshift(productId);

    // Keep only last 12 viewed products
    productIds = productIds.slice(0, 12);

    // Set cookie that expires in 30 days
    cookies().set("recently_viewed", JSON.stringify(productIds), {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating recently viewed products:", error);
    return Response.json(
      { error: "Failed to update recently viewed products" },
      { status: 500 }
    );
  }
}
