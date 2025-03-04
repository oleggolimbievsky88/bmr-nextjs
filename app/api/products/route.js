// app/api/products/route.js
export const dynamic = 'force-dynamic'
import pool from "@/lib/db";
import { NextResponse } from 'next/server';
import { getFilteredProducts } from "@/lib/queries";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mainCategoryId = searchParams.get('mainCategoryId');
    const subCategoryId = searchParams.get('subCategoryId');

    // Use existing query method from queries.js if possible
    let products;
    if (mainCategoryId && subCategoryId) {
      // Specific query for main and sub category
      const [rows] = await pool.query(`
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
      `, [mainCategoryId, subCategoryId]);
      products = rows;
    } else if (mainCategoryId) {
      // Query for main category
      const [rows] = await pool.query(`
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
      `, [mainCategoryId]);
      products = rows;
    } else {
      // Fallback to all products
      products = await getFilteredProducts();
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' }, 
      { status: 500 }
    );
  }
}
