#!/usr/bin/env node
/**
 * Delete $10 placeholder hardware pack(s).
 * Run: node scripts/delete-hardware-pack-placeholder.js
 * Or by ID: node scripts/delete-hardware-pack-placeholder.js 1234
 */

import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "Amelia1",
  database: process.env.MYSQL_DATABASE || "bmrsuspension",
});

async function main() {
  const idArg = process.argv[2];
  let rows;

  if (idArg) {
    const id = parseInt(idArg, 10);
    if (Number.isNaN(id)) {
      console.error("Invalid ProductID:", idArg);
      process.exit(1);
    }
    [rows] = await pool.query(
      "SELECT ProductID, ProductName, PartNumber, Price FROM products WHERE ProductID = ? AND hardwarepack = 1",
      [id],
    );
  } else {
    [rows] = await pool.query(
      `SELECT ProductID, ProductName, PartNumber, Price
       FROM products
       WHERE hardwarepack = 1
         AND (
           CAST(Price AS DECIMAL(10,2)) = 10
           OR LOWER(ProductName) LIKE '%placeholder%'
         )`,
    );
  }

  if (!rows.length) {
    console.log("No $10 or placeholder hardware packs found.");
    await pool.end();
    return;
  }

  const ids = rows.map((r) => r.ProductID);
  console.log("Found hardware pack(s) to delete:", rows);

  // Remove these IDs from products.hardwarepacks
  const [productsWithPacks] = await pool.query(
    `SELECT ProductID, hardwarepacks FROM products
     WHERE hardwarepacks IS NOT NULL AND hardwarepacks != '' AND hardwarepacks != '0'`,
  );

  for (const p of productsWithPacks) {
    const packIds = String(p.hardwarepacks)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const remaining = packIds.filter((id) => !ids.includes(String(id)));
    const newVal = remaining.length ? remaining.join(",") : "0";
    if (newVal !== String(p.hardwarepacks)) {
      await pool.query(
        "UPDATE products SET hardwarepacks = ? WHERE ProductID = ?",
        [newVal, p.ProductID],
      );
      console.log(
        `Updated product ${p.ProductID} hardwarepacks: ${p.hardwarepacks} -> ${newVal}`,
      );
    }
  }

  // Delete the placeholder pack(s)
  const placeholders = ids.map(() => "?").join(",");
  await pool.query(
    `DELETE FROM products WHERE ProductID IN (${placeholders}) AND hardwarepack = 1`,
    ids,
  );
  console.log(`Deleted ${ids.length} hardware pack(s): ${ids.join(", ")}`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
