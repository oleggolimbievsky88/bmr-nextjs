const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

const CREATE_TABLES = `
-- Create new tables
CREATE TABLE IF NOT EXISTS product_variant (
    variant_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    part_number VARCHAR(100) NOT NULL,
    color ENUM('RED', 'BLACK_HAMMERTONE') NOT NULL,
    price DECIMAL(10,2),
    FOREIGN KEY (product_id) REFERENCES products(ProductID)
);

CREATE TABLE IF NOT EXISTS digital_asset (
    asset_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    variant_id INT UNSIGNED,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    asset_type ENUM('PRIMARY', 'GALLERY', 'THUMBNAIL') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES product_variant(variant_id)
);

CREATE TABLE IF NOT EXISTS product_attributes (
    attribute_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    variant_id INT UNSIGNED NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value VARCHAR(255) NOT NULL,
    FOREIGN KEY (variant_id) REFERENCES product_variant(variant_id)
);`;

const INSERT_VARIANTS = `
INSERT INTO product_variant (product_id, part_number, color, price)
SELECT
    ProductID,
    CONCAT(PartNumber, 'R') as part_number,
    'RED' as color,
    CAST(Price AS DECIMAL(10,2)) as price
FROM products
WHERE Color = '1,2' AND BodyID = 37
UNION ALL
SELECT
    ProductID,
    CONCAT(PartNumber, 'H') as part_number,
    'BLACK_HAMMERTONE' as color,
    CAST(Price AS DECIMAL(10,2)) as price
FROM products
WHERE Color = '1,2' AND BodyID = 37;`;

const INSERT_RED_ASSETS = `
INSERT INTO digital_asset (variant_id, file_name, file_path, file_type, asset_type)
SELECT
    pv.variant_id,
    CONCAT(p.PartNumber, 'R.jpg') as file_name,
    CONCAT('/images/products/', p.PartNumber, 'R.jpg') as file_path,
    'JPG' as file_type,
    'PRIMARY' as asset_type
FROM product_variant pv
JOIN products p ON p.ProductID = pv.product_id
WHERE pv.color = 'RED';`;

const INSERT_RED_GALLERY = `
INSERT INTO digital_asset (variant_id, file_name, file_path, file_type, asset_type)
SELECT
    pv.variant_id,
    CONCAT(p.PartNumber, 'R_', n.num, '.jpg') as file_name,
    CONCAT('/images/products/', p.PartNumber, 'R_', n.num, '.jpg') as file_path,
    'JPG' as file_type,
    'GALLERY' as asset_type
FROM product_variant pv
JOIN products p ON p.ProductID = pv.product_id
CROSS JOIN (
    SELECT 2 as num UNION SELECT 3 UNION SELECT 4 UNION
    SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION
    SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
    SELECT 11 UNION SELECT 12
) n
WHERE pv.color = 'RED';`;

const INSERT_BLACK_ASSETS = `
INSERT INTO digital_asset (variant_id, file_name, file_path, file_type, asset_type)
SELECT
    pv.variant_id,
    CONCAT(p.PartNumber, 'H.jpg') as file_name,
    CONCAT('/images/products/', p.PartNumber, 'H.jpg') as file_path,
    'JPG' as file_type,
    'PRIMARY' as asset_type
FROM product_variant pv
JOIN products p ON p.ProductID = pv.product_id
WHERE pv.color = 'BLACK_HAMMERTONE';`;

const INSERT_BLACK_GALLERY = `
INSERT INTO digital_asset (variant_id, file_name, file_path, file_type, asset_type)
SELECT
    pv.variant_id,
    CONCAT(p.PartNumber, 'H_', n.num, '.jpg') as file_name,
    CONCAT('/images/products/', p.PartNumber, 'H_', n.num, '.jpg') as file_path,
    'JPG' as file_type,
    'GALLERY' as asset_type
FROM product_variant pv
JOIN products p ON p.ProductID = pv.product_id
CROSS JOIN (
    SELECT 2 as num UNION SELECT 3 UNION SELECT 4 UNION
    SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION
    SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
    SELECT 11 UNION SELECT 12
) n
WHERE pv.color = 'BLACK_HAMMERTONE';`;

const INSERT_ATTRIBUTES = `
INSERT INTO product_attributes (variant_id, attribute_name, attribute_value)
SELECT
    pv.variant_id,
    'Color',
    pv.color
FROM product_variant pv;`;

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: true,
  });

  try {
    console.log("Starting database migration...");

    // Execute statements in sequence
    console.log("Creating tables...");
    await connection.query(CREATE_TABLES);

    console.log("Inserting product variants...");
    await connection.query(INSERT_VARIANTS);

    console.log("Inserting red variant assets...");
    await connection.query(INSERT_RED_ASSETS);
    await connection.query(INSERT_RED_GALLERY);

    console.log("Inserting black variant assets...");
    await connection.query(INSERT_BLACK_ASSETS);
    await connection.query(INSERT_BLACK_GALLERY);

    console.log("Inserting product attributes...");
    await connection.query(INSERT_ATTRIBUTES);

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the migration
runMigration().catch(console.error);
