#!/usr/bin/env node
/**
 * Creates topbar_messages table and seeds it if empty.
 * Run from project root: node scripts/run-topbar-migration.cjs
 * Uses .env.local for MYSQL_* if present, else defaults (see lib/db.js).
 */
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2/promise");

// Load .env.local
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
    password: process.env.MYSQL_PASSWORD || "Amelia1",
    database: process.env.MYSQL_DATABASE || "bmrsuspension",
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS topbar_messages (
        id int unsigned NOT NULL AUTO_INCREMENT,
        content text NOT NULL,
        sort_order int unsigned NOT NULL DEFAULT 0,
        duration int unsigned NOT NULL DEFAULT 3000,
        is_active tinyint(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (id),
        KEY sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("Table topbar_messages created or already exists.");

    try {
      await pool.query(
        "ALTER TABLE topbar_messages ADD COLUMN duration int unsigned NOT NULL DEFAULT 3000",
      );
      console.log("Added column: duration");
    } catch (e) {
      if (e.code !== "ER_DUP_FIELDNAME") throw e;
    }
    try {
      await pool.query(
        "ALTER TABLE topbar_messages ADD COLUMN is_active tinyint(1) NOT NULL DEFAULT 1",
      );
      console.log("Added column: is_active");
    } catch (e) {
      if (e.code !== "ER_DUP_FIELDNAME") throw e;
    }

    const [rows] = await pool.query("SELECT 1 FROM topbar_messages LIMIT 1");
    if (!rows.length) {
      await pool.query(
        "INSERT INTO topbar_messages (content, sort_order, duration, is_active) VALUES (?, ?, ?, ?)",
        ["FREE SHIPPING IN THE US FOR ALL BMR PRODUCTS!", 0, 3000, 1],
      );
      console.log("Seeded default topbar message.");
    } else {
      console.log("Table already has rows, skip seed.");
    }
  } finally {
    await pool.end();
  }
}

run().catch((e) => {
  console.error("Migration failed:", e.message);
  process.exit(1);
});
