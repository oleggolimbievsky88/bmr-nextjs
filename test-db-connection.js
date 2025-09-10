// Test database connection directly
const mysql = require("mysql2/promise");

async function testDBConnection() {
  try {
    console.log("Testing database connection...");

    // Create a new connection
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "localhost",
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "Amelia1",
      database: process.env.MYSQL_DATABASE || "bmrsuspension",
    });

    console.log("Database connection successful");

    // Test coupon query
    const [rows] = await connection.query(
      "SELECT CouponID, CouponName, Value, ValueType FROM coupons WHERE CouponCode = ?",
      ["PEACOCK7"]
    );
    console.log("Coupon query result:", rows);

    await connection.end();
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

testDBConnection();
