import pool from "./dbBrandCore";

const SCALAR_COLUMNS = [
  "name",
  "company_name",
  "company_name_short",
  "site_url",
  "assets_base_url",
  "theme_color",
  "button_badge_color",
  "button_badge_text_color",
  "primary_button_text_color",
  "assurance_bar_background_color",
  "assurance_bar_text_color",
  "default_title",
  "default_description",
  "favicon_path",
  "og_image_path",
  "default_og_image_path",
  "copyright_name",
  "is_active",
];

const JSON_COLUMNS = [
  "logo",
  "contact",
  "social",
  "assurance_bar_items",
  "about_brand",
  "same_as",
  "shop_by_make",
  "nav_labels",
  "nav_urls",
  "nav_order",
  "nav_platform_ids",
];

/**
 * Map snake_case DB row to camelCase brand config.
 */
function rowToBrand(row) {
  if (!row) return null;

  const brand = {
    key: row.key,
    name: row.name,
    companyName: row.company_name,
    companyNameShort: row.company_name_short,
    siteUrl: row.site_url || "",
    assetsBaseUrl: row.assets_base_url || "",
    themeColor: row.theme_color,
    buttonBadgeColor: row.button_badge_color,
    buttonBadgeTextColor: row.button_badge_text_color,
    primaryButtonTextColor: row.primary_button_text_color,
    assuranceBarBackgroundColor: row.assurance_bar_background_color,
    assuranceBarTextColor: row.assurance_bar_text_color,
    defaultTitle: row.default_title,
    defaultDescription: row.default_description || "",
    faviconPath: row.favicon_path,
    ogImagePath: row.og_image_path,
    defaultOgImagePath: row.default_og_image_path,
    copyrightName: row.copyright_name,
    isActive: Boolean(row.is_active),
  };

  for (const col of JSON_COLUMNS) {
    const val = row[col];
    const camel = col.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    brand[camel] =
      val != null && val !== ""
        ? typeof val === "string"
          ? JSON.parse(val)
          : val
        : undefined;
  }

  return brand;
}

/**
 * Get brand config by key from DB. Returns null if not found or on error.
 * Only returns active brands.
 */
export async function getBrandByKey(key) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM brands WHERE `key` = ? AND is_active = 1 LIMIT 1",
      [key],
    );
    return rows[0] ? rowToBrand(rows[0]) : null;
  } catch (err) {
    console.error("getBrandByKey error:", err);
    return null;
  }
}

/**
 * Get brand by key for admin (includes inactive).
 */
export async function getBrandByKeyAdmin(key) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM brands WHERE `key` = ? LIMIT 1",
      [key],
    );
    return rows[0] ? rowToBrand(rows[0]) : null;
  } catch (err) {
    console.error("getBrandByKeyAdmin error:", err);
    return null;
  }
}

/**
 * Get all brands (for admin list). Includes inactive.
 */
