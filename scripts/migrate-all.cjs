const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function migrateAll() {
  let connection;
  try {
    // 1. Connect to old database
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Amelia1",
      database: "bmrsuspension",
    });

    // 2. Get all data
    console.log("Fetching data from old database...");
    const [categories] = await connection.execute("SELECT * FROM categories");
    const [platforms] = await connection.execute("SELECT * FROM bodies");
    const [products] = await connection.execute(
      "SELECT * FROM products WHERE Display = 1 AND EndProduct != 1"
    );
    const [vehicles] = await connection.execute("SELECT * FROM vehicles");

    const [manufacturers] = await connection.execute(
      "SELECT * FROM manufacturers"
    );
    // 3. Connect to new database
    await connection.end();
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Amelia1",
      database: "bmr_db",
    });

    // 4. Import categories
    console.log("\nImporting categories...");
    for (const cat of categories) {
      try {
        await connection.execute(
          `INSERT INTO categories (
            id, name, slug, parent_id, attributes,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            cat.CatID,
            cat.CatName,
            cat.CatName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            cat.ParentID > 0 ? cat.ParentID : null,
            JSON.stringify({
              oldImage: cat.CatImage || null,
              mainCatId: cat.MainCatID || null,
            }),
          ]
        );
        console.log(`✓ Imported category: ${cat.CatName}`);
      } catch (error) {
        console.error(
          `✗ Failed to import category ${cat.CatName}:`,
          error.message
        );
      }
    }

    // 5. Import platforms
    console.log("\nImporting platforms...");
    for (const platform of platforms) {
      try {
        await connection.execute(
          `INSERT INTO platforms (
            id, name, start_year, end_year, image, header_image, 
            \`order\`, category_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            platform.BodyID,
            platform.Name,
            parseInt(platform.StartYear) || 0,
            parseInt(platform.EndYear) || 0,
            platform.Image || null,
            platform.HeaderImage || null,
            platform.BodyOrder || 0,
            platform.BodyCatID ? parseInt(platform.BodyCatID) : null,
          ]
        );
        console.log(`✓ Imported platform: ${platform.Name}`);
      } catch (error) {
        console.error(
          `✗ Failed to import platform ${platform.Name}:`,
          error.message
        );
      }
    }

    // 6. Import products
    console.log("\nImporting products...");
    for (const product of products) {
      try {
        // Check if category exists
        const categoryId = parseInt(product.CatID) || null;
        if (categoryId) {
          const [categoryExists] = await connection.execute(
            "SELECT id FROM categories WHERE id = ?",
            [categoryId]
          );

          if (!categoryExists.length) {
            console.log(
              `⚠️ Skipping product ${product.ProductName}: Category ${categoryId} not found`
            );
            continue;
          }
        }

        await connection.execute(
          `INSERT INTO products (
            id, part_number, name, description_short, description_long, 
            features, instructions, category_id, platform_id, 
            is_new, is_active, is_blem, attributes,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            product.ProductID,
            product.PartNumber,
            product.ProductName,
            product.Description || null,
            product.Features || null,
            product.Features || null,
            product.Instructions || null,
            categoryId,
            product.BodyID || null,
            Boolean(product.NewPart),
            Boolean(product.Display),
            Boolean(product.BlemProduct),
            JSON.stringify({
              oldData: {
                imageSmall: product.ImageSmall || null,
                imageLarge: product.ImageLarge || null,
                images: product.Images || null,
                newPartDate: product.NewPartDate || null,
                manufacturerId: product.ManID || null,
              },
            }),
          ]
        );
        console.log(`✓ Imported product: ${product.ProductName}`);
      } catch (error) {
        console.error(
          `✗ Failed to import product ${product.ProductName}:`,
          error.message
        );
      }
    }

    console.log("\n✓ Migration completed successfully!");
  } catch (error) {
    console.error("\n✗ Migration failed:", error);
  } finally {
    if (connection) await connection.end();
  }
}

migrateAll().catch(console.error);
