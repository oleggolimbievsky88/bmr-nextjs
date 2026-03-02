#!/usr/bin/env node
/**
 * Import attribute names (labels) from Summit Racing product pages into an
 * attribute category. Run from project root with DATABASE_URL set (or .env).
 *
 * Usage:
 *   node scripts/import-summit-attributes.js --attribute-category=control-arms --urls="https://www.summitracing.com/parts/bmr-aa032r"
 *
 * Options:
 *   --attribute-category  ID or slug of the attribute category (e.g. control-arms)
 *   --urls                Comma-separated Summit product page URLs
 *   --selector-container  (optional) CSS selector for the specs container. Default tries common patterns.
 *   --selector-label      (optional) CSS selector for label cell within a row (e.g. "td:first-child")
 *   --selector-value      (optional) CSS selector for value cell (e.g. "td:nth-child(2)")
 *
 * If Summit's HTML structure changes, inspect a page and set the selectors.
 * Requires: cheerio (npm install cheerio) and mysql2.
 */

const mysql = require("mysql2/promise");
const path = require("path");

// Load env files when running directly with `node ...`
// Order: .env.local (developer overrides) -> .env -> local (Vercel CLI export file some setups use)
try {
  require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
  require("dotenv").config({ path: path.join(__dirname, "..", "local") });
} catch (e) {
  // dotenv is optional; env vars may already be set in the shell.
}

function getDbConfig() {
  const url = process.env.DATABASE_URL;
  if (url && typeof url === "string") {
    try {
      const parsed = new URL(url);
      return {
        host: parsed.hostname,
        port: parsed.port ? parseInt(parsed.port, 10) : 3306,
        user: decodeURIComponent(parsed.username || "root"),
        password: decodeURIComponent(parsed.password || ""),
        database: parsed.pathname
          ? parsed.pathname.slice(1).replace(/%2f/gi, "/")
          : "",
      };
    } catch (e) {
      console.error("Invalid DATABASE_URL:", e.message);
    }
  }
  return {
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3306", 10),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "bmrsuspension",
  };
}

function slugFromLabel(label) {
  if (!label || typeof label !== "string") return "";
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 100);
}

function looksLikeBotBlock(html) {
  if (!html || typeof html !== "string") return false;
  const h = html.toLowerCase();
  return (
    h.includes("_incapsula_resource") ||
    h.includes("incapsula") ||
    h.includes("alarums-exeunter") ||
    (h.includes("noindex") && h.includes("nofollow") && h.includes("iframe")) ||
    html.length < 2500
  );
}

