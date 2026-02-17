import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const products = await pool.execute(
      `SELECT ProductID, ProductName, Price, Qty, ImageSmall, Description
       FROM products
       WHERE Display = 1
       ORDER BY RAND()
       LIMIT 8`,
    );

    return NextResponse.json({ products: products[0] });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch related products" },
      { status: 500 },
    );
  }
}
