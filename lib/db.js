// lib/db.ts

import mysql from "mysql2/promise";

let pool;

try {
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            rejectUnauthorized: true,
          }
        : false,
  });
} catch (error) {
  console.error("Failed to create MySQL pool:", error);
}

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

export { testConnection };
export default pool;
