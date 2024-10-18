// lib/queries.js

import pool from './db'; // Import MySQL connection pool

// Get all products
export async function getAllProducts() {
  const [rows] = await pool.query('SELECT * FROM products WHERE Display = "1"');
  return rows;
}

// Get new products (e.g., added in the last 30 days)
export async function getNewProducts() {
  const [rows] = await pool.query(`
    SELECT * FROM bmrsuspension.products
    WHERE NewPartDate != "0" and NewPart = "1"
    ORDER BY NewPartDate desc
    LIMIT 50
  `);
  return rows;
}

// 3. Get products by platform ID
export async function getProductsByPlatformId(platformId) {
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE BodyID = ? AND Display = "1"',
    [platformId]
  );
  return rows;
}

// Get product by ID
export async function getProductById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE ProductID = ?',
      [id]
    );
  
    if (rows.length === 0) {
      throw new Error('Product not found');
    }
  
    return rows[0]; // Return the first product found
  }