async function fetchHtml(url, opts = {}) {
  const headers = {
    "User-Agent":
      opts.userAgent ||
      "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  };
  if (opts.cookie) headers.Cookie = opts.cookie;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const html = await res.text();
  if (looksLikeBotBlock(html)) {
    const hint =
      "Summit returned an anti-bot page (Incapsula/Imperva), so specs aren't in the HTML. " +
      'Workarounds: run with `--cookie="..."` copied from a real browser session on summitracing.com, ' +
      "or switch to a browser-based fetcher (Playwright/Puppeteer).";
    throw new Error(hint);
  }
  return html;
}

function extractLabelsWithCheerio(html, opts = {}) {
  let cheerio;
  try {
    cheerio = require("cheerio");
  } catch (e) {
    console.error("cheerio is required. Run: pnpm add -D cheerio");
    process.exit(1);
  }
  const $ = cheerio.load(html);
  const labels = new Set();
  const containerSel =
    opts.selectorContainer ||
    "[data-testid='specifications'], table.specs, table[class*='spec'], .product-specs, .specifications, dl.specs, table";
  const labelSel = opts.selectorLabel || "th, td:first-child, dt";

  $(containerSel).each((_, el) => {
    const $el = $(el);
    $el.find("tr").each((_, row) => {
      const $row = $(row);
      const labelEl = $row.find("th").first().length
        ? $row.find("th").first()
        : $row.find("td").first();
      const labelText = labelEl.text().trim();
      if (labelText && labelText.length < 500) labels.add(labelText);
    });
    $el.find("dt").each((_, dt) => {
      const labelText = $(dt).text().trim();
      if (labelText && labelText.length < 500) labels.add(labelText);
    });
  });

  return Array.from(labels);
}

async function main() {
  const args = process.argv.slice(2);
  let attributeCategory = null;
  let urlsStr = "";
  let selectorContainer = "";
  let selectorLabel = "";
  let selectorValue = "";
  let cookie = "";
  let userAgent = "";

  for (const a of args) {
    if (a.startsWith("--attribute-category="))
      attributeCategory = a.slice("--attribute-category=".length).trim();
    else if (a.startsWith("--urls="))
      urlsStr = a.slice("--urls=".length).trim();
    else if (a.startsWith("--selector-container="))
      selectorContainer = a.slice("--selector-container=".length).trim();
    else if (a.startsWith("--selector-label="))
      selectorLabel = a.slice("--selector-label=".length).trim();
    else if (a.startsWith("--selector-value="))
      selectorValue = a.slice("--selector-value=".length).trim();
    else if (a.startsWith("--cookie=")) cookie = a.slice("--cookie=".length);
    else if (a.startsWith("--user-agent="))
      userAgent = a.slice("--user-agent=".length);
  }

  if (!attributeCategory || !urlsStr) {
    console.error(
      'Usage: node scripts/import-summit-attributes.js --attribute-category=control-arms --urls="https://www.summitracing.com/parts/bmr-aa032r"',
    );
    process.exit(1);
  }

  const urls = urlsStr
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
  if (urls.length === 0) {
    console.error("At least one URL required.");
    process.exit(1);
  }

  const dbConfig = getDbConfig();
  if (
    !process.env.DATABASE_URL &&
    !process.env.MYSQL_HOST &&
    !process.env.MYSQL_USER
  ) {
    console.warn(
      "DB env vars not detected. Set DATABASE_URL or MYSQL_HOST/MYSQL_USER/MYSQL_PASSWORD (via shell, .env files, or project 'local' file).",
    );
  }
  const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 5,
  });

  try {
    const attrCatIdOrSlug = attributeCategory;
    const isNumeric = /^\d+$/.test(attrCatIdOrSlug);
    let attributeCategoryId;

    if (isNumeric) {
      const [rows] = await pool.query(
        "SELECT id FROM attribute_categories WHERE id = ?",
        [attrCatIdOrSlug],
      );
      if (!rows || rows.length === 0) {
        console.error("Attribute category not found for id:", attrCatIdOrSlug);
        process.exit(1);
      }
      attributeCategoryId = rows[0].id;
    } else {
      const [rows] = await pool.query(
        "SELECT id FROM attribute_categories WHERE slug = ?",
        [attrCatIdOrSlug],
      );
      if (!rows || rows.length === 0) {
        console.error(
          "Attribute category not found for slug:",
          attrCatIdOrSlug,
        );
        process.exit(1);
      }
      attributeCategoryId = rows[0].id;
    }

    const [catRow] = await pool.query(
      "SELECT name FROM attribute_categories WHERE id = ?",
      [attributeCategoryId],
    );
    const categoryName =
      (catRow && catRow[0] && catRow[0].name) || attributeCategoryId;

    const allLabels = new Set();
    const opts = {};
    if (selectorContainer) opts.selectorContainer = selectorContainer;
    if (selectorLabel) opts.selectorLabel = selectorLabel;
    if (selectorValue) opts.selectorValue = selectorValue;

    for (const url of urls) {
      console.log("Fetching:", url);
      try {
        const html = await fetchHtml(url, { cookie, userAgent });
        const labels = extractLabelsWithCheerio(html, opts);
        labels.forEach((l) => allLabels.add(l));
        console.log("  Found", labels.length, "attribute labels");
      } catch (err) {
        console.warn("  Failed:", err.message);
      }
    }

    const [existing] = await pool.query(
      "SELECT slug FROM category_attributes WHERE attribute_category_id = ?",
      [attributeCategoryId],
    );
    const existingSlugs = new Set((existing || []).map((r) => r.slug));

    let imported = 0;
    let skipped = 0;
    const sortOrder = 0;

    for (const label of Array.from(allLabels).sort()) {
      const slug = slugFromLabel(label);
      if (!slug) continue;
      if (existingSlugs.has(slug)) {
        skipped++;
        continue;
      }
      try {
        await pool.query(
          `INSERT INTO category_attributes (attribute_category_id, slug, label, type, sort_order)
           VALUES (?, ?, ?, 'text', ?)`,
          [attributeCategoryId, slug, label.trim(), sortOrder],
        );
        existingSlugs.add(slug);
        imported++;
        console.log("  +", label.trim(), "->", slug);
      } catch (e) {
        if (e.code === "ER_DUP_ENTRY") skipped++;
        else console.warn("  Insert failed for", label, e.message);
      }
    }

    console.log(
      "\nImported",
      imported,
      "attributes for [",
      categoryName,
      "]; skipped",
      skipped,
      "duplicates.",
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
