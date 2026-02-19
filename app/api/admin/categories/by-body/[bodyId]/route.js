import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bodyId } = await context.params;

    // Get all categories defined for this platform (via main categories),
    // so admins can add products even when no products exist for this body yet.
    const [rows] = await pool.query(
      `
			SELECT DISTINCT c.CatID, c.CatName, c.MainCatID, mc.MainCatName
			FROM categories c
			LEFT JOIN maincategories mc ON c.MainCatID = mc.MainCatID
			WHERE mc.BodyID = ?
			ORDER BY mc.MainCatName, c.CatName
		`,
      [bodyId],
    );

    return NextResponse.json({ categories: rows });
  } catch (error) {
    console.error("Error fetching categories by body:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
