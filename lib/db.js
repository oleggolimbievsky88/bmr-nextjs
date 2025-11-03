// lib/db.js

import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "Amelia1",
  database: process.env.MYSQL_DATABASE || "bmrsuspension",
  waitForConnections: true,
  connectionLimit: 5, // Reduced for Vercel
  queueLimit: 0,
  connectTimeout: 60000, // Timeout for establishing connection
  ssl: process.env.MYSQL_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Function to test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connection successful");
    connection.release();
    return true;
  } catch (error) {
    console.error("Error connecting to the database:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
    });
    return false;
  }
}

// Add error event listener to the pool
pool.on("error", (err) => {
  console.error("Unexpected database pool error:", {
    message: err.message,
    code: err.code,
    errno: err.errno,
    sqlState: err.sqlState,
    sqlMessage: err.sqlMessage,
  });
});

// Query function for executing SQL queries
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("Database query error:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      sql: sql,
      params: params,
    });
    throw error;
  }
}

export { testConnection, query };
export default pool;