export async function getAllBrands() {
  try {
    const [rows] = await pool.query("SELECT * FROM brands ORDER BY `key` ASC");
    return rows.map((r) => rowToBrand(r));
  } catch (err) {
    console.error("getAllBrands error:", err);
    return [];
  }
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const URL_PATTERN = /^https?:\/\/.+/;

function validateHexColor(val, field) {
  if (val == null || val === "") return null;
  if (!HEX_COLOR.test(val))
    throw new Error(`Invalid hex color for ${field}: ${val}`);
  return val;
}

function validateUrl(val, field) {
  if (val == null || val === "") return null;
  const s = String(val).trim();
  if (!s) return null;
  if (!URL_PATTERN.test(s)) throw new Error(`Invalid URL for ${field}`);
  return s;
}

function validateAssetPath(val, field) {
  if (val == null || val === "") return null;
  const s = String(val).trim();
  if (s && (s.includes("<") || s.includes(">") || s.includes("script"))) {
    throw new Error(`Invalid asset path for ${field}`);
  }
  return s;
}

/**
 * Update brand by key. Validates hex colors, URLs, asset paths.
 * @param {string} key - Brand key
 * @param {object} data - CamelCase fields to update
 */
export async function updateBrand(key, data) {
  const updates = [];
  const params = [];

  const colorFields = [
    "themeColor",
    "buttonBadgeColor",
    "buttonBadgeTextColor",
    "primaryButtonTextColor",
    "assuranceBarBackgroundColor",
    "assuranceBarTextColor",
  ];
  const urlFields = ["siteUrl", "assetsBaseUrl"];
  const pathFields = ["faviconPath", "ogImagePath", "defaultOgImagePath"];

  const scalarMap = {
    name: "name",
    companyName: "company_name",
    companyNameShort: "company_name_short",
    siteUrl: "site_url",
    assetsBaseUrl: "assets_base_url",
    themeColor: "theme_color",
    buttonBadgeColor: "button_badge_color",
    buttonBadgeTextColor: "button_badge_text_color",
    primaryButtonTextColor: "primary_button_text_color",
    assuranceBarBackgroundColor: "assurance_bar_background_color",
    assuranceBarTextColor: "assurance_bar_text_color",
    defaultTitle: "default_title",
    defaultDescription: "default_description",
    faviconPath: "favicon_path",
    ogImagePath: "og_image_path",
    defaultOgImagePath: "default_og_image_path",
    copyrightName: "copyright_name",
    isActive: "is_active",
  };

  for (const [camel, dbCol] of Object.entries(scalarMap)) {
    if (!(camel in data)) continue;
    let val = data[camel];
    if (colorFields.includes(camel)) val = validateHexColor(val, camel);
    else if (urlFields.includes(camel)) val = validateUrl(val, camel);
    else if (pathFields.includes(camel)) val = validateAssetPath(val, camel);
    else if (camel === "isActive") val = val ? 1 : 0;
    else if (typeof val === "string") val = val.trim();
    if (val !== undefined && val !== null) {
      updates.push(`\`${dbCol}\` = ?`);
      params.push(val);
    }
  }

  const optionalJsonColumns = ["nav_platform_ids"]; // may be missing on older DBs
  const requiredJsonColumns = JSON_COLUMNS.filter(
    (c) => !optionalJsonColumns.includes(c),
  );

  function buildJsonUpdates(includeOptional) {
    const u = [];
    const p = [];
    const cols = includeOptional
      ? JSON_COLUMNS
      : requiredJsonColumns;
    for (const col of cols) {
      const camel = col.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      if (!(camel in data)) continue;
      const val = data[camel];
      if (val === undefined || val === null) continue;
      const json = typeof val === "string" ? val : JSON.stringify(val);
      u.push(`\`${col}\` = ?`);
      p.push(json);
    }
    return { u, p };
  }

  const { u: jsonUpdates, p: jsonParams } = buildJsonUpdates(true);
  updates.push(...jsonUpdates);
  params.push(...jsonParams);

  if (updates.length === 0) return;

  params.push(key);
  const sql = `UPDATE brands SET ${updates.join(", ")} WHERE \`key\` = ?`;

  try {
    await pool.query(sql, params);
  } catch (err) {
    const isUnknownColumn =
      err.code === "ER_BAD_FIELD_ERROR" ||
      (err.message && String(err.message).includes("Unknown column"));
    const isNavPlatformIds =
      err.message && String(err.message).includes("nav_platform_ids");
    if (isUnknownColumn && isNavPlatformIds && optionalJsonColumns.length > 0) {
      // Retry without optional columns that don't exist on this DB
      const scalarUpdates = updates.filter(
        (s) => !JSON_COLUMNS.some((col) => s.includes(`\`${col}\``)),
      );
      const scalarParams = params.slice(0, -1).filter((_, i) => {
        const isJson = i >= params.length - 1 - jsonParams.length;
        return !isJson;
      });
      const { u: retryJsonUpdates, p: retryJsonParams } =
        buildJsonUpdates(false);
      const retryUpdates = [...scalarUpdates, ...retryJsonUpdates];
      const retryParams = [...scalarParams, ...retryJsonParams, key];
      if (retryUpdates.length > 0) {
        await pool.query(
          `UPDATE brands SET ${retryUpdates.join(", ")} WHERE \`key\` = ?`,
          retryParams,
        );
        return;
      }
    }
    throw err;
  }
}
