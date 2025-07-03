// app/api/products/route.js
export const dynamic = "force-dynamic";
import pool from "@/lib/db";
import { NextResponse } from "next/server";
import {
  getFilteredProducts,
  getNewProducts,
  getFilteredProductsPaginated,
} from "@/lib/queries";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mainCategoryId = searchParams.get("mainCategoryId");
  const subCategoryId = searchParams.get("subCategoryId");
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const color = searchParams.get("color");
  const brand = searchParams.get("brand");

  // 1. Special case: scratchDent
  if (searchParams.has("scratchDent")) {
    const newProducts = await getNewProducts(searchParams.get("scratchDent"));
    return NextResponse.json(
      limit ? newProducts.slice(0, parseInt(limit)) : newProducts
    );
  }

  // 2. If any filter/pagination param is present, use the new paginated/filterable query
  if (page || minPrice || maxPrice || color || brand) {
    const products = await getFilteredProductsPaginated({
      mainCategoryId,
      subCategoryId,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 12,
      minPrice,
      maxPrice,
      color,
      brand,
    });
    return NextResponse.json(products);
  }

  // 3. Your existing queries
  let products;
  if (mainCategoryId && subCategoryId) {
    // ... your existing query for main and sub category
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
      WHERE p.Display = 1 AND mc.MainCatID = ? AND c.CatID = ?
      LIMIT ${limit || 100}
    `,
      [mainCategoryId, subCategoryId]
    );
    products = rows;
  } else if (mainCategoryId) {
    // ... your existing query for main category
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
      WHERE p.Display = 1 AND mc.MainCatID = ?
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
    products = products.slice(0, parseInt(limit));
  }

  return NextResponse.json(products);
}
