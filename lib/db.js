// lib/db.ts

import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "Amelia1",
  database: process.env.MYSQL_DATABASE || "bmrsuspension",
  waitForConnections: true,
  connectionLimit: 10, // Reduced from default
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds
  acquireTimeout: 10000, // 10 seconds
  timeout: 10000, // 10 seconds
  reconnect: true,
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

export { testConnection };
export default pool;
