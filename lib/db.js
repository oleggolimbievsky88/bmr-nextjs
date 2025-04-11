// lib/db.ts

import mysql from "mysql2/promise";

// Log database connection parameters (except password) for debugging
console.log("Database connection parameters:", {
  host: process.env.MYSQL_HOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQL_USER || process.env.DB_USER || "root",
  database:
    process.env.MYSQL_DATABASE || process.env.DB_NAME || "bmrsuspension",
  passwordSet: Boolean(process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD),
});

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQL_USER || process.env.DB_USER || "root",
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "",
  database:
    process.env.MYSQL_DATABASE || process.env.DB_NAME || "bmrsuspension",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connection successful");
    connection.release();
    return true;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    return false;
  }
}

// Query function
export async function mcp_MySQL_MCP_query(sql, params = []) {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Execute function for non-SELECT queries
export async function mcp_MySQL_MCP_execute(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("Database execute error:", error);
    throw error;
  }
}

export { testConnection };
export default pool;
