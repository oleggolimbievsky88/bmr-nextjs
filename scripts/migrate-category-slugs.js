const mysql = require("mysql2/promise");

async function addCategorySlugs() {
  // Use the same environment variables as your existing db.js
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "bmrsuspension",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    console.log("Adding CatSlug column...");

    // Add the column if it doesn't exist
    await pool.execute(`
      ALTER TABLE categories
      ADD COLUMN IF NOT EXISTS CatSlug VARCHAR(255) NOT NULL DEFAULT ''
    `);

    console.log("Generating slugs from category names...");

    // Generate slugs from existing category names
    await pool.execute(`
      UPDATE categories
      SET CatSlug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
          CatName,
          ' ', '-'),
          '&', 'and'),
          '/', '-'),
          '(', ''),
          ')', ''),
          ',', ''),
          '.', ''),
          "'", ''),
          '"', ''),
          '--', '-'))
      WHERE CatSlug = '' OR CatSlug IS NULL
    `);

    console.log("Checking for duplicate slugs...");

    // Check for duplicates
    const [duplicates] = await pool.execute(`
      SELECT CatSlug, COUNT(*) as count, GROUP_CONCAT(CatID) as cat_ids, GROUP_CONCAT(CatName) as names
      FROM categories
      WHERE CatSlug != ''
      GROUP BY CatSlug
      HAVING COUNT(*) > 1
    `);

    if (duplicates.length > 0) {
      console.log("Found duplicate slugs:");
      duplicates.forEach((dup) => {
        console.log(`- Slug: "${dup.CatSlug}" (${dup.count} occurrences)`);
        console.log(`  Categories: ${dup.names}`);
        console.log(`  IDs: ${dup.cat_ids}`);
      });

      // Handle duplicates by appending category ID
      console.log("Resolving duplicates by appending category ID...");
      for (const dup of duplicates) {
        const catIds = dup.cat_ids.split(",");
        // Keep the first one as-is, append ID to others
        for (let i = 1; i < catIds.length; i++) {
          const catId = catIds[i];
          await pool.execute(
            `
            UPDATE categories
            SET CatSlug = CONCAT(?, '-', ?)
            WHERE CatID = ?
          `,
            [dup.CatSlug, catId, catId]
          );
        }
      }
    }

    console.log("Migration completed successfully!");

    // Show some sample results
    const [samples] = await pool.execute(`
      SELECT CatID, CatName, CatSlug
      FROM categories
      WHERE CatSlug != ''
      LIMIT 10
    `);

    console.log("\nSample categories with slugs:");
    samples.forEach((cat) => {
      console.log(`- ${cat.CatName} -> ${cat.CatSlug} (ID: ${cat.CatID})`);
    });
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

addCategorySlugs();
