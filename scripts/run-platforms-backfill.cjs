#!/usr/bin/env node
/**
 * Backfill platforms table from bodies.
 * Run this if you have data in bodies that is not yet in platforms.
 * Usage: node scripts/run-platforms-backfill.cjs
 */
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2/promise");

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const eq = line.indexOf("=");
      if (eq > 0 && !line.startsWith("#")) {
        const k = line.slice(0, eq).trim();
        let v = line.slice(eq + 1).trim();
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1);
        }
        process.env[k] = v;
      }
    });
}

async function run() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "bmrsuspension",
  });

  try {
    const [rows] = await pool.query(`
      INSERT INTO platforms (
        PlatformID, Name, StartYear, EndYear, Image, PlatformOrder,
        BodyCatID, HeaderImage, slug
      )
      SELECT
        b.BodyID, b.Name, b.StartYear, b.EndYear, b.Image, COALESCE(b.BodyOrder, 0),
        COALESCE(b.platform_group_id, b.BodyCatID, 0), COALESCE(b.HeaderImage, '0'),
        COALESCE(NULLIF(TRIM(b.slug), ''), LOWER(CONCAT(
          TRIM(b.StartYear), '-', TRIM(b.EndYear), '-',
          REPLACE(REPLACE(TRIM(b.Name), ' ', '-'), '/', '-')
        )))
      FROM bodies b
      LEFT JOIN platforms p ON p.PlatformID = b.BodyID
      WHERE p.PlatformID IS NULL
    `);
    const inserted = rows?.affectedRows ?? rows?.insertId ?? 0;
    console.log(`Backfill complete. Rows inserted: ${inserted}`);
  } finally {
    await pool.end();
  }
}

run().catch((e) => {
  console.error("Backfill failed:", e.message);
  process.exit(1);
});
