import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [rows] = await pool.query(
      `
      SELECT p.*, b.Name as PlatformName
      FROM products p
      LEFT JOIN bodies b ON p.BodyID = b.BodyID
      WHERE p.fproduct = 1
      AND p.Display = 1
      ORDER BY p.ProductID DESC
      LIMIT 12
    `,
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
