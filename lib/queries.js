// lib/queries.js

import pool from "./db"; // Import MySQL connection pool

// Get all products
export async function getAllProducts() {
  const [rows] = await pool.query('SELECT * FROM products WHERE Display = "1"');
  return rows;
}

// Get new products
export async function getNewProducts() {
  const [rows] = await pool.query(`
    SELECT * FROM bmrsuspension.products
    WHERE NewPartDate != "0" and NewPart = "1"
    ORDER BY NewPartDate desc
    LIMIT 8
  `);
  return rows;
}

//  Get platform by platform ID
export async function getPlatformById(platformId) {
  const [rows] = await pool.query(
    'SELECT * FROM bodies WHERE BodyID = ?',
    [platformId]
  );
  return rows;
}

//  Get vehicles by platform ID
export async function getVehiclesByPlatformId(platformId) {
  const [rows] = await pool.query(
    'SELECT * FROM vehicles WHERE BodyID = ?',
    [platformId]
  );
  return rows;
}


//  Get products by platform ID
export async function getProductsByPlatformId(platformId) {
  const [rows] = await pool.query(
   `SELECT products.BodyID, bodies.* 
     FROM products 
     JOIN bodies ON products.BodyID = bodies.BodyID 
     WHERE products.BodyID = ? AND products.Display = "1"`,
    [platformId]
  );
  return rows;
}


// Get main categories
export async function getMainCategories(mainCatId) {
  const [rows] = await pool.query(
    'SELECT * FROM maincategories WHERE MainCatID = ?',
    [mainCatId]
  );
  return rows;
}


// Get categories by catId
export async function getCategoriesByCatId(catId) {
  const [rows] = await pool.query(
    `SELECT CatID, MainCatID, CatName, CatImage 
     FROM categories 
     WHERE CatID = ? 
     ORDER BY CatName`,
    [catId]
  );
  return rows;
}

//Get categories by platform ID
export async function getCategories(platformId) {
  const [rows] = await pool.query(
    'SELECT * FROM categories WHERE MainCatID = ? AND ParentID = "0" ORDER BY CatName',
    [platformId]
  );
  return rows;
}

// 4. Get one product per category by platform ID
export async function getOneProductPerCategoryByPlatformId(platformId) {
  const [rows] = await pool.query(
    `SELECT * FROM products p
     WHERE p.ProductID IN (
       SELECT MIN(ProductID)
       FROM products
       WHERE BodyID = ? AND Display = "1"
       GROUP BY CatID
     )`,
    [platformId]
  );
  return rows;
}

// Get product by ID
export async function getProductById(id) {
  const [rows] = await pool.query(
    "SELECT * FROM products WHERE ProductID = ? and Display = '1'",
    [id]
  );

  if (rows.length === 0) {
    throw new Error("Product not found");
  }

  return rows[0]; // Return the first product found
}
