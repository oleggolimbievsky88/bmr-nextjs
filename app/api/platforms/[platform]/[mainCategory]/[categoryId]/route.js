import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request, { params }) {
  const { platformName, categoryId } = params;

  try {
    const query = `
      SELECT p.* FROM products p
      JOIN bodies pl ON p.BodyID = pl.BodyID
      WHERE p.Display = 1 AND pl.Name = ? AND p.categoryId = ?
    `;
    const [rows] = await pool.query(query, [
      platformName,
      parseInt(categoryId),
    ]);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
