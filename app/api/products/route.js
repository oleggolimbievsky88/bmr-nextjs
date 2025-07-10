// app/api/products/route.js
export const dynamic = "force-dynamic";
import pool from "@/lib/db";
import { NextResponse } from "next/server";
import {
  getFilteredProducts,
  getNewProducts,
  getFilteredProductsPaginated,
  getPlatformBySlug,
  getMainCategoryIdBySlugAndPlatform,
  getCategoryIdBySlugAndMainCat,
} from "@/lib/queries";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mainCategoryId = searchParams.get("mainCategoryId");
    const subCategoryId = searchParams.get("subCategoryId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const offset = (page - 1) * limit;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return NextResponse.json({ error: "Invalid page or limit" }, { status: 400 });
    }

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const color = searchParams.get("color");
    const brand = searchParams.get("brand");
    // New: Accept slugs for SEO-friendly URLs
    const platformSlug = searchParams.get("platformSlug");
    const mainCategorySlug = searchParams.get("mainCategorySlug");
    const categorySlug = searchParams.get("categorySlug");

    let resolvedMainCategoryId = mainCategoryId;
    let resolvedSubCategoryId = subCategoryId;

    // If slugs are provided, resolve them to IDs
    if (platformSlug && mainCategorySlug) {
      // 1. Get MainCatID from platformSlug and mainCategorySlug
      resolvedMainCategoryId = await getMainCategoryIdBySlugAndPlatform(
        platformSlug,
        mainCategorySlug
      );
    }
    if (resolvedMainCategoryId && categorySlug) {
      // 2. Get CatID from mainCategoryId and categorySlug
      resolvedSubCategoryId = await getCategoryIdBySlugAndMainCat(
        resolvedMainCategoryId,
        categorySlug
      );
    }

    // 1. Special case: scratchDent
    if (searchParams.has("scratchDent")) {
      const newProducts = await getNewProducts(searchParams.get("scratchDent"));
      return NextResponse.json(
        limit ? newProducts.slice(0, parseInt(limit)) : newProducts
      );
    }

    // 2. If any filter/pagination param is present, use the new paginated/filterable query
    if (
      page ||
      minPrice ||
      maxPrice ||
      color ||
      brand ||
      resolvedMainCategoryId ||
      resolvedSubCategoryId
    ) {
      const products = await getFilteredProductsPaginated({
        mainCategoryId: resolvedMainCategoryId,
        subCategoryId: resolvedSubCategoryId,
        page: page,
        limit: limit,
        offset: offset,
        minPrice,
        maxPrice,
        color,
        brand,
      });
      return NextResponse.json(products);
    }

    // 3. Your existing queries
    let products;
    if (resolvedMainCategoryId && resolvedSubCategoryId) {
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
      LIMIT ${limit} OFFSET ${offset}
    `,
        [resolvedMainCategoryId, resolvedSubCategoryId]
      );
      products = rows;
    } else if (resolvedMainCategoryId) {
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
        [resolvedMainCategoryId]
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
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
