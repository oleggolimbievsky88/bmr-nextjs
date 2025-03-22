// app/api/products/route.js
export const dynamic = "force-dynamic";
import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { getFilteredProducts, getNewProducts } from "@/lib/queries";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mainCategoryId = searchParams.get("mainCategoryId");
    const subCategoryId = searchParams.get("subCategoryId");
    const scratchDent = searchParams.get("scratchDent") || "0";
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit"))
      : null;

    // Check if we need to get new products
    if (searchParams.has("scratchDent")) {
      const newProducts = await getNewProducts(scratchDent);
      // Apply limit if specified
      return NextResponse.json(
        limit ? newProducts.slice(0, limit) : newProducts
      );
    }

    // Use existing query method from queries.js if possible
    let products;
    if (mainCategoryId && subCategoryId) {
      // Specific query for main and sub category
      // TODO: Add limit to this query
      
      const [rows] = await pool.query(
        `
        SELECT
          p.ProductID,
          p.ProductName,
          p.Description,
          p.Price,
          p.ImageSmall,
          p.ImageLarge,
          p.Color,
          m.ManName,
          c.CatName,
          mc.MainCatName
        FROM products p
        LEFT JOIN mans m ON p.ManID = m.ManID
        LEFT JOIN categories c ON p.CatID = c.CatID
        LEFT JOIN maincategories mc ON c.MainCatID = mc.MainCatID
        WHERE mc.MainCatID = ? AND c.CatID = ?
      `,
        [mainCategoryId, subCategoryId]
      );
      products = rows;
    } else if (mainCategoryId) {
      // Query for main category
      const [rows] = await pool.query(
        `
        SELECT
          p.ProductID,
          p.ProductName,
          p.Description,
          p.Price,
          p.ImageSmall,
          p.ImageLarge,
          p.Color,
          m.ManName,
          c.CatName,
          mc.MainCatName
        FROM products p
        LEFT JOIN mans m ON p.ManID = m.ManID
        LEFT JOIN categories c ON p.CatID = c.CatID
        LEFT JOIN maincategories mc ON c.MainCatID = mc.MainCatID
        WHERE mc.MainCatID = ?
      `,
        [mainCategoryId]
      );
      products = rows;
    } else {
      // Fallback to all products
      products = await getFilteredProducts();
    }

    // Apply limit if specified
    if (limit && Array.isArray(products)) {
      products = products.slice(0, limit);
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
