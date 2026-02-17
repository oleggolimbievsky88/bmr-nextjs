// Site-wide settings (key-value). Table: site_settings (setting_key, setting_value)
import pool from "./db";

const DEFAULT_NEW_PRODUCTS_DAYS = 90;

/**
 * Get a setting value by key. Returns string or null if not set.
 */
export async function getSetting(key) {
  const [rows] = await pool.query(
    "SELECT setting_value FROM site_settings WHERE setting_key = ?",
    [key],
  );
  const row = rows?.[0];
  return row?.setting_value ?? null;
}

/**
 * Set a setting value. Creates or updates the row.
 */
export async function setSetting(key, value) {
  const v = value == null ? "" : String(value);
  await pool.query(
    "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
    [key, v],
  );
}

/**
 * Get "new products" display window in days. Uses site_settings.new_products_days, default 90.
 */
export async function getNewProductsDays() {
  const raw = await getSetting("new_products_days");
  if (raw === null || raw === "") return DEFAULT_NEW_PRODUCTS_DAYS;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_NEW_PRODUCTS_DAYS;
}
