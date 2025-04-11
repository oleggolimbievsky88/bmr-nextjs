const mysql = require("mysql2/promise");

async function testConnection() {
  const connection = await mysql.createConnection({
    host: "131.153.149.105",
    user: "nextjsapi",
    password: "DeepVase2024!",
    database: "bmrsuspension",
  });

  console.log("Connected to MySQL database!");

  // Test query
  const [rows] = await connection.execute(
    "SELECT COUNT(*) as count FROM bodies"
  );
  console.log("Number of bodies in database:", rows[0].count);

  // Test query for main categories
  const [mainCategories] = await connection.execute(
    "SELECT COUNT(*) as count FROM maincategories"
  );
  console.log(
    "Number of main categories in database:",
    mainCategories[0].count
  );

  // Test query for categories
  const [categories] = await connection.execute(
    "SELECT COUNT(*) as count FROM categories"
  );
  console.log("Number of categories in database:", categories[0].count);

  // Test query for products
  const [products] = await connection.execute(
    "SELECT COUNT(*) as count FROM products"
  );
  console.log("Number of products in database:", products[0].count);

  connection.end();
}

testConnection()
  .then(() => console.log("Test completed successfully"))
  .catch((err) => console.error("Database connection test failed:", err));
