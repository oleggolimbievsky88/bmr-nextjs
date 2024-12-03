// lib/queries.js

import pool from "./db"; // Import MySQL connection pool

// Get all products
async function getAllProducts() {
  const [rows] = await pool.query('SELECT * FROM products WHERE Display = "1"');
  return rows;
}

// Get new products
async function getNewProducts() {
  const [rows] = await pool.query(`
    SELECT * FROM bmrsuspension.products
    WHERE NewPartDate != "0" and NewPart = "1"
    ORDER BY NewPartDate desc
    LIMIT 8
  `);
  return rows;
}

//  Get products by platform ID
async function getProductsByPlatformId(platformId) {
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE BodyID = ? AND Display = "1"',
    [platformId]
  );
  return rows;
}


// Get main categories
async function getMainCategories(mainCatId) {
  const [rows] = await pool.query(
    'SELECT * FROM maincategories WHERE MainCatID = ?',
    [mainCatId]
  );
  return rows;
}


// Get categories by catId
async function getCategoriesByCatId(catId) {
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
async function getCategories(platformId) {
  const [rows] = await pool.query(
    'SELECT * FROM maincategories WHERE BodyID = ? ORDER BY MainCatName',
    [platformId]
  );
  return rows;
}

// 4. Get one product per category by platform ID
async function getOneProductPerCategoryByPlatformId(platformId) {
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

// Add this with your other queries
async function getBodies() {
  const [rows] = await pool.query('SELECT * FROM bodies ORDER BY BodyOrder');
  return rows;
}

// Get product by ID
async function getProductById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE ProductID = ?',
    [id]
  );

  if (rows.length === 0) {
    throw new Error("Product not found");
  }

  return rows[0]; // Return the first product found
}

// Single export statement for all functions
export {
  getAllProducts,
  getNewProducts,
  getProductsByPlatformId,
  getMainCategories,
  getCategoriesByCatId,
  getCategories,
  getOneProductPerCategoryByPlatformId,
  getProductById,
  getBodies
};