// app/api/related-products/route.js

import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    try {
      const [productRows] = await pool.query(
        `SELECT BodyID, CatID FROM products WHERE ProductID = ?`,
        [productId],
      );

      if (!productRows || productRows.length === 0) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      const product = productRows[0];

      // Resolve all platform IDs for this product (multi-platform support)
      const [ppRows] = await pool
        .query(`SELECT BodyID FROM product_platforms WHERE ProductID = ?`, [
          productId,
        ])
        .catch(() => [[]]);
      const bodyIds =
        Array.isArray(ppRows) && ppRows.length > 0
          ? ppRows.map((r) => r.BodyID)
          : product.BodyID
            ? [product.BodyID]
            : [];

      if (bodyIds.length === 0) {
        return NextResponse.json({ products: [] });
      }

      const categoryIds = product.CatID
        ? product.CatID.split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        : [];

      if (categoryIds.length === 0) {
        return NextResponse.json({ products: [] });
      }

      const categoryConditions = categoryIds
        .map(() => `FIND_IN_SET(?, p.CatID)`)
        .join(" OR ");
      const inPlaceholders = bodyIds.map(() => "?").join(",");

      const [rows] = await pool.query(
        `SELECT p.*,
               CONCAT(b.StartYear, '-', b.EndYear) AS YearRange,
               b.Name AS PlatformName,
               c.CatName AS CategoryName
        FROM products p
        JOIN bodies b ON p.BodyID = b.BodyID
        LEFT JOIN categories c ON FIND_IN_SET(c.CatID, p.CatID)
        WHERE (EXISTS (SELECT 1 FROM product_platforms pp WHERE pp.ProductID = p.ProductID AND pp.BodyID IN (${inPlaceholders})) OR p.BodyID IN (${inPlaceholders}))
          AND (${categoryConditions})
          AND p.ProductID != ?
          AND p.Display = 1
        LIMIT 4`,
        [...bodyIds, ...bodyIds, ...categoryIds, productId],
      );

      return NextResponse.json({ products: rows });
    } catch (error) {
      console.error(
        `Failed to fetch related products for product ${productId}:`,
        error,
      );
      return NextResponse.json(
        { error: "Failed to fetch related products" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
