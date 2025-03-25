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

    // Get related products (for now, just get random 8 products)
    const [products] = await connection.execute(
      `SELECT ProductID, ProductName, Price, Qty, ImageSmall, Description
       FROM products
       WHERE Display = 1
       ORDER BY RAND()
       LIMIT 8`
    );

    await connection.end();

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch related products" },
      { status: 500 }
    );
  }
}
