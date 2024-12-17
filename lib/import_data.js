import mysql from "mysql2/promise";
import { promises as fs } from "fs";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Amelia1",
  database: "ecommerce",
};

async function importData() {
  try {
    const rawData = await fs.readFile("products.json", "utf8");
    const products = JSON.parse(rawData);
    const connection = await mysql.createConnection(dbConfig);

    // Insert PlatformCategory
    await connection.execute(
      'INSERT IGNORE INTO PlatformCategory (id, name) VALUES (1, "Default")'
    );

    // Insert Platform
    for (const product of products) {
      if (product.Platform && product.Title) {
        // Only process main product entries
        const platformParts = product.Platform.match(/(\d{4})-(\d{4})\s+(.+)/);
        if (platformParts) {
          await connection.execute(
            `INSERT IGNORE INTO Platform (
              name, startYear, endYear, categoryId
            ) VALUES (?, ?, ?, ?)`,
            [
              product.Platform,
              parseInt(platformParts[1]),
              parseInt(platformParts[2]),
              1,
            ]
          );
        }
      }
    }

    // Insert Category
    await connection.execute(
      `INSERT IGNORE INTO Category (name, slug) VALUES (?, ?)`,
      ["Suspension", "suspension"]
    );

    // Process each product
    for (const product of products) {
      if (!product.Title) continue; // Skip variant entries

      // Get platform ID
      const [platformRows] = await connection.execute(
        "SELECT id FROM Platform WHERE name = ?",
        [product.Platform]
      );

      // Get category ID
      const [categoryRows] = await connection.execute(
        "SELECT id FROM Category WHERE name = ?",
        ["Suspension"]
      );

      // Insert main product
      const [productResult] = await connection.execute(
        `INSERT INTO Product (
          partNumber,
          name,
          description,
          features,
          platformId,
          categoryId,
          isActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          product["Part Number"],
          product.Title,
          product["Body (HTML)"],
          product.Features,
          platformRows[0]?.id,
          categoryRows[0]?.id,
          product.Published ? 1 : 0,
        ]
      );

      const productId = productResult.insertId;

      // Insert variants
      const variants = products.filter(
        (p) => p["Part Number"] === product["Part Number"] && p["Variant SKU"]
      );
      for (const variant of variants) {
        if (variant["Variant SKU"]) {
          await connection.execute(
            `INSERT IGNORE INTO ProductVariant (
              productId,
              sku,
              color,
              price,
              weight,
              stockQuantity,
              isActive
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              productId,
              variant["Variant SKU"],
              variant["Option1 Value"],
              parseFloat(variant["Variant Price"]) || 0,
              parseFloat(variant.Weight) || 0,
              parseInt(variant["Variant Inventory Qty"]) || 0,
              1,
            ]
          );
        }
      }

      // Insert digital assets (images)
      for (const variant of variants) {
        if (variant["Image Src"]) {
          await connection.execute(
            `INSERT INTO DigitalAsset (
              productId,
              fileName,
              assetType,
              fileType
            ) VALUES (?, ?, ?, ?)`,
            [productId, variant["Image Src"], "IMG", "JPG"]
          );
        }
      }
    }

    await connection.end();
    console.log("Import completed successfully!");
  } catch (error) {
    console.error("Error during import:", error);
    process.exit(1);
  }
}

importData().catch(console.error);
