#!/usr/bin/env node
/**
 * Adds paypal_email column to new_orders for PayPal orders.
 * Run from project root: node scripts/run-add-paypal-email.cjs
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
    password: process.env.MYSQL_PASSWORD || "Amelia1",
    database: process.env.MYSQL_DATABASE || "bmrsuspension",
  });

  try {
    await pool.query(`
      ALTER TABLE new_orders
      ADD COLUMN paypal_email VARCHAR(255) DEFAULT NULL
    `);
    console.log("Column paypal_email added to new_orders.");
  } catch (e) {
    if (e.code === "ER_DUP_FIELDNAME") {
      console.log("Column paypal_email already exists. Nothing to do.");
    } else {
      console.error("Migration failed:", e.message);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

run();
