/**
 * Quick script to show products table structure.
 * Run: node scripts/check-products-schema.cjs
 */
const mysql = require("mysql2/promise");

async function main() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "bmrsuspension",
  });

  try {
    const [rows] = await pool.query("DESCRIBE products");
    console.log("products table columns:");
    rows.forEach((r, i) => console.log(`  ${i + 1}. ${r.Field} (${r.Type})`));
    console.log("\nTotal columns:", rows.length);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
