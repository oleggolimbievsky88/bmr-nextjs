import brandCoreDb from "@/lib/dbBrandCore";
import { VENDOR_BRANDS } from "@/lib/vendorPortal/brand";

function normalizeBrandKey(brandKey) {
  const k = String(brandKey || "")
    .trim()
    .toLowerCase();
  return VENDOR_BRANDS[k] ? k : null;
}

export async function getVendorPortalCredentials(brandKey) {
  const k = normalizeBrandKey(brandKey);
  if (!k) return null;

  try {
    const [rows] = await brandCoreDb.query(
      `SELECT brand_key, username, password_hash, updated_at
       FROM vendor_portal_credentials
       WHERE brand_key = ?
       LIMIT 1`,
      [k],
    );
    const row = rows?.[0];
    if (!row) return null;
    return {
      brandKey: row.brand_key,
      username: row.username || "",
      passwordHash: row.password_hash || "",
      updatedAt: row.updated_at || null,
    };
  } catch (err) {
    // If brand_core isn't configured yet (or table not created), treat as "not configured".
    if (err?.code === "ER_NO_SUCH_TABLE" || err?.code === "ER_BAD_DB_ERROR") {
      return null;
    }
    throw err;
  }
}

export async function upsertVendorPortalCredentials({
  brandKey,
  username,
  passwordHash,
}) {
  const k = normalizeBrandKey(brandKey);
  if (!k) throw new Error("Invalid brand");

  const u = String(username || "").trim();
  if (!u) throw new Error("Username is required");

  const hash = String(passwordHash || "").trim();
  const now = new Date();

  await brandCoreDb.query(
    `INSERT INTO vendor_portal_credentials (brand_key, username, password_hash, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       username = VALUES(username),
       password_hash = VALUES(password_hash),
       updated_at = VALUES(updated_at)`,
    [k, u, hash, now, now],
  );

  return { brandKey: k, username: u, updatedAt: now.toISOString() };
}
