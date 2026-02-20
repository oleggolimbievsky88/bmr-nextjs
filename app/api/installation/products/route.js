import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const category = searchParams.get("category");

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 },
      );
    }

    // Get platform info
    const platformQuery = `
			SELECT PlatformID AS BodyID, Name, StartYear, EndYear
			FROM platforms
			WHERE PlatformID = ?
		`;
    const [platformRows] = await pool.query(platformQuery, [platform]);
    const platformInfo = platformRows[0] || null;

    let query = `
			SELECT DISTINCT
				p.ProductID,
				p.PartNumber,
				p.ProductName,
				p.Instructions,
				p.ImageSmall,
				p.CatID,
				GROUP_CONCAT(DISTINCT c.CatName ORDER BY c.CatName SEPARATOR ', ') as CategoryNames,
				GROUP_CONCAT(DISTINCT CONCAT(m.MainCatName, ' - ', c.CatName) ORDER BY m.MainCatName, c.CatName SEPARATOR ', ') as FullCategoryNames
			FROM products p
			LEFT JOIN categories c ON FIND_IN_SET(c.CatID, p.CatID) > 0
			LEFT JOIN maincategories m ON c.MainCatID = m.MainCatID
			WHERE (EXISTS (SELECT 1 FROM product_platforms pp WHERE pp.ProductID = p.ProductID AND pp.BodyID = ?) OR p.BodyID = ?)
				AND p.Display = 1
				AND p.Instructions IS NOT NULL
				AND p.Instructions != ''
				AND p.Instructions != '0'
		`;

    const params = [platform, platform];

    if (category) {
      query += ` AND FIND_IN_SET(?, p.CatID) > 0`;
      params.push(category);
    }

    query += ` GROUP BY p.ProductID, p.PartNumber, p.ProductName, p.Instructions, p.ImageSmall, p.CatID ORDER BY p.PartNumber`;

    const [rows] = await pool.query(query, params);

    // Attach platform info to each product
    const products = rows.map((product) => ({
      ...product,
      PlatformName: platformInfo
        ? `${platformInfo.StartYear !== "0" && platformInfo.EndYear !== "0" ? `${platformInfo.StartYear}-${platformInfo.EndYear} ` : ""}${platformInfo.Name}`
        : null,
      PlatformStartYear: platformInfo?.StartYear || null,
      PlatformEndYear: platformInfo?.EndYear || null,
    }));

    return NextResponse.json({ products, platformInfo });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
