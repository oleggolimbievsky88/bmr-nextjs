// lib/queries.js

import pool from "./db"; // Import MySQL connection pool
import Link from "next/link";
import mysql from "mysql2/promise";
import { encrypt } from "./ccEncryption";
import { isLower48UsState } from "./shipping";
import { getProductImageUrl, getPlatformImageUrl } from "./assets";

// Get all products
export async function getAllProducts() {
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE Display = "1" AND (endproduct IS NULL OR endproduct != 1)',
  );
  return rows;
}

/** Lightweight query for sitemap: product IDs only. */
export async function getProductIdsForSitemap() {
  const [rows] = await pool.query(
    'SELECT ProductID FROM products WHERE Display = "1" AND (endproduct IS NULL OR endproduct != 1)',
  );
  return rows.map((r) => r.ProductID);
}

/**
 * Dealer portal: filter options for Platform, Main Cat, Cat, Vendor.
 */
export async function getDealerFilterOptions() {
  try {
    const [bodies] = await pool.query(
      `SELECT BodyID AS id, Name AS name, StartYear, EndYear
       FROM bodies ORDER BY Name ASC`,
    );
    const [mainCategories] = await pool.query(
      `SELECT MainCatID AS id, MainCatName AS name,
       CAST(BodyID AS CHAR) AS bodyId
       FROM maincategories ORDER BY BodyID, MainCatName ASC`,
    );
    const [categories] = await pool.query(
      `SELECT CatID AS id, CatName AS name, MainCatID FROM categories
       ORDER BY CatName ASC`,
    );
    const [mans] = await pool.query(
      `SELECT ManID AS id, ManName AS name FROM mans ORDER BY ManName ASC`,
    );
    return {
      platforms: bodies || [],
      mainCategories: mainCategories || [],
      categories: categories || [],
      vendors: mans || [],
    };
  } catch (error) {
    console.error("Error fetching dealer filter options:", error);
    throw error;
  }
}

/**
 * Dealer portal: paginated product list (displayed products only).
 * Filters: search (ProductName/PartNumber), bodyId, mainCatId, catId, manId.
 * Returns ProductID, PartNumber, ProductName, Price, ImageSmall, ImageLarge,
 * BodyID, ManID, ManName.
 */
export async function getProductsForDealer(
  limit = 50,
  offset = 0,
  filters = {},
) {
  try {
    const {
      search = null,
      bodyId = null,
      mainCatId = null,
      catId = null,
      manId = null,
    } = filters;

    let sql = `
      SELECT p.ProductID, p.PartNumber, p.ProductName, p.Price, p.ImageSmall,
             p.ImageLarge, p.BodyID, p.ManID, p.Color,
             p.Grease, p.AngleFinder, p.Hardware, p.hardwarepacks,
             m.ManName
      FROM products p
      LEFT JOIN mans m ON p.ManID = m.ManID
    `;
    const params = [];
    const where = [
      "p.Display = '1'",
      "(p.endproduct IS NULL OR p.endproduct != '1')",
    ];

    if (search && search.trim()) {
      where.push("(p.ProductName LIKE ? OR p.PartNumber LIKE ?)");
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }
    if (bodyId != null && bodyId !== "" && bodyId !== "0") {
      where.push("p.BodyID = ?");
      params.push(bodyId);
    }
    if (mainCatId != null && mainCatId !== "" && mainCatId !== "0") {
      where.push(
        "EXISTS (SELECT 1 FROM categories c WHERE FIND_IN_SET(c.CatID, p.CatID) AND c.MainCatID = ?)",
      );
      params.push(mainCatId);
    }
    if (catId != null && catId !== "" && catId !== "0") {
      where.push("FIND_IN_SET(?, p.CatID)");
      params.push(catId);
    }
    if (manId != null && manId !== "" && manId !== "0") {
      where.push("p.ManID = ?");
      params.push(manId);
    }

    sql += ` WHERE ${where.join(" AND ")}`;
    sql += ` ORDER BY p.ProductName ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Error fetching products for dealer:", error);
    throw error;
  }
}

/** Dealer portal: total product count (same filters as getProductsForDealer). */
export async function getProductsForDealerCount(filters = {}) {
  try {
    const {
      search = null,
      bodyId = null,
      mainCatId = null,
      catId = null,
      manId = null,
    } = filters;

    let sql = `
      SELECT COUNT(*) AS total FROM products p
      WHERE p.Display = '1' AND (p.endproduct IS NULL OR p.endproduct != '1')
    `;
    const params = [];

    if (search && search.trim()) {
      sql += ` AND (p.ProductName LIKE ? OR p.PartNumber LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }
    if (bodyId != null && bodyId !== "" && bodyId !== "0") {
      sql += ` AND p.BodyID = ?`;
      params.push(bodyId);
    }
    if (mainCatId != null && mainCatId !== "" && mainCatId !== "0") {
      sql += ` AND EXISTS (SELECT 1 FROM categories c WHERE FIND_IN_SET(c.CatID, p.CatID) AND c.MainCatID = ?)`;
      params.push(mainCatId);
    }
    if (catId != null && catId !== "" && catId !== "0") {
      sql += ` AND FIND_IN_SET(?, p.CatID)`;
      params.push(catId);
    }
    if (manId != null && manId !== "" && manId !== "0") {
      sql += ` AND p.ManID = ?`;
      params.push(manId);
    }

    const [rows] = await pool.query(sql, params);
    return rows[0]?.total ?? 0;
  } catch (error) {
    console.error("Error fetching dealer products count:", error);
    throw error;
  }
}

/** Dealer portal: insert a feature suggestion (Dealer Portal or website). */
export async function insertDealerSuggestion(customerId, subject, suggestion) {
  const [result] = await pool.query(
    `INSERT INTO dealer_suggestions (customer_id, subject, suggestion)
     VALUES (?, ?, ?)`,
    [
      customerId,
      (subject || "").trim().slice(0, 255),
      (suggestion || "").trim(),
    ],
  );
  return result?.insertId ?? null;
}

/** Dealer portal: list suggestions for a dealer (their own). */
export async function getDealerSuggestionsByCustomerId(customerId) {
  const [rows] = await pool.query(
    `SELECT id, subject, suggestion, status, created_at
     FROM dealer_suggestions
     WHERE customer_id = ?
     ORDER BY created_at DESC`,
    [customerId],
  );
  return rows || [];
}

// ----- Dealer Purchase Orders -----

/** Get dealer's draft PO (one per customer). */
export async function getDealerDraftPO(customerId) {
  const [rows] = await pool.query(
    `SELECT id, customer_id, status, po_number, notes, created_at, updated_at
     FROM dealer_purchase_orders
     WHERE customer_id = ? AND status = 'draft'
     ORDER BY id DESC LIMIT 1`,
    [customerId],
  );
  return rows[0] || null;
}

/** Create a new draft PO for dealer. */
export async function createDealerPO(customerId) {
  const [result] = await pool.query(
    `INSERT INTO dealer_purchase_orders (customer_id, status) VALUES (?, 'draft')`,
    [customerId],
  );
  return result.insertId;
}

/** Get PO by id (dealer: must be their PO; admin: any). */
export async function getDealerPOById(poId, customerId = null) {
  let sql = `
    SELECT d.*, c.firstname, c.lastname, c.email
    FROM dealer_purchase_orders d
    LEFT JOIN customers c ON d.customer_id = c.CustomerID
    WHERE d.id = ?
  `;
  const params = [poId];
  if (customerId != null) {
    sql += ` AND d.customer_id = ?`;
    params.push(customerId);
  }
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
}

/** Get PO with line items. Enriches items with hardware_pack_names when hardware_pack_ids present. */
export async function getDealerPOWithItems(poId, customerId = null) {
  const po = await getDealerPOById(poId, customerId);
  if (!po) return null;
  const [items] = await pool.query(
    `SELECT id, po_id, product_id, part_number, product_name, quantity,
            color_id, color_name, unit_price, created_at,
            grease_id, grease_name, anglefinder_id, anglefinder_name, hardware_id, hardware_name,
            hardware_pack_ids
     FROM dealer_po_items WHERE po_id = ? ORDER BY id ASC`,
    [poId],
  );
  const rawItems = items || [];
  const packIdsSet = new Set();
  rawItems.forEach((i) => {
    const raw = i.hardware_pack_ids;
    if (raw && typeof raw === "string" && raw.trim() !== "") {
      raw.split(",").forEach((id) => {
        const tid = id.trim();
        if (tid) packIdsSet.add(tid);
      });
    }
  });
  let packNamesById = {};
  if (packIdsSet.size > 0) {
    const packs = await getHardwarePackProducts([...packIdsSet]);
    (packs || []).forEach((p) => {
      packNamesById[String(p.ProductID)] = p.ProductName || "";
    });
  }
  const enrichedItems = rawItems.map((i) => {
    const names = [];
    const raw = i.hardware_pack_ids;
    if (raw && typeof raw === "string" && raw.trim() !== "") {
      raw.split(",").forEach((id) => {
        const tid = id.trim();
        if (tid && packNamesById[tid]) names.push(packNamesById[tid]);
      });
    }
    return {
      ...i,
      hardware_pack_names: names,
    };
  });
  return { ...po, items: enrichedItems };
}

/** Add item to dealer PO. */
export async function addDealerPOItem(data) {
  const {
    poId,
    productId,
    partNumber,
    productName,
    quantity = 1,
    colorId = null,
    colorName = null,
    unitPrice,
    greaseId = null,
    greaseName = null,
    anglefinderId = null,
    anglefinderName = null,
    hardwareId = null,
    hardwareName = null,
    hardwarePackIds = null,
  } = data;
  const hardwarePackIdsStr =
    Array.isArray(hardwarePackIds) && hardwarePackIds.length > 0
      ? hardwarePackIds.map((id) => String(id)).join(",")
      : null;
  const [result] = await pool.query(
    `INSERT INTO dealer_po_items
     (po_id, product_id, part_number, product_name, quantity, color_id, color_name, unit_price,
      grease_id, grease_name, anglefinder_id, anglefinder_name, hardware_id, hardware_name, hardware_pack_ids)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      poId,
      productId,
      partNumber,
      productName,
      Math.max(1, parseInt(quantity, 10) || 1),
      colorId,
      colorName || null,
      unitPrice,
      greaseId || null,
      greaseName || null,
      anglefinderId || null,
      anglefinderName || null,
      hardwareId || null,
      hardwareName || null,
      hardwarePackIdsStr,
    ],
  );
  return result.insertId;
}

/** Update item quantity. */
export async function updateDealerPOItemQty(itemId, quantity) {
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  await pool.query(`UPDATE dealer_po_items SET quantity = ? WHERE id = ?`, [
    qty,
    itemId,
  ]);
}

/** Update item quantity and/or color. */
export async function updateDealerPOItem(
  itemId,
  { quantity, colorId, colorName },
) {
  const updates = [];
  const params = [];
  if (quantity != null) {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    updates.push("quantity = ?");
    params.push(qty);
  }
  if (colorId !== undefined) {
    updates.push("color_id = ?");
    params.push(colorId);
  }
  if (colorName !== undefined) {
    updates.push("color_name = ?");
    params.push(colorName);
  }
  if (updates.length === 0) return;
  params.push(itemId);
  await pool.query(
    `UPDATE dealer_po_items SET ${updates.join(", ")} WHERE id = ?`,
    params,
  );
}

/** Remove item from PO. */
export async function removeDealerPOItem(itemId) {
  await pool.query(`DELETE FROM dealer_po_items WHERE id = ?`, [itemId]);
}

/** Update draft PO metadata (po_number, notes). Only for draft POs. */
export async function updateDealerPOMetadata(
  poId,
  customerId,
  { po_number, notes },
) {
  const updates = [];
  const params = [];
  if (po_number !== undefined) {
    updates.push("po_number = ?");
    params.push(
      po_number != null && String(po_number).trim()
        ? String(po_number).trim()
        : null,
    );
  }
  if (notes !== undefined) {
    updates.push("notes = ?");
    params.push(
      notes != null && String(notes).trim() ? String(notes).trim() : null,
    );
  }
  if (updates.length === 0) return false;
  params.push(poId, customerId);
  const [result] = await pool.query(
    `UPDATE dealer_purchase_orders
     SET ${updates.join(", ")}
     WHERE id = ? AND customer_id = ? AND status = 'draft'`,
    params,
  );
  return result.affectedRows > 0;
}

/** Send dealer PO (status -> sent, set sent_at). Optional fields saved with the PO. */
export async function sendDealerPO(poId, customerId, options = {}) {
  const { notes = null, poNumber = null } = options || {};
  const updates = ["status = 'sent'", "sent_at = NOW()"];
  const params = [];
  if (notes !== undefined && notes !== null) {
    updates.push("notes = ?");
    params.push(String(notes));
  }
  if (poNumber !== undefined && poNumber !== null) {
    updates.push("po_number = ?");
    params.push(String(poNumber));
  }
  params.push(poId, customerId);
  const [result] = await pool.query(
    `UPDATE dealer_purchase_orders
     SET ${updates.join(", ")}
     WHERE id = ? AND customer_id = ? AND status = 'draft'`,
    params,
  );
  return result.affectedRows > 0;
}

/** List POs for a dealer (all statuses). */
export async function getDealerPOsByCustomer(customerId) {
  const [rows] = await pool.query(
    `SELECT id, customer_id, status, po_number, notes, created_at, sent_at
     FROM dealer_purchase_orders
     WHERE customer_id = ?
     ORDER BY COALESCE(sent_at, updated_at) DESC`,
    [customerId],
  );
  return rows || [];
}

/** List past orders (invoices) for a dealer by customer_id. */
export async function getOrdersByCustomerId(customerId, limit = 100) {
  try {
    const [rows] = await pool.query(
      `SELECT new_order_id, order_number, order_date, status, total,
              subtotal, shipping_cost, shipping_method, free_shipping,
              tax, discount, coupon_code, payment_method, payment_status
       FROM new_orders
       WHERE customer_id = ?
       ORDER BY order_date DESC
       LIMIT ?`,
      [customerId, Math.min(500, Math.max(1, limit))],
    );
    return rows || [];
  } catch (error) {
    console.error("Error fetching orders by customer:", error);
    throw error;
  }
}

/** Admin: list all sent/received POs (non-draft). */
export async function getAdminDealerPOs() {
  const [rows] = await pool.query(
    `SELECT d.id, d.customer_id, d.status, d.notes, d.created_at, d.sent_at,
            c.firstname, c.lastname, c.email
     FROM dealer_purchase_orders d
     LEFT JOIN customers c ON d.customer_id = c.CustomerID
     WHERE d.status != 'draft'
     ORDER BY d.sent_at DESC, d.id DESC`,
  );
  return rows || [];
}

/** Admin: list POs with pagination, sorting, and filters. */
const DEALER_PO_SORT_COLUMNS = {
  id: "d.id",
  dealer: "c.lastname",
  tier: "c.dealerTier",
  status: "d.status",
  sent_at: "d.sent_at",
  created_at: "d.created_at",
  item_count: "item_count",
  subtotal: "subtotal",
};

export async function getAdminDealerPOsPaginated(
  limit = 25,
  offset = 0,
  sortColumn = "sent_at",
  sortDirection = "desc",
  filters = {},
) {
  const {
    customer = "",
    poNumber = "",
    status = "",
    dateFrom = "",
    dateTo = "",
  } = filters;

  const conditions = ["d.status != 'draft'"];
  const params = [];

  if (customer && String(customer).trim()) {
    const term = `%${String(customer).trim()}%`;
    conditions.push(
      "(c.firstname LIKE ? OR c.lastname LIKE ? OR c.email LIKE ?)",
    );
    params.push(term, term, term);
  }
  if (poNumber && String(poNumber).trim()) {
    conditions.push("(d.po_number LIKE ? OR d.id = ?)");
    const val = String(poNumber).trim();
    params.push(`%${val}%`, isNaN(parseInt(val, 10)) ? -1 : parseInt(val, 10));
  }
  if (status && String(status).trim()) {
    conditions.push("d.status = ?");
    params.push(String(status).trim());
  }
  if (dateFrom) {
    conditions.push(
      "(d.sent_at >= ? OR (d.sent_at IS NULL AND d.created_at >= ?))",
    );
    params.push(`${dateFrom} 00:00:00`, `${dateFrom} 00:00:00`);
  }
  if (dateTo) {
    conditions.push(
      "(d.sent_at <= ? OR (d.sent_at IS NULL AND d.created_at <= ?))",
    );
    params.push(`${dateTo} 23:59:59`, `${dateTo} 23:59:59`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";
  const orderCol =
    DEALER_PO_SORT_COLUMNS[sortColumn] || DEALER_PO_SORT_COLUMNS.sent_at;
  const orderDir = sortDirection === "desc" ? "DESC" : "ASC";

  const sql = `
    SELECT d.id, d.customer_id, d.status, d.notes, d.po_number, d.created_at, d.sent_at,
           c.firstname, c.lastname, c.email, c.dealerTier,
           COALESCE(agg.item_count, 0) AS item_count,
           COALESCE(agg.po_subtotal, 0) AS subtotal
    FROM dealer_purchase_orders d
    LEFT JOIN customers c ON d.customer_id = c.CustomerID
    LEFT JOIN (
      SELECT po_id,
             SUM(quantity) AS item_count,
             SUM(quantity * unit_price) AS po_subtotal
      FROM dealer_po_items
      GROUP BY po_id
    ) agg ON d.id = agg.po_id
    ${whereClause}
    ORDER BY ${orderCol} ${orderDir}, d.id DESC
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);
  const [rows] = await pool.query(sql, params);
  return rows || [];
}

/** Admin: count POs with filters. */
export async function getAdminDealerPOsCount(filters = {}) {
  const {
    customer = "",
    poNumber = "",
    status = "",
    dateFrom = "",
    dateTo = "",
  } = filters;

  const conditions = ["d.status != 'draft'"];
  const params = [];

  if (customer && String(customer).trim()) {
    const term = `%${String(customer).trim()}%`;
    conditions.push(
      "(c.firstname LIKE ? OR c.lastname LIKE ? OR c.email LIKE ?)",
    );
    params.push(term, term, term);
  }
  if (poNumber && String(poNumber).trim()) {
    conditions.push("(d.po_number LIKE ? OR d.id = ?)");
    const val = String(poNumber).trim();
    params.push(`%${val}%`, isNaN(parseInt(val, 10)) ? -1 : parseInt(val, 10));
  }
  if (status && String(status).trim()) {
    conditions.push("d.status = ?");
    params.push(String(status).trim());
  }
  if (dateFrom) {
    conditions.push(
      "(d.sent_at >= ? OR (d.sent_at IS NULL AND d.created_at >= ?))",
    );
    params.push(`${dateFrom} 00:00:00`, `${dateFrom} 00:00:00`);
  }
  if (dateTo) {
    conditions.push(
      "(d.sent_at <= ? OR (d.sent_at IS NULL AND d.created_at <= ?))",
    );
    params.push(`${dateTo} 23:59:59`, `${dateTo} 23:59:59`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM dealer_purchase_orders d
     LEFT JOIN customers c ON d.customer_id = c.CustomerID
     ${whereClause}`,
    params,
  );
  return (row && row.total) || 0;
}

// Get menu data from platforms table
export async function getMenuData() {
  try {
    const [platformRows] = await pool.query(`
      SELECT p.PlatformID AS BodyID, p.Name, p.StartYear, p.EndYear,
             p.Image, p.slug, p.PlatformOrder AS BodyOrder,
             bc.BodyCatID, bc.BodyCatName, bc.Position
      FROM platforms p
      JOIN bodycats bc ON p.BodyCatID = bc.BodyCatID
      ORDER BY p.StartYear DESC, p.EndYear DESC, p.Name ASC
    `);
    const rows = platformRows || [];

    const cat = (name) => (name || "").toLowerCase();
    const fordBodies = rows.filter((body) =>
      cat(body.BodyCatName).includes("ford"),
    );
    const gmLateBodies = rows.filter((body) => {
      const c = cat(body.BodyCatName);
      return (
        c.includes("gm late model") ||
        (c.includes("late model") && c.includes("gm"))
      );
    });
    const gmMidMuscle = rows.filter((body) =>
      cat(body.BodyCatName).includes("gm mid muscle"),
    );
    const gmClassicMuscle = rows.filter((body) =>
      cat(body.BodyCatName).includes("gm classic muscle"),
    );
    const moparBodies = rows.filter((body) =>
      cat(body.BodyCatName).includes("mopar"),
    );

    // Slug: year-year-name; slashes in name (e.g. Z06/ZR1) become hyphens
    function getPlatformSlug(body) {
      const nameSlug = (body.Name || "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/\//g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const computed = `${body.StartYear}-${body.EndYear}-${nameSlug}`.replace(
        /-+/g,
        "-",
      );
      return (body.slug && body.slug.trim()) || computed;
    }

    // Helper to convert bodies to simple platform list
    function buildPlatformList(bodies) {
      return bodies.map((body) => {
        const platformSlug = getPlatformSlug(body);
        const imageUrl = getPlatformImageUrl(body.Image);

        return {
          heading: `${body.StartYear} - ${body.EndYear} ${body.Name}`,
          slug: platformSlug,
          bodyId: body.BodyID,
          image: imageUrl,
        };
      });
    }

    const menuData = {
      fordLinks: buildPlatformList(fordBodies),
      gmLateModelLinks: buildPlatformList(gmLateBodies),
      gmMidMuscleLinks: buildPlatformList(gmMidMuscle),
      gmClassicMuscleLinks: buildPlatformList(gmClassicMuscle),
      moparLinks: buildPlatformList(moparBodies),
    };

    return menuData;
  } catch (error) {
    console.error("Failed to fetch menu data:", error);

    // Return a minimal fallback menu structure to prevent complete failure
    return {
      fordLinks: [],
      gmLateModelLinks: [],
      gmMidMuscleLinks: [],
      gmClassicMuscleLinks: [],
      moparLinks: [],
    };
  }
}

// Get all Ford platforms with related vehicle info from platforms table.
export async function getFordPlatformsWithVehicles() {
  try {
    const query = `
      SELECT
        p.PlatformID        AS id,
        p.Name              AS name,
        p.StartYear         AS startYear,
        p.EndYear           AS endYear,
        p.Image             AS image,
        p.HeaderImage       AS headerImage,
        p.slug              AS platformSlug,
        GROUP_CONCAT(DISTINCT v.Make  ORDER BY v.Make  SEPARATOR ', ') AS makes,
        GROUP_CONCAT(DISTINCT v.Model ORDER BY v.Model SEPARATOR ', ') AS models
      FROM platforms p
      JOIN bodycats bc ON p.BodyCatID = bc.BodyCatID
      LEFT JOIN vehicles v ON v.BodyID = p.PlatformID
      WHERE bc.BodyCatName LIKE '%Ford%'
      GROUP BY p.PlatformID, p.Name, p.StartYear, p.EndYear, p.Image, p.HeaderImage, p.slug, p.PlatformOrder
      ORDER BY p.PlatformOrder
    `;

    const [rows] = await pool.query(query);

    // Use same slug resolution as getPlatformBySlug so links resolve correctly
    const platforms = rows.map((row) => {
      const slug =
        row.platformSlug && row.platformSlug.trim()
          ? row.platformSlug.trim()
          : buildPlatformSlugFromRow(row);

      // Prefer explicit body image in local cars folder; fall back to a safe default
      const imageUrl =
        getPlatformImageUrl(row.image) || `/images/cars/2024-2024 Mustang.png`;

      return {
        id: row.id,

        name: row.name,
        startYear: row.startYear,
        endYear: row.endYear,
        slug,
        image: imageUrl,
        headerImage: row.headerImage,
        makes: row.makes || "Ford",
        models: row.models || row.name,
      };
    });

    return platforms;
  } catch (error) {
    console.error("Error fetching Ford platforms:", error);
    return [];
  }
}

// Get all GM platforms across Late/Mid/Classic muscle categories from platforms table.
export async function getGMPlatformsWithVehicles() {
  try {
    const query = `
      SELECT
        p.PlatformID  AS id,
        p.Name    AS name,
        p.StartYear AS startYear,
        p.EndYear   AS endYear,
        p.Image   AS image,
        p.HeaderImage AS headerImage,
        p.slug    AS platformSlug,
        bc.BodyCatName AS bodyCatName,
        GROUP_CONCAT(DISTINCT v.Make  ORDER BY v.Make  SEPARATOR ', ') AS makes,
        GROUP_CONCAT(DISTINCT v.Model ORDER BY v.Model SEPARATOR ', ') AS models
      FROM platforms p
      JOIN bodycats bc ON p.BodyCatID = bc.BodyCatID
      LEFT JOIN vehicles v ON v.BodyID = p.PlatformID
      WHERE bc.BodyCatName LIKE '%GM Late Model%'
         OR bc.BodyCatName LIKE '%GM Mid Muscle%'
         OR bc.BodyCatName LIKE '%GM Classic Muscle%'
      GROUP BY p.PlatformID, p.Name, p.StartYear, p.EndYear, p.Image, p.HeaderImage, p.slug, bc.BodyCatName, p.PlatformOrder
      ORDER BY p.PlatformOrder
    `;
    const [rows] = await pool.query(query);
    return rows.map((row) => {
      const slug =
        row.platformSlug && row.platformSlug.trim()
          ? row.platformSlug.trim()
          : buildPlatformSlugFromRow(row);
      const imageUrl =
        getPlatformImageUrl(row.image) || `/images/cars/2024-2024 Mustang.png`;
      return { ...row, slug, image: imageUrl };
    });
  } catch (error) {
    console.error("Error fetching GM platforms:", error);
    return [];
  }
}

// Get Mopar platforms from platforms table.
export async function getMoparPlatformsWithVehicles() {
  try {
    const query = `
      SELECT
        p.PlatformID  AS id,
        p.Name    AS name,
        p.StartYear AS startYear,
        p.EndYear   AS endYear,
        p.Image   AS image,
        p.HeaderImage AS headerImage,
        p.slug    AS platformSlug,
        GROUP_CONCAT(DISTINCT v.Make  ORDER BY v.Make  SEPARATOR ', ') AS makes,
        GROUP_CONCAT(DISTINCT v.Model ORDER BY v.Model SEPARATOR ', ') AS models
      FROM platforms p
      JOIN bodycats bc ON p.BodyCatID = bc.BodyCatID
      LEFT JOIN vehicles v ON v.BodyID = p.PlatformID
      WHERE bc.BodyCatName LIKE '%Mopar%'
      GROUP BY p.PlatformID, p.Name, p.StartYear, p.EndYear, p.Image, p.HeaderImage, p.slug, p.PlatformOrder
      ORDER BY p.PlatformOrder
    `;
    const [rows] = await pool.query(query);
    return rows.map((row) => {
      const slug =
        row.platformSlug && row.platformSlug.trim()
          ? row.platformSlug.trim()
          : buildPlatformSlugFromRow(row);
      const imageUrl =
        getPlatformImageUrl(row.image) || `/images/cars/2024-2024 Mustang.png`;
      return { ...row, slug, image: imageUrl };
    });
  } catch (error) {
    console.error("Error fetching Mopar platforms:", error);
    return [];
  }
}

// Get platform/body details by ID from platforms table
export async function getBodyDetailsById(bodyId) {
  try {
    if (!bodyId) {
      throw new Error("Missing bodyId parameter");
    }

    const [rows] = await pool.query(
      `SELECT PlatformID AS BodyID, Name, StartYear, EndYear, Image, HeaderImage, BodyCatID, slug
       FROM platforms WHERE PlatformID = ?`,
      [bodyId],
    );

    if (!rows || rows.length === 0) {
      throw new Error("Body not found");
    }

    return rows[0];
  } catch (error) {
    console.error("Error fetching body details:", error);
    throw error;
  }
}

// Get categories (grouped by main categories) by body ID
export async function getCategoriesByBodyId(bodyId) {
  try {
    if (!bodyId) {
      throw new Error("Missing bodyId parameter");
    }

    // First get the main categories for this body
    const mainCategoriesQuery = `
      SELECT MainCatID, MainCatName, MainCatImage, MainCatSlug
      FROM maincategories
      WHERE BodyID = ?
      ORDER BY MainCatName
    `;

    const [mainCategories] = await pool.query(mainCategoriesQuery, [bodyId]);

    // If we have main categories, get their sub-categories
    let categoriesByMainCat = [];

    if (mainCategories.length > 0) {
      // For each main category, get its subcategories
      for (const mainCat of mainCategories) {
        // Get categories for this main category with product counts
        const categoriesQuery = `
          SELECT c.CatID, c.CatName, c.MainCatID, c.CatNameSlug, COUNT(p.ProductID) as productCount
          FROM categories c
          LEFT JOIN products p ON FIND_IN_SET(c.CatID, p.CatID) AND p.BodyID = ? AND p.Display = 1
          WHERE c.MainCatID = ?
          GROUP BY c.CatID, c.CatName, c.MainCatID
          HAVING productCount > 0
          ORDER BY c.CatName
        `;

        const [subCategories] = await pool.query(categoriesQuery, [
          bodyId,
          mainCat.MainCatID,
        ]);

        // Format the categories with slugs for image paths
        const formattedSubCategories = subCategories.map((cat) => ({
          ...cat,
          slug: cat.CatName.toLowerCase().replace(/\s+/g, "-"),
        }));

        // Add to our result set if there are subcategories
        if (formattedSubCategories.length > 0) {
          categoriesByMainCat.push({
            mainCategory: {
              id: mainCat.MainCatID,
              name: mainCat.MainCatName,
              image: mainCat.MainCatImage,
              slug: mainCat.MainCatName.toLowerCase().replace(/\s+/g, "-"),
              productCount: formattedSubCategories.reduce(
                (count, cat) => count + cat.productCount,
                0,
              ),
            },
            subCategories: formattedSubCategories,
          });
        }
      }
    } else {
      // If no main categories, try to get general categories for this body
      const generalCategoriesQuery = `
        SELECT c.CatID, c.CatName, c.CatNameSlug, c.MainCatID, COUNT(p.ProductID) as productCount
        FROM categories c
        JOIN products p ON FIND_IN_SET(c.CatID, p.CatID)
        WHERE p.BodyID = ? AND p.Display = 1
        GROUP BY c.CatID, c.CatName
        HAVING productCount > 0
        ORDER BY c.CatName
      `;

      const [generalCats] = await pool.query(generalCategoriesQuery, [bodyId]);

      if (generalCats.length > 0) {
        // Create a generic "General" main category
        categoriesByMainCat.push({
          mainCategory: {
            id: 0,
            name: "General",
            image: null,
            slug: "general",
          },
          subCategories: generalCats.map((cat) => ({
            ...cat,
            slug: cat.CatName.toLowerCase().replace(/\s+/g, "-"),
          })),
        });
      }
    }

    return categoriesByMainCat;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

// Get vehicles by body ID
export async function getVehiclesByBodyId(bodyId) {
  try {
    if (!bodyId) {
      throw new Error("Missing bodyId parameter");
    }

    let vehiclesQuery = `
      SELECT VehicleID, StartYear, EndYear, Make, Model, BodyID, SubModel
      FROM vehicles
      WHERE BodyID = ?
      ORDER BY StartYear DESC, Make, Model
    `;
    try {
      const [vehicles] = await pool.query(vehiclesQuery, [bodyId]);
      return vehicles;
    } catch (e) {
      if (
        e.code === "ER_BAD_FIELD_ERROR" &&
        e.message &&
        e.message.includes("SubModel")
      ) {
        vehiclesQuery = `
          SELECT VehicleID, StartYear, EndYear, Make, Model, BodyID
          FROM vehicles
          WHERE BodyID = ?
          ORDER BY StartYear DESC, Make, Model
        `;
        const [vehicles] = await pool.query(vehiclesQuery, [bodyId]);
        return (vehicles || []).map((v) => ({ ...v, SubModel: null }));
      }
      throw e;
    }
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
}

/** Get BodyID from legacy VehicleID (for old URL redirects). */
export async function getBodyIdByVehicleId(vehicleId) {
  if (!vehicleId) return null;
  const [rows] = await pool.query(
    "SELECT BodyID FROM vehicles WHERE VehicleID = ? LIMIT 1",
    [vehicleId],
  );
  return rows[0]?.BodyID ?? null;
}

/**
 * Get all vehicles with platform slug for Search by Vehicle.
 * Expands StartYear–EndYear to one entry per year. Returns array of { year, make, model, subModel, platformSlug }.
 */
export async function getVehiclesForSearch() {
  let rows = [];
  try {
    const [r] = await pool.query(
      `SELECT v.VehicleID, v.StartYear, v.EndYear, v.Make, v.Model, v.SubModel, b.slug
       FROM vehicles v
       INNER JOIN bodies b ON b.BodyID = v.BodyID
       WHERE b.slug IS NOT NULL AND b.slug != ''
       ORDER BY v.StartYear DESC, v.Make, v.Model`,
    );
    rows = r || [];
  } catch (e) {
    if (
      e.code === "ER_BAD_FIELD_ERROR" &&
      e.message &&
      e.message.includes("SubModel")
    ) {
      const [r] = await pool.query(
        `SELECT v.VehicleID, v.StartYear, v.EndYear, v.Make, v.Model, b.slug
         FROM vehicles v
         INNER JOIN bodies b ON b.BodyID = v.BodyID
         WHERE b.slug IS NOT NULL AND b.slug != ''
         ORDER BY v.StartYear DESC, v.Make, v.Model`,
      );
      rows = r || [];
    } else {
      throw e;
    }
  }
  const out = [];
  for (const r of rows) {
    const start = parseInt(r.StartYear, 10) || 0;
    const end = parseInt(r.EndYear, 10) || start;
    const slug = r.slug || "";
    const make = r.Make || "";
    const model = r.Model || "";
    const subModel = r.SubModel ?? null;
    for (let y = Math.min(start, end); y <= Math.max(start, end); y++) {
      out.push({ year: y, make, model, subModel, platformSlug: slug });
    }
  }
  return out;
}

// Get new products. For scratchDent=0: only NewPart=1, within 90 days. For scratchDent=1 (Blem/Scratch & Dent): original logic, unchanged.
export async function getNewProducts(scratchDent, limit = 35) {
  const query = `
    SELECT
      p.*,
      CONCAT(b.StartYear, '-', b.EndYear) as YearRange,
      CASE
        WHEN b.StartYear = b.EndYear THEN CONCAT(b.StartYear, ' ', b.Name)
        ELSE CONCAT(b.StartYear, '-', b.EndYear, ' ', b.Name)
      END as PlatformName,
      c.CatName as CategoryName
    FROM products p
    LEFT JOIN bodies b ON p.BodyID = b.BodyID
    LEFT JOIN categories c ON p.CatID = c.CatID
    WHERE p.Display = 1 AND (p.endproduct = 0 OR p.endproduct = '0' OR p.endproduct IS NULL)
      AND p.NewPartDate != "0" AND p.NewPartDate IS NOT NULL AND p.NewPartDate != ''
      AND (
        (? = 0 AND p.NewPart = 1 AND p.BlemProduct = 0 AND STR_TO_DATE(p.NewPartDate, '%Y-%m-%d') >= DATE_SUB(CURDATE(), INTERVAL 90 DAY))
        OR
        (? = 1 AND p.BlemProduct = 1)
      )
    ORDER BY p.NewPartDate DESC
    LIMIT ?
  `;

  const [rows] = await pool.query(query, [
    scratchDent,
    scratchDent,
    parseInt(limit),
  ]);
  return rows;
}

//  Get products by platform ID
export async function getProductsByPlatformId(platformId) {
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE BodyID = ? AND Display = "1"',
    [platformId],
  );
  return rows;
}

// Get main categories (Suspension, Chassis, etc.) – resolves slug via getPlatformBySlug
export async function getMainCategories(platformSlug) {
  const platform = await getPlatformBySlug(platformSlug);
  if (!platform) return [];
  const query = `
    SELECT DISTINCT
      m.MainCatID as id,
      m.MainCatName as name,
      m.MainCatImage as image,
      m.MainCatSlug as slug
    FROM maincategories m
    JOIN categories c ON c.MainCatID = m.MainCatID
    JOIN products p ON p.CatID = c.CatID
    WHERE p.BodyID = ?
    AND p.Display = "1"
    ORDER BY m.MainCatName
  `;
  const [rows] = await pool.query(query, [platform.id]);
  return rows;
}

// Get categories by platform
export async function getCategoriesByPlatform(
  platformSlug,
  mainCategory = null,
) {
  const platform = await getPlatformBySlug(platformSlug);
  if (!platform) {
    return { categories: [], platformInfo: null };
  }

  let query = `
    SELECT DISTINCT
      c.CatID as id,
      c.CatName as name,
      c.CatImage as image,
      c.MainCatID as mainCategoryId,
      m.MainCatName as mainCategoryName,
      ? as platformName,
      ? as startYear,
      ? as endYear
    FROM categories c
    JOIN products p ON p.CatID = c.CatID
    JOIN maincategories m ON c.MainCatID = m.MainCatID
    WHERE p.BodyID = ?
    AND p.Display = 1
  `;

  const params = [
    platform.name,
    platform.startYear,
    platform.endYear,
    platform.id,
  ];

  if (mainCategory) {
    query += ` AND m.MainCatSlug = ?`;
    params.push(mainCategory);
  }

  query += ` ORDER BY c.CatName`;

  const [rows] = await pool.query(query, params);

  const platformInfo = {
    name: platform.name,
    startYear: platform.startYear,
    endYear: platform.endYear,
    image: platform.platformImage,
    slug: platform.slug,
  };

  const categories = rows.map(
    ({ platformName, startYear, endYear, ...category }) => category,
  );

  return {
    categories,
    platformInfo,
  };
}

// Get category by ID
export async function getCategoryById(catId) {
  const [rows] = await pool.query(
    `SELECT CatID, MainCatID, CatName, CatImage
     FROM categories
     WHERE CatID = ?
     ORDER BY CatName`,
    [catId],
  );
  return rows;
}

// Get categories by main category ID
export async function getCategoriesByMainCat(mainCatId) {
  const [rows] = await pool.query(
    "SELECT CatID, CatName, CatImage FROM categories WHERE MainCatID = ?",
    [mainCatId],
  );
  return rows;
}

//Get categories by platform ID
export async function getCategories(platformId) {
  const [rows] = await pool.query(
    'SELECT * FROM categories WHERE MainCatID = #getmaincats.maincatid# AND ParentID = "0" ORDER BY CatName',
    [platformId],
  );
  return rows;
}

// 4. Get one product per category by platform ID
export async function getOneProductPerCategoryByPlatformId(platformId) {
  const [rows] = await pool.query(
    `SELECT * FROM products p
     WHERE p.ProductID IN (
       SELECT MIN(ProductID)
       FROM products
       WHERE BodyID = ? AND Display = "1"
       GROUP BY CatID
     )`,
    [platformId],
  );
  return rows;
}

// Get product by ID
export async function getProductById(productId) {
  const [rows] = await pool.query(
    `SELECT
      p.*,
      CONCAT(b.StartYear, '-', b.EndYear) AS YearRange,
      b.Name AS PlatformName,
      c.CatName AS CategoryName,
      mc.MainCatName AS MainCategoryName,
      m.ManName AS ManufacturerName
    FROM products p
    JOIN bodies b ON p.BodyID = b.BodyID
    LEFT JOIN categories c ON p.CatID = c.CatID
    LEFT JOIN maincategories mc ON c.MainCatID = mc.MainCatID
    LEFT JOIN mans m ON p.ManID = m.ManID
    WHERE p.ProductID = ?
    AND p.Display = '1'
    AND p.EndProduct != '1'
    LIMIT 1`,
    [productId],
  );

  if (rows.length === 0) {
    throw new Error("Product not found");
  }

  const product = rows[0];

  // Helper function to parse the Images field and create small/large image pairs
  const parseImages = (imagesString) => {
    // Guard against null/undefined input
    if (
      !imagesString ||
      typeof imagesString !== "string" ||
      imagesString === "0" ||
      imagesString.trim() === ""
    ) {
      return [];
    }

    return imagesString
      .split(/[,;]/) // Split on both commas and semicolons
      .map((imgSrc) => imgSrc.trim()) // Trim whitespace
      .filter((imgSrc) => imgSrc !== "" && imgSrc !== "0") // Filter out invalid entries
      .reduce((acc, imgSrc, index, array) => {
        // Check if this is a small image (followed by a large image)
        if (index % 2 === 0 && index + 1 < array.length) {
          const smallImg = imgSrc;
          const largeImg = array[index + 1];

          // Only add if both small and large images are valid
          if (smallImg !== "0" && largeImg !== "0") {
            acc.push({
              imgSrc: getProductImageUrl(largeImg),
              smallImgSrc: getProductImageUrl(smallImg),
              alt: `Image ${acc.length + 1} for ${product?.ProductName}`,
              fill: true,
            });
          }
        }
        return acc;
      }, []);
  };

  // Create the main image object using ImageLarge if valid
  const mainImage =
    product.ImageLarge && product.ImageLarge.trim() !== "0"
      ? {
          imgSrc: getProductImageUrl(product.ImageLarge.trim()),
          smallImgSrc: getProductImageUrl(product.ImageLarge.trim()),
          alt: `Image for ${product?.PartNumber} - ${product?.ProductName}`,
          fill: true,
        }
      : null;

  // Parse other images from the Images field
  const otherImages = parseImages(product?.Images);

  // Combine the main image with other images (if mainImage exists)
  const images = mainImage ? [mainImage, ...otherImages] : otherImages;

  // Add the images array to the product object
  product.images = images;

  // Resolve hardware pack add-ons: product.hardwarepacks is a comma-separated list of product IDs (hardwarepack=1)
  const hardwarepacksRaw = product.hardwarepacks;
  if (
    hardwarepacksRaw &&
    typeof hardwarepacksRaw === "string" &&
    hardwarepacksRaw.trim() !== "" &&
    hardwarepacksRaw !== "0"
  ) {
    const packIds = hardwarepacksRaw
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "" && id !== "0");
    if (packIds.length > 0) {
      product.hardwarePackProducts = await getHardwarePackProducts(packIds);
    } else {
      product.hardwarePackProducts = [];
    }
  } else {
    product.hardwarePackProducts = [];
  }

  return product;
}

// Get hardware pack products by ID list (products with hardwarepack = 1). Returns ProductID, ProductName, PartNumber, Price.
export async function getHardwarePackProducts(productIds) {
  if (!productIds || productIds.length === 0) return [];
  const placeholders = productIds.map(() => "?").join(",");
  const [rows] = await pool.query(
    `SELECT ProductID, ProductName, PartNumber, Price
     FROM products
     WHERE ProductID IN (${placeholders}) AND hardwarepack = 1 AND Display = '1' AND EndProduct != '1'
     ORDER BY ProductID`,
    productIds,
  );
  return rows;
}

// Get all body categories ordered by position
export async function getBodyCategories() {
  const [rows] = await pool.query(`
    SELECT BodyCatID, BodyCatName, Position
    FROM bodycats
    ORDER BY Position
  `);
  return rows;
}

// Get platforms by category ID (BodyCatID = bodycats.BodyCatID)
export async function getBodiesByCategory(bodyCatId) {
  const [rows] = await pool.query(
    `
    SELECT PlatformID AS BodyID, Name, StartYear, EndYear, PlatformOrder AS BodyOrder
    FROM platforms
    WHERE BodyCatID = ?
    ORDER BY PlatformOrder
  `,
    [bodyCatId],
  );
  return rows;
}

// Get main categories by body ID
export async function getMainCategoriesByBody(bodyId) {
  const [rows] = await pool.query(
    `
    SELECT DISTINCT mc.MainCatID, mc.MainCatName
    FROM maincategories mc
    WHERE mc.BodyID = ?
    ORDER BY mc.MainCatID
  `,
    [bodyId],
  );
  return rows;
}

// Get platform by ID (BodyID = PlatformID)
export async function getBodyByBodyId(bodyId) {
  const [rows] = await pool.query(
    `
    SELECT PlatformID AS BodyID, Name, StartYear, EndYear, Image, HeaderImage, slug, BodyCatID, PlatformOrder AS BodyOrder
    FROM platforms
    WHERE PlatformID = ?
    ORDER BY Name
  `,
    [bodyId],
  );
  return rows;
}

// Get complete menu structure
export async function getMenuStructure() {
  try {
    const categories = await getBodyCategories();
    const menuStructure = {
      fordLinks: [],
      moparLinks: [],
      gmLateModelLinks: [],
      gmMidMuscleLinks: [],
      gmClassicMuscleLinks: [],
    };

    for (const category of categories) {
      const bodies = await getBodiesByCategory(category.BodyCatID);

      // For each body, fetch main categories
      const processedBodies = await Promise.all(
        bodies.map(async (body) => {
          const [mainCategories] = await pool.query(
            `
            SELECT MainCatID, MainCatName
            FROM maincategories
            WHERE BodyID = ?
          `,
            [body.BodyID],
          );

          // Determine the year part of the slug
          const yearPart =
            body.StartYear === body.EndYear
              ? body.StartYear
              : `${body.StartYear}-${body.EndYear}`;

          // Create URL-friendly versions of the names
          const platformSlug = `${yearPart}-${body.Name.toLowerCase().replace(
            /\s+/g,
            "-",
          )}`;

          return {
            heading: `${body.StartYear} - ${body.EndYear} ${body.Name}`,
            slug: platformSlug,
            links: mainCategories.map((cat) => ({
              href: `/products/${platformSlug}/${cat.MainCatName.toLowerCase().replace(
                /\s+/g,
                "-",
              )}`,
              text: cat.MainCatName,
            })),
          };
        }),
      );

      // Categorize based on body category name
      switch (category.BodyCatName) {
        case "Ford":
          menuStructure.fordLinks = processedBodies;
          break;
        case "Mopar":
          menuStructure.moparLinks = processedBodies;
          break;
        case "GM Late Model Cars":
          menuStructure.gmLateModelLinks = processedBodies;
          break;
        case "GM Mid Muscle Cars":
          menuStructure.gmMidMuscleLinks = processedBodies;
          break;
        case "GM Classic Muscle Cars":
          menuStructure.gmClassicMuscleLinks = processedBodies;
          break;
      }

      // Add console log to inspect categories
      //console.log("Categories:", categories);

      // Add console log to inspect bodies
      //console.log("Bodies for category:", category.BodyCatName, bodies);

      // Add console log to inspect processed bodies
      //console.log("Processed Bodies:", processedBodies);

      // console.log("Processed Bodies with Slug:", processedBodies);
    }

    return menuStructure;
  } catch (error) {
    console.error("Error fetching menu structure:", error);
    return {
      fordLinks: [],
      moparLinks: [],
      gmLateModelLinks: [],
      gmMidMuscleLinks: [],
      gmClassicMuscleLinks: [],
    };
  }
}

export async function getPlatformCategories(platformSlug) {
  console.log("🔍 Platform Name:", platformSlug);

  const query = `
    SELECT DISTINCT c.CatID as id, c.CatName as name
    FROM categories c
    JOIN products p ON c.CatID = p.CatID
    JOIN bodies b ON p.BodyID = b.BodyID
    WHERE b.slug = ?
    AND p.Display = "1"
  `;

  // Execute the query with only the platform name
  const [rows] = await pool.query(query, [platformSlug]);

  return rows;
}

export async function getFilteredProducts(platformName, categoryId = null) {
  // Split the platformName to get year range and actual name
  const matches = platformName.match(/^\(\d{4}-\d{4}\)-(.+)$/);
  let yearRange, name;

  if (matches) {
    [, yearRange, name] = matches;
  } else {
    name = platformName;
  }

  let query = `
    SELECT p.*
    FROM products p
    JOIN bodies b ON p.BodyID = b.BodyID
    WHERE b.Name = ?
    ${yearRange ? "AND b.StartYear = ? AND b.EndYear = ?" : ""}
    AND p.Display = "1"
  `;

  const params = yearRange ? [name, ...yearRange.split("-")] : [name];

  if (categoryId) {
    query += ` AND FIND_IN_SET(?, p.CatID)`;
    params.push(categoryId);
  }

  const [rows] = await pool.query(query, params);
  return rows;
}

// Add this new function to get product types
export async function getProductTypes(platformName) {
  const query = `
    SELECT DISTINCT
      c.CatID as id,
      c.CatName as name,
      c.CatImage as image,
      c.MainCatID as mainCategoryId
    FROM categories c
    JOIN products p ON p.CatID = c.CatID
    JOIN bodies b ON p.BodyID = b.BodyID
    WHERE b.Name = ?
    AND p.Display = "1"
    ORDER BY c.CatName
  `;

  console.log("Product Types Query:", query, [platformName]); // Debug log
  const [rows] = await pool.query(query, [platformName]);
  console.log("Product Types Result:", rows); // Debug log
  return rows;
}

// Helper function to get all platforms
export async function getPlatforms() {
  const query = `
    SELECT
      slug,
      Name as name,
      StartYear as startYear,
      EndYear as endYear,
      Image as image,
      HeaderImage as headerImage
    FROM bodies
    WHERE Display = "1"
    ORDER BY Name, StartYear
  `;

  const [rows] = await pool.query(query);
  return rows;
}

// Build platform slug in canonical form: year-year-name (e.g. 2006-2013-corvette-z06-zr1)
// Slashes in names (e.g. Z06/ZR1) become hyphens. Works for bodies or platforms rows.
function buildPlatformSlugFromRow(row) {
  const nameSlug = (row.Name ?? row.name ?? "")
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const start = (row.StartYear ?? row.startYear ?? "").toString().trim();
  const end = (row.EndYear ?? row.endYear ?? "").toString().trim();
  return `${start}-${end}-${nameSlug}`.replace(/-+/g, "-");
}

// Normalize slug for comparison (exact and loose)
function normalizeSlug(slug) {
  return (slug || "")
    .toLowerCase()
    .trim()
    .replace(/\//g, "-")
    .replace(/-+/g, "-");
}

// Map a platform row (from platforms or bodies) to the common API shape.
// id is PlatformID or BodyID so product/maincategory queries (which use BodyID) work.
function toPlatformShape(row, slugValue) {
  const image = row.platformImage ?? row.Image ?? row.image;
  return {
    id: row.id ?? row.PlatformID ?? row.BodyID,
    name: row.name ?? row.Name,
    startYear: row.startYear ?? row.StartYear,
    endYear: row.endYear ?? row.EndYear,
    platformImage: image,
    headerImage: row.headerImage ?? row.HeaderImage,
    slug: slugValue ?? buildPlatformSlugFromRow(row),
    image,
  };
}

// Safely decode URL-encoded slug (handles %2F etc); production may pass encoded values.
function decodeSlug(s) {
  if (typeof s !== "string" || !s) return s;
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

// Get platform by slug from platforms table.
export async function getPlatformBySlug(slug) {
  const decoded = decodeSlug(slug);
  const normalizedSlug = normalizeSlug(decoded);
  const normalizedNoHyphens = normalizedSlug.replace(/-/g, "");

  // 1) Prefer platforms table (has slug column; supports NULL slug via computed)
  try {
    const [platformRows] = await pool.query(
      `SELECT PlatformID as id, Name as name, StartYear as startYear,
        EndYear as endYear, Image as platformImage, HeaderImage as headerImage, slug
       FROM platforms`,
    );
    for (const row of platformRows) {
      const rowSlug =
        (row.slug && row.slug.trim()) || buildPlatformSlugFromRow(row);
      if (rowSlug === normalizedSlug) {
        return toPlatformShape(row, rowSlug);
      }
    }
    if (normalizedNoHyphens.length > 0) {
      for (const row of platformRows) {
        const rowSlug =
          (row.slug && row.slug.trim()) || buildPlatformSlugFromRow(row);
        if (rowSlug.replace(/-/g, "") === normalizedNoHyphens) {
          return toPlatformShape(row, rowSlug);
        }
      }
    }
  } catch (err) {
    if (err.code !== "ER_NO_SUCH_TABLE") throw err;
  }

  console.error("❌ No platform found for slug:", slug);
  return null;
}

/**
 * Fetch a platform by ID from platforms table.
 * id is PlatformID (used as BodyID in product/maincategory/vehicles queries).
 */
export async function getPlatformById(id) {
  const numId = parseInt(id, 10);
  if (Number.isNaN(numId)) return null;

  try {
    const [platformRows] = await pool.query(
      `SELECT PlatformID as id, Name as name, StartYear as startYear,
        EndYear as endYear, Image as platformImage, HeaderImage as headerImage, slug
       FROM platforms WHERE PlatformID = ?`,
      [numId],
    );
    if (platformRows.length > 0) {
      const row = platformRows[0];
      const slugVal =
        (row.slug && row.slug.trim()) || buildPlatformSlugFromRow(row);
      return toPlatformShape(row, slugVal);
    }
  } catch (err) {
    if (err.code !== "ER_NO_SUCH_TABLE") throw err;
  }

  console.error("❌ No platform found for id:", id);
  return null;
}

// Get main category by ID
export async function getMainCategoryById(mainCategoryId) {
  const [rows] = await pool.query(
    "SELECT * FROM maincategories WHERE MainCatID = ?",
    [mainCategoryId],
  );
  return rows[0];
}

export async function fetchCategories() {
  const [categories] = await pool.query(`
    SELECT mc.MainCatID, mc.MainCatName, mc.MainCatImage,
           p.Name as PlatformName
    FROM maincategories mc
    LEFT JOIN platforms p ON p.PlatformID = mc.BodyID
    ORDER BY mc.MainCatID
  `);

  return categories;
}

export async function getSubCategories(mainCategoryId) {
  const [rows] = await pool.query(
    `
    SELECT
      c.CatID,
      c.CatName,
      c.CatImage,
      COUNT(p.ProductID) as ProductCount
    FROM categories c
    LEFT JOIN products p ON p.CatID = c.CatID
    WHERE c.MainCatID = ?
    GROUP BY c.CatID, c.CatName, c.CatImage
    ORDER BY ProductCount DESC
  `,
    [mainCategoryId],
  );
  return rows;
}

// Get products by main category and platform
export async function getProductsByMainCategory(
  platformSlug,
  mainCategory,
  limit = null,
) {
  let query = `
    SELECT DISTINCT
      p.*,
      c.CatName as categoryName,
      CONCAT(b.StartYear, '-', b.EndYear) as yearRange,
      b.Name as platformName,
      b.slug as platformSlug
    FROM products p
    JOIN bodies b ON p.BodyID = b.BodyID
    JOIN categories c ON p.CatID = c.CatID
    JOIN maincategories m ON c.MainCatID = m.MainCatID
    WHERE b.slug = ?
    AND m.MainCatSlug = ?
    AND p.Display = "1"
    AND p.EndProduct != 1
    ORDER BY p.NewPart DESC, p.ProductName
  `;

  if (limit) {
    query += ` LIMIT ?`;
  }

  const params = limit
    ? [platformSlug, mainCategory, limit]
    : [platformSlug, mainCategory];
  const [rows] = await pool.query(query, params);
  return rows;
}

// Get featured products by platform slug (resolves slug via getPlatformBySlug; no bodies.slug column)
export async function getFeaturedProductsByPlatform(platformSlug, limit = 8) {
  const platform = await getPlatformBySlug(platformSlug);
  if (!platform) return [];
  return getFeaturedProductsByBodyId(platform.id, limit);
}

// Get featured products by BodyID directly
export async function getFeaturedProductsByBodyId(bodyId, limit = 8) {
  const query = `
    SELECT
      p.ProductID,
      p.ProductName,
      p.Description,
      p.Price,
      p.ImageSmall,
      p.PartNumber,
      p.fproduct
    FROM products p
    WHERE p.BodyID = ?
      AND p.Display = 1
      AND p.fproduct = 1
    ORDER BY RAND()
    LIMIT ?
  `;

  const [products] = await pool.query(query, [bodyId, limit]);
  return products;
}

export async function getProductsByPlatformAndMainCat(platformId, mainCatId) {
  const [rows] = await pool.query(
    "SELECT * FROM products WHERE BodyID = ? AND MainCatID = ?",
    [platformId, mainCatId],
  );
  return rows;
}

async function getProductData(productSlug, platform, mainCategory, category) {
  try {
    // Get platform ID
    const platformQuery = `
      SELECT BodyID
      FROM bodies
      WHERE slug LIKE ?
      LIMIT 1
    `;

    const platformData = await pool.queryOne(platformQuery, [`%${platform}%`]);

    if (!platformData) {
      return null;
    }

    // Get category ID
    const categoryQuery = `
      SELECT CatID
      FROM categories
      WHERE CatName LIKE ?
      LIMIT 1
    `;

    const categoryData = await pool.queryOne(categoryQuery, [
      `%${category.replace(/-/g, " ")}%`,
    ]);

    if (!categoryData) {
      return null;
    }

    // Get product by slug and category
    const productQuery = `
      SELECT
        p.ProductID,
        p.ProductName,
        p.PartNumber,
        p.Description,
        p.Features,
        p.Price,
        p.Retail,
        p.ImageSmall,
        p.ImageLarge,
        p.Images,
        p.Instructions,
        p.Color,
        p.Hardware,
        p.Grease,
        p.AngleFinder,
        p.video
      FROM products p
      WHERE p.BodyID = ?
        AND FIND_IN_SET(?, p.CatID)
        AND p.ProductName LIKE ?
      LIMIT 1
    `;

    const productData = await pool.queryOne(productQuery, [
      platformData.BodyID,
      categoryData.CatID,
      `%${productSlug.replace(/-/g, " ")}%`,
    ]);

    if (!productData) {
      return null;
    }

    // Get related products
    const relatedProductsQuery = `
      SELECT
        p.ProductID,
        p.ProductName,
        p.PartNumber,
        p.Price,
        p.ImageSmall
      FROM products p
      WHERE p.BodyID = ?
        AND FIND_IN_SET(?, p.CatID)
        AND p.ProductID != ?
      LIMIT 4
    `;

    const relatedProducts = await pool.query(relatedProductsQuery, [
      platformData.BodyID,
      categoryData.CatID,
      productData.ProductID,
    ]);

    return {
      product: productData,
      relatedProducts,
    };
  } catch (error) {
    console.error("Error fetching product data:", error);
    return null;
  }
}

// Get featured products for a given platform and main category
export async function getFeaturedProductsByMainCategory(
  platform,
  mainCategory,
) {
  // You may need to join products and categories tables
  // Example SQL (adjust as needed for your schema):
  // SELECT * FROM products WHERE Display=1 AND MainCatID=? AND BodyID=?
  const products = await pool.query(
    "SELECT * FROM products WHERE Display=1 AND EndProduct=0 AND MainCatID=? AND BodyID=? ORDER BY NewPartDate DESC LIMIT 8",
    [mainCategory, platform],
  );
  return products;
}

export async function getCategoriesByMainCatId(mainCatId) {
  const [rows] = await pool.query(
    `SELECT c.*,
     COUNT(DISTINCT CASE WHEN FIND_IN_SET(c.CatID, p.CatID) AND p.Display = 1 AND p.EndProduct != 1 THEN p.ProductID END) as productCount
     FROM categories c
     LEFT JOIN products p ON FIND_IN_SET(c.CatID, p.CatID)
     WHERE c.MainCatID = ?
     GROUP BY c.CatID, c.CatName, c.CatSlug, c.CatImage, c.MainCatID
     ORDER BY c.CatName`,
    [mainCatId],
  );
  return rows;
}

export async function getMainCategoryIdBySlugAndPlatform(
  platformSlug,
  mainCategorySlug,
) {
  // Convert slug to potential name variants
  const searchName = mainCategorySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const slugLower = mainCategorySlug.toLowerCase();
  const nameLower = searchName.toLowerCase();

  // 1) Try via bodies.slug (legacy: slug lives on bodies)
  const queryViaBodies = `
    SELECT mc.MainCatID
    FROM maincategories mc
    JOIN bodies b ON mc.BodyID = b.BodyID
    WHERE b.slug = ?
    AND (
      LOWER(REPLACE(mc.MainCatName, ' ', '-')) = ? OR
      LOWER(mc.MainCatName) = ? OR
      mc.MainCatName LIKE ?
    )
    LIMIT 1
  `;
  const [rowsBodies] = await pool.query(queryViaBodies, [
    platformSlug,
    slugLower,
    nameLower,
    `%${searchName}%`,
  ]);
  if (rowsBodies?.[0]?.MainCatID) return rowsBodies[0].MainCatID;

  // 2) Fallback: resolve platform by slug (platforms + bodies), then match main category by BodyID
  const platform = await getPlatformBySlug(platformSlug);
  if (!platform?.id) return null;
  const queryViaBodyId = `
    SELECT MainCatID
    FROM maincategories
    WHERE BodyID = ?
    AND (
      LOWER(REPLACE(MainCatName, ' ', '-')) = ? OR
      LOWER(MainCatName) = ? OR
      MainCatName LIKE ?
    )
    LIMIT 1
  `;
  const [rowsId] = await pool.query(queryViaBodyId, [
    platform.id,
    slugLower,
    nameLower,
    `%${searchName}%`,
  ]);
  return rowsId?.[0]?.MainCatID || null;
}

// Get all main categories with product count (resolves slug via getPlatformBySlug; no bodies.slug column)
export async function getMainCategoriesWithProductCount(platformSlug) {
  const platform = await getPlatformBySlug(platformSlug);
  if (!platform) return [];
  return getMainCategoriesWithProductCountByBodyId(platform.id);
}

// Get all main categories with product count by BodyID directly
export async function getMainCategoriesWithProductCountByBodyId(bodyId) {
  const query = `
		SELECT
			m.MainCatID as id,
			m.MainCatName as name,
			m.MainCatImage as image,
			m.MainCatSlug as slug,
			COUNT(p.ProductID) as productCount
		FROM maincategories m
		LEFT JOIN categories c ON c.MainCatID = m.MainCatID
		LEFT JOIN products p ON FIND_IN_SET(c.CatID, p.CatID) AND p.Display = 1 AND p.EndProduct != 1
		WHERE m.BodyID = ?
		GROUP BY m.MainCatID, m.MainCatName, m.MainCatImage, m.MainCatSlug
		ORDER BY m.MainCatName
	`;
  const [rows] = await pool.query(query, [bodyId]);
  return rows; // [{ id, name, image, slug, productCount }, ...]
}

// Get all subcategories (product types) for a main category with product count
export async function getProductTypesWithProductCount(mainCatId) {
  const sql = `
		SELECT
			c.CatID,
			c.CatName,
			COUNT(p.ProductID) AS productCount
		FROM
			categories c
		LEFT JOIN
			products p ON c.CatID = p.CatID
		WHERE
			c.MainCatID = ?
		GROUP BY
			c.CatID
		ORDER BY
			c.CatName
	`;
  return await pool.query(sql, [mainCatId]);
}

export async function getMainCategoryProductCounts(platformSlug) {
  const query = `
		SELECT
			m.MainCatID,
			m.MainCatName,
			COUNT(p.ProductID) AS productCount
		FROM maincategories m
		JOIN categories c ON c.MainCatID = m.MainCatID
		JOIN products p ON FIND_IN_SET(c.CatID, p.CatID)
		JOIN bodies b ON p.BodyID = b.BodyID
		WHERE b.slug = ?
			AND p.Display = 1
			AND p.EndProduct != 1
		GROUP BY m.MainCatID, m.MainCatName
		ORDER BY m.MainCatName
	`;
  const [rows] = await pool.query(query, [platformSlug]);
  return rows; // [{ MainCatID, MainCatName, productCount }, ...]
}

export async function getSubCategoriesWithProductCount(
  platformSlug,
  mainCatId,
) {
  const platform = await getPlatformBySlug(platformSlug);
  if (!platform) return [];
  const query = `
		SELECT
			c.CatID as id,
			c.CatName as name,
			c.CatImage as image,
			COUNT(p.ProductID) as productCount
		FROM categories c
		LEFT JOIN products p
			ON FIND_IN_SET(c.CatID, p.CatID)
			AND p.Display = 1
			AND p.EndProduct != 1
			AND p.BodyID = ?
		WHERE c.MainCatID = ?
		GROUP BY c.CatID, c.CatName, c.CatImage
		ORDER BY c.CatName
	`;
  const [rows] = await pool.query(query, [platform.id, mainCatId]);
  return rows; // [{ id, name, image, productCount }, ...]
}

export async function getFilteredProductsPaginated({
  platformId,
  mainCategoryId,
  categoryId,
  limit,
  offset,
  colors = [],
  brands = [],
}) {
  let where = ["p.Display = 1", "p.EndProduct != 1"];
  let params = [];
  let joins = "";

  if (platformId) {
    where.push("p.BodyID = ?");
    params.push(platformId);
  }

  if (mainCategoryId) {
    // Join with categories table to filter by main category
    joins = "JOIN categories c ON FIND_IN_SET(c.CatID, p.CatID)";
    where.push("c.MainCatID = ?");
    params.push(mainCategoryId);
  }

  if (categoryId != null && categoryId !== "") {
    const catIds = Array.isArray(categoryId) ? categoryId : [categoryId];
    const validIds = catIds.filter((id) => id != null && id !== "");
    if (validIds.length) {
      if (validIds.length === 1) {
        where.push("FIND_IN_SET(?, p.CatID)");
        params.push(validIds[0]);
      } else {
        where.push(
          "(" +
            validIds.map(() => "FIND_IN_SET(?, p.CatID)").join(" OR ") +
            ")",
        );
        params.push(...validIds);
      }
    }
  }

  if (colors.length) {
    where.push(
      "(" + colors.map(() => "FIND_IN_SET(?, p.Color)").join(" OR ") + ")",
    );
    params.push(...colors);
  }
  if (brands.length) {
    where.push("(" + brands.map(() => "p.Brand = ?").join(" OR ") + ")");
    params.push(...brands);
  }

  const whereClause = where.length ? "WHERE " + where.join(" AND ") : "";

  const sql = `
    SELECT DISTINCT p.*
    FROM products p
    ${joins}
    ${whereClause}
    ORDER BY p.ProductID DESC
    LIMIT ? OFFSET ?
  `;

  params.push(Number(limit), Number(offset));
  console.log("DEBUG: SQL", sql);
  console.log("DEBUG: Params", params);

  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function getCategoryIdBySlugAndMainCat(
  mainCategoryId,
  categorySlug,
) {
  const ids = await getCategoryIdsBySlugAndMainCat(
    mainCategoryId,
    categorySlug,
  );
  return ids.length ? ids[0] : null;
}

/** Returns all category IDs for a given slug under a main category (handles duplicate slugs). */
export async function getCategoryIdsBySlugAndMainCat(
  mainCategoryId,
  categorySlug,
) {
  if (!categorySlug || !mainCategoryId) return [];
  const slug = String(categorySlug).toLowerCase().trim();
  const query = `
    SELECT CatID
    FROM categories
    WHERE MainCatID = ?
      AND (LOWER(TRIM(COALESCE(CatNameSlug, ''))) = ?
           OR LOWER(TRIM(COALESCE(CatSlug, ''))) = ?)
    ORDER BY CatID
  `;
  const [rows] = await pool.query(query, [mainCategoryId, slug, slug]);
  return (rows || []).map((r) => r.CatID);
}

//get all colors
export async function getAllColors() {
  const query = `SELECT * FROM colors`;
  const [rows] = await pool.query(query);
  return rows;
}

// Get category by slug within platform/mainCategory context
export async function getCategoryBySlugAndPlatform(
  platformId,
  mainCategoryId,
  categorySlug,
) {
  const query = `
    SELECT c.*
    FROM categories c
    JOIN maincategories mc ON c.MainCatID = mc.MainCatID
    WHERE c.CatSlug = ?
    AND mc.BodyID = ?
    AND c.MainCatID = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(query, [
    categorySlug,
    platformId,
    mainCategoryId,
  ]);
  return rows[0] || null;
}

// Get category slug by ID
export async function getCategorySlugById(categoryId) {
  const query = `SELECT CatSlug FROM categories WHERE CatID = ? LIMIT 1`;
  const [rows] = await pool.query(query, [categoryId]);
  return rows[0]?.CatSlug || null;
}

// Get all categories for a platform with slugs
export async function getCategoriesWithSlugs(
  platformId,
  mainCategoryId = null,
) {
  let query = `
    SELECT c.CatID, c.CatName, c.CatSlug, c.CatImage, c.MainCatID
    FROM categories c
    JOIN maincategories mc ON c.MainCatID = mc.MainCatID
    WHERE mc.BodyID = ?
  `;

  const params = [platformId];

  if (mainCategoryId) {
    query += ` AND c.MainCatID = ?`;
    params.push(mainCategoryId);
  }

  query += ` ORDER BY c.CatName`;

  const [rows] = await pool.query(query, params);
  return rows;
}

export async function getCategoriesForMainCategory(mainCategoryId) {
  const query = `
    SELECT CatID, CatName, CatSlug, CatImage, MainCatID
    FROM categories
    WHERE MainCatID = ?
    ORDER BY CatName
  `;

  const [rows] = await pool.query(query, [mainCategoryId]);
  return rows;
}

// Get all grease options
export async function getAllGreaseOptions() {
  const query = `SELECT * FROM grease ORDER BY GreaseID`;
  console.log("Grease query:", query);
  const [rows] = await pool.query(query);
  console.log("Grease query result:", rows);
  return rows;
}

// Get all anglefinder options
export async function getAllAnglefinderOptions() {
  const query = `SELECT * FROM anglefinder ORDER BY AngleID`;
  const [rows] = await pool.query(query);
  return rows;
}

// Legacy hardware table removed; hardware packs are now products (hardwarepack=1).
// Return empty for backward compatibility with /api/hardware.
export async function getAllHardwareOptions() {
  return [];
}

// Admin: Get all products where hardwarepack=1 for the Hardware Packs multi-select
export async function getHardwarePackProductsForAdmin() {
  try {
    const [rows] = await pool.query(
      `SELECT ProductID, ProductName, PartNumber, Price
       FROM products
       WHERE hardwarepack = 1
       ORDER BY PartNumber ASC`,
    );
    return rows || [];
  } catch (error) {
    console.error("Error fetching hardware pack products:", error);
    return [];
  }
}

// Get related products for a specific product
export async function getRelatedProducts(productId) {
  try {
    // Fetch the current product to get its category and platform
    const product = await getProductById(productId);

    // Query to fetch related products from the same body and category
    const query = `
      SELECT p.*,
             CONCAT(b.StartYear, '-', b.EndYear) AS YearRange,
             b.Name AS PlatformName,
             c.CatName AS CategoryName
      FROM products p
      JOIN bodies b ON p.BodyID = b.BodyID
      LEFT JOIN categories c ON p.CatID = c.CatID
      WHERE p.BodyID = ?
        AND p.CatID = ?
        AND p.ProductID != ?
        AND p.Display = 1
      LIMIT 4
    `;

    const [rows] = await pool.query(query, [
      product.BodyID,
      product.CatID,
      productId,
    ]);

    return rows;
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

export async function ensureNewsletterSubscribersTableExists() {
  try {
    await pool.query("SELECT 1 FROM newsletter_subscribers LIMIT 1");
    return true;
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE" || error.code === 1146) {
      const createTableQuery = `
				CREATE TABLE IF NOT EXISTS newsletter_subscribers (
					id int unsigned NOT NULL AUTO_INCREMENT,
					email varchar(255) NOT NULL,
					created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
					PRIMARY KEY (id),
					UNIQUE KEY email (email)
				) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
				COLLATE=utf8mb4_unicode_ci
			`;

      try {
        await pool.query(createTableQuery);
        return true;
      } catch (createError) {
        console.error(
          "Error creating newsletter_subscribers table:",
          createError,
        );
        return false;
      }
    }

    console.error("Error checking newsletter_subscribers table:", error);
    return false;
  }
}

export async function getNewsletterSubscriberByEmail(email) {
  const query = `
		SELECT id, email
		FROM newsletter_subscribers
		WHERE email = ?
		LIMIT 1
	`;

  const [rows] = await pool.query(query, [email]);
  return rows[0] || null;
}

export async function createNewsletterSubscriber(email) {
  const query = `
		INSERT INTO newsletter_subscribers (email)
		VALUES (?)
	`;

  const [result] = await pool.query(query, [email]);
  return result?.insertId || null;
}

// Get coupon by code (using coupons_new table)
export async function getCouponByCode(couponCode) {
  try {
    // Trim and normalize coupon code
    const normalizedCode = couponCode.trim();

    if (!normalizedCode || normalizedCode === "") {
      return null;
    }

    const query = `
      SELECT
        id,
        code,
        name,
        description,
        discount_type,
        discount_value,
        min_cart_amount,
        max_discount_amount,
        start_date,
        end_date,
        start_time,
        end_time,
        usage_limit,
        usage_limit_per_customer,
        times_used,
        free_shipping,
        shipping_discount,
        is_active,
        is_public,
        customer_segments,
        product_categories,
        excluded_products,
        min_products
      FROM coupons_new
      WHERE TRIM(code) = ?
        AND is_active = 1
        AND is_public = 1
        AND start_date <= CURDATE()
        AND end_date >= CURDATE()
        AND (
          start_time IS NULL
          OR start_time = '00:00:00'
          OR TIME(NOW()) >= start_time
        )
        AND (
          end_time IS NULL
          OR end_time = '23:59:59'
          OR TIME(NOW()) <= end_time
        )
        AND (usage_limit IS NULL OR times_used < usage_limit)
      ORDER BY created_at DESC
      LIMIT 1
    `;

    console.log("Executing query:", query);
    console.log("With parameters:", [normalizedCode]);
    const [rows] = await pool.query(query, [normalizedCode]);
    console.log("Query result for coupon", normalizedCode, ":", rows);
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return null;
  }
}

// Get coupon by ID only if is_active = 1 (for server-side validation on order/capture).
export async function getCouponByIdIfActive(couponId) {
  if (couponId == null || couponId === "") return null;
  try {
    const id = typeof couponId === "number" ? couponId : parseInt(couponId, 10);
    if (Number.isNaN(id)) return null;
    const [rows] = await pool.query(
      "SELECT id, code, is_active FROM coupons_new WHERE id = ? AND is_active = 1 LIMIT 1",
      [id],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching coupon by ID:", error);
    return null;
  }
}

// Validate coupon for cart (using coupons_new table).
// Coupons apply only to eligible lines (individual BMR Suspension products); other lines get no discount.
// Lower 48 US required for discount; lineItemDiscounts returned for cart/checkout/receipt display.
export async function validateCouponForCart(
  couponCode,
  cartItems,
  customerId = null,
  shippingAddress = null,
) {
  try {
    const coupon = await getCouponByCode(couponCode);

    if (!coupon) {
      return {
        valid: false,
        message: "Invalid or expired coupon code",
      };
    }

    // Coupons require shipping to lower 48 US states
    if (shippingAddress) {
      const country = shippingAddress.country || shippingAddress.Country || "";
      const state =
        shippingAddress.state ||
        shippingAddress.State ||
        shippingAddress.stateProvince ||
        "";
      const isUS =
        country === "US" || country === "United States" || country === "USA";
      if (!isUS || !isLower48UsState(state)) {
        return {
          valid: false,
          message:
            "This coupon only applies to orders shipping to the lower 48 US states.",
        };
      }
    }

    // Full cart total (for min_cart_amount)
    const cartTotal = (cartItems || []).reduce(
      (sum, item) => sum + parseFloat(item.Price || 0) * (item.quantity || 1),
      0,
    );

    // Check minimum cart amount
    if (
      coupon.min_cart_amount &&
      cartTotal < parseFloat(coupon.min_cart_amount)
    ) {
      return {
        valid: false,
        message: `Minimum order amount of $${coupon.min_cart_amount} required`,
      };
    }

    // Check if coupon is already used by this customer
    if (customerId && coupon.usage_limit_per_customer) {
      const usageQuery = `
        SELECT COUNT(*) as usageCount
        FROM coupon_usage
        WHERE coupon_id = ? AND customer_id = ?
      `;
      const [usageRows] = await pool.query(usageQuery, [coupon.id, customerId]);

      if (usageRows[0].usageCount >= coupon.usage_limit_per_customer) {
        return {
          valid: false,
          message: "You have already used this coupon",
        };
      }
    }

    // Which product IDs are eligible for discount (BMR individual parts only)
    const productIds = (cartItems || [])
      .map((item) => item?.ProductID ?? item?.productId)
      .filter((id) => id != null && !isNaN(Number(id)));
    const eligibleIds = await getCouponEligibleProductIds(productIds);

    // Per-line subtotal (main product price * qty only) and eligible subtotal
    const lineSubtotals = (cartItems || []).map((item) => {
      const lineSub = parseFloat(item.Price || 0) * (item.quantity || 1);
      return {
        lineSub,
        eligible: eligibleIds.has(Number(item?.ProductID ?? item?.productId)),
      };
    });
    const eligibleSubtotal = lineSubtotals
      .filter((x) => x.eligible)
      .reduce((sum, x) => sum + x.lineSub, 0);

    // If no eligible items, coupon doesn't apply to this cart
    if (eligibleSubtotal <= 0) {
      return {
        valid: false,
        message:
          "This coupon only applies to individual BMR Suspension products. No qualifying items in your cart (excludes other brands, scratch & dent, packages, merchandise, and low-margin items).",
      };
    }

    const discountType = coupon.discount_type || "";
    const discountValue = parseFloat(coupon.discount_value || 0);
    let freeShipping =
      coupon.free_shipping === 1 || coupon.free_shipping === true;

    let totalDiscount = 0;
    if (discountValue > 0) {
      if (discountType === "percentage") {
        totalDiscount = (eligibleSubtotal * discountValue) / 100;
        if (
          coupon.max_discount_amount &&
          totalDiscount > parseFloat(coupon.max_discount_amount)
        ) {
          totalDiscount = parseFloat(coupon.max_discount_amount);
        }
      } else if (discountType === "fixed_amount") {
        totalDiscount = Math.min(discountValue, eligibleSubtotal);
      }
    }
    if (discountType === "free_shipping") {
      freeShipping = true;
    }

    // Distribute total discount across eligible lines proportionally
    const lineItemDiscounts = lineSubtotals.map(({ lineSub, eligible }) => {
      if (!eligible || lineSub <= 0) return 0;
      const amount =
        Math.round(totalDiscount * (lineSub / eligibleSubtotal) * 100) / 100;
      return amount;
    });
    // Fix rounding: ensure sum(lineItemDiscounts) === totalDiscount
    const currentSum = lineItemDiscounts.reduce((a, b) => a + b, 0);
    if (currentSum !== totalDiscount && lineItemDiscounts.length > 0) {
      const diff = totalDiscount - currentSum;
      const lastEligibleIndex = lineSubtotals
        .map((x, i) => (x.eligible ? i : -1))
        .filter((i) => i >= 0)
        .pop();
      if (lastEligibleIndex != null) {
        lineItemDiscounts[lastEligibleIndex] =
          Math.round((lineItemDiscounts[lastEligibleIndex] + diff) * 100) / 100;
      }
    }

    console.log("Coupon discount (eligible only):", {
      code: coupon.code,
      eligibleSubtotal,
      totalDiscount,
      lineItemDiscounts,
    });

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountAmount: totalDiscount,
        freeShipping,
        discountValue,
        discountType,
        shippingDiscount: parseFloat(coupon.shipping_discount || 0),
        lineItemDiscounts,
      },
    };
  } catch (error) {
    console.error("Error validating coupon:", error);
    return {
      valid: false,
      message: "Error validating coupon",
    };
  }
}

// Record coupon usage (using coupons_new and coupon_usage tables)
export async function recordCouponUsage(
  couponId,
  customerId,
  invoiceId,
  discountAmount,
  cartTotal = 0,
) {
  try {
    // Update coupon usage count in coupons_new
    await pool.query(
      "UPDATE coupons_new SET times_used = times_used + 1 WHERE id = ?",
      [couponId],
    );

    // Record in coupon_usage table
    await pool.query(
      `
      INSERT INTO coupon_usage
      (coupon_id, customer_id, order_id, discount_amount, cart_total)
      VALUES (?, ?, ?, ?, ?)
    `,
      [couponId, customerId, invoiceId, discountAmount, cartTotal],
    );

    return true;
  } catch (error) {
    console.error("Error recording coupon usage:", error);
    return false;
  }
}

// Search products by query string
export async function searchProducts(searchQuery, limit = 20, offset = 0) {
  if (!searchQuery || searchQuery.trim() === "") {
    return [];
  }

  const query = `
    SELECT
      p.ProductID,
      p.PartNumber,
      p.ProductName,
      p.Description,
      p.Price,
      p.Retail,
      p.ImageSmall,
      p.ImageLarge,
      p.Images,
      p.Features,
      p.Color,
      p.Hardware,
      p.Grease,
      p.AngleFinder,
      p.FreeShipping,
      p.NewPart,
      p.UsaMade,
      b.Name as PlatformName,
      b.slug as PlatformSlug,
      m.ManName as BrandName
    FROM products p
    LEFT JOIN bodies b ON p.BodyID = b.BodyID
    LEFT JOIN mans m ON p.ManID = m.ManID
    WHERE p.Display = 1
      AND p.EndProduct != 1
      AND (
        p.ProductName LIKE ?
        OR p.PartNumber LIKE ?
        OR p.Description LIKE ?
        OR p.Features LIKE ?
      )
    ORDER BY
      CASE
        WHEN p.ProductName LIKE ? THEN 1
        WHEN p.PartNumber LIKE ? THEN 2
        ELSE 3
      END,
      p.ProductID DESC
    LIMIT ? OFFSET ?
  `;

  const searchTerm = `%${searchQuery}%`;
  const exactMatch = `${searchQuery}%`;

  const [rows] = await pool.query(query, [
    searchTerm,
    searchTerm,
    searchTerm,
    searchTerm,
    exactMatch,
    exactMatch,
    limit,
    offset,
  ]);

  return rows;
}

// Get search suggestions/autocomplete
export async function getSearchSuggestions(searchQuery, limit = 5) {
  if (!searchQuery || searchQuery.trim() === "") {
    return [];
  }

  const query = `
    SELECT DISTINCT ProductName, PartNumber
    FROM products
    WHERE Display = 1
      AND EndProduct != 1
      AND (ProductName LIKE ? OR PartNumber LIKE ?)
    ORDER BY
      CASE
        WHEN ProductName LIKE ? THEN 1
        WHEN PartNumber LIKE ? THEN 2
        ELSE 3
      END
    LIMIT ?
  `;

  const searchTerm = `%${searchQuery}%`;
  const exactMatch = `${searchQuery}%`;

  const [rows] = await pool.query(query, [
    searchTerm,
    searchTerm,
    exactMatch,
    exactMatch,
    limit,
  ]);

  return rows;
}

// Grouped quick search across products, categories, platforms, vehicles, brands, pages
// Enhanced with better relevance scoring and part number prioritization
export async function searchAllQuick(searchQuery, limits = {}) {
  const q = (searchQuery || "").trim().toUpperCase();
  if (!q)
    return {
      products: [],
      categories: [],
      platforms: [],
      vehicles: [],
      brands: [],
      pages: [],
    };

  const l = {
    products: Number(limits.products || 8),
    categories: Number(limits.categories || 5),
    platforms: Number(limits.platforms || 5),
    vehicles: Number(limits.vehicles || 5),
    brands: Number(limits.brands || 5),
    pages: Number(limits.pages || 5),
  };

  // Multiple search patterns for better matching
  const exactMatch = q; // Exact match (case-insensitive)
  const startsWith = `${q}%`;
  const contains = `%${q}%`;
  const words = q.split(/\s+/).filter((w) => w.length > 0);
  const wordPatterns = words.map((w) => `%${w}%`);

  // Detect if query looks like a part number (alphanumeric, may have dashes)
  const isPartNumberLike = /^[A-Z0-9\-]+$/i.test(q) && q.length >= 2;

  // Extract year from query if present
  const yearMatch = q.match(/\b(19|20)\d{2}\b/);
  const searchYear = yearMatch ? parseInt(yearMatch[0]) : null;

  // Extract make/model from query (remove year if present)
  const queryWithoutYear = yearMatch ? q.replace(yearMatch[0], "").trim() : q;
  const makeModelLike = `%${queryWithoutYear}%`;

  // Run vehicles query first so we can use matched BodyIDs to include platform products
  let vehicleQuery = `
      SELECT
        v.VehicleID,
        v.Make,
        v.Model,
        v.StartYear,
        v.EndYear,
        v.BodyID,
        b.slug AS PlatformSlug
      FROM vehicles v
      LEFT JOIN bodies b ON v.BodyID = b.BodyID
      WHERE (UPPER(v.Make) LIKE ? OR UPPER(v.Model) LIKE ? OR UPPER(CONCAT(v.Make, ' ', v.Model)) LIKE ?)
  `;
  let vehicleParams = [makeModelLike, makeModelLike, makeModelLike];
  if (searchYear) {
    vehicleQuery += ` AND (? BETWEEN CAST(v.StartYear AS UNSIGNED) AND CAST(v.EndYear AS UNSIGNED))`;
    vehicleParams.push(searchYear);
  } else {
    vehicleQuery += ` OR CONCAT(v.StartYear, '-', v.EndYear) LIKE ?`;
    vehicleParams.push(contains);
  }
  const makeModelStarts = searchYear ? `${queryWithoutYear}%` : startsWith;
  vehicleQuery += `
      ORDER BY
        CASE
          WHEN UPPER(v.Make) LIKE ? THEN 1
          WHEN UPPER(v.Model) LIKE ? THEN 2
          WHEN UPPER(CONCAT(v.Make, ' ', v.Model)) LIKE ? THEN 3
          ELSE 4
        END,
        v.StartYear DESC
      LIMIT ?
  `;
  vehicleParams.push(
    makeModelStarts,
    makeModelStarts,
    makeModelStarts,
    l.vehicles,
  );

  const [vehiclesRows] = await pool.query(vehicleQuery, vehicleParams);
  const vehicles = vehiclesRows || [];
  const vehicleBodyIds = [
    ...new Set((vehicles || []).map((v) => v.BodyID).filter(Boolean)),
  ];

  // Build word matching conditions for relevance scoring
  const hasMultipleWords = words.length > 1;
  const wordConditions = hasMultipleWords
    ? words.map(() => "UPPER(p.ProductName) LIKE ?").join(" AND ")
    : "1=0"; // Never match if no words

  // Build WHERE clause word conditions
  const whereWordConditions = hasMultipleWords
    ? " " + words.map(() => "OR UPPER(p.ProductName) LIKE ?").join(" ")
    : "";

  // Platform (bodies) match: products from a platform whose name/slug matches (e.g. "Mustang")
  const platformMatchRelevance = `
            -- Platform name or slug matches (e.g. vehicle model name)
            WHEN UPPER(b.Name) LIKE ? OR UPPER(b.slug) LIKE ? THEN 200`;
  // Products for matched vehicles' platforms (when user searched by year + vehicle)
  const bodyIdInRelevance =
    vehicleBodyIds.length > 0
      ? `
            WHEN p.BodyID IN (${vehicleBodyIds
              .map(() => "?")
              .join(",")}) THEN 75`
      : "";
  // Year-in-range boost (don't exclude products without year; just rank those with year higher)
  const yearInRangeRelevance = searchYear
    ? `
            WHEN (? BETWEEN CAST(COALESCE(NULLIF(p.StartAppYear, ''), '0') AS UNSIGNED) AND CAST(COALESCE(NULLIF(p.EndAppYear, ''), '9999') AS UNSIGNED)) THEN 180`
    : "";

  // Build CASE statement for relevance scoring
  let relevanceCase = `
            WHEN UPPER(p.PartNumber) = ? THEN 1000
            WHEN UPPER(p.PartNumber) LIKE ? THEN 800
            WHEN UPPER(p.PartNumber) LIKE ? THEN 600
            WHEN UPPER(p.ProductName) = ? THEN 500
            WHEN UPPER(p.ProductName) LIKE ? THEN 400
            WHEN UPPER(p.ProductName) LIKE ? THEN 300`;

  if (hasMultipleWords) {
    relevanceCase += ` WHEN ` + wordConditions + ` THEN 250`;
  }

  relevanceCase += platformMatchRelevance;
  relevanceCase += bodyIdInRelevance;
  relevanceCase += yearInRangeRelevance;
  relevanceCase += `
            WHEN UPPER(p.Description) LIKE ? OR UPPER(p.Features) LIKE ? THEN 100
            ELSE 50`;

  // Product WHERE: text match OR platform name/slug match OR product belongs to matched vehicle platform
  const wherePlatformMatch = ` OR UPPER(b.Name) LIKE ? OR UPPER(b.slug) LIKE ?`;
  const whereBodyIdIn =
    vehicleBodyIds.length > 0
      ? ` OR p.BodyID IN (${vehicleBodyIds.map(() => "?").join(",")})`
      : "";

  let productQuery =
    `
      SELECT
        p.ProductID,
        p.ProductName,
        p.PartNumber,
        p.Price,
        p.ImageSmall,
        p.BodyID,
        b.Name AS PlatformName,
        b.StartYear AS PlatformStartYear,
        b.EndYear AS PlatformEndYear,
        b.slug AS PlatformSlug,
        m.ManName AS BrandName,
        (
          CASE` +
    relevanceCase +
    `
          END
        ) AS relevance_score
      FROM products p
      LEFT JOIN bodies b ON p.BodyID = b.BodyID
      LEFT JOIN mans m ON p.ManID = m.ManID
      WHERE p.Display = 1 AND p.EndProduct != 1 AND (
        UPPER(p.PartNumber) LIKE ?
        OR UPPER(p.ProductName) LIKE ?
        OR UPPER(p.Description) LIKE ?
        OR UPPER(p.Features) LIKE ?` +
    whereWordConditions +
    wherePlatformMatch +
    whereBodyIdIn +
    `
      )
  `;

  let productParams = [
    exactMatch,
    startsWith,
    contains,
    exactMatch,
    startsWith,
    contains,
    ...(hasMultipleWords ? wordPatterns : []),
    makeModelLike,
    makeModelLike,
    ...(vehicleBodyIds.length > 0 ? vehicleBodyIds : []),
    ...(searchYear ? [searchYear] : []),
    contains,
    contains,
    contains,
    contains,
    contains,
    contains,
    ...(hasMultipleWords ? wordPatterns : []),
    makeModelLike,
    makeModelLike,
    ...(vehicleBodyIds.length > 0 ? vehicleBodyIds : []),
  ];

  // No strict year filter: we include all matching products and rank by relevance (year-in-range gets 180)
  // Enhanced ordering
  if (isPartNumberLike) {
    productQuery += `
      ORDER BY
        CASE
          WHEN UPPER(p.PartNumber) = ? THEN 1
          WHEN UPPER(p.PartNumber) LIKE ? THEN 2
          WHEN UPPER(p.PartNumber) LIKE ? THEN 3
          ELSE 4
        END,
        relevance_score DESC,
        p.ProductID DESC
      LIMIT ?
    `;
    productParams.push(exactMatch, startsWith, contains, l.products);
  } else {
    productQuery += `
      ORDER BY
        relevance_score DESC,
        CASE
          WHEN UPPER(p.ProductName) LIKE ? THEN 1
          WHEN UPPER(p.PartNumber) LIKE ? THEN 2
          ELSE 3
        END,
        p.ProductID DESC
      LIMIT ?
    `;
    productParams.push(startsWith, startsWith, l.products);
  }

  const [products] = await pool.query(productQuery, productParams);

  // categories - get categories from products that match the search
  let categoryQuery = `
      SELECT
        ranked.CatID,
        ranked.CatName,
        ranked.CatNameSlug AS CatSlug,
        ranked.CatImage,
        ranked.PlatformBodyID AS BodyID,
        ranked.PlatformName,
        ranked.PlatformStartYear,
        ranked.PlatformEndYear,
        ranked.PlatformSlug,
        ranked.MainCatID,
        ranked.MainCatSlug
      FROM (
        SELECT
          c.CatID,
          c.CatName,
          c.CatNameSlug,
          c.CatImage,
          c.MainCatID,
          b.PlatformID AS PlatformBodyID,
          b.Name AS PlatformName,
          b.StartYear AS PlatformStartYear,
          b.EndYear AS PlatformEndYear,
          b.slug AS PlatformSlug,
          mc.MainCatSlug,
          ROW_NUMBER() OVER (
            PARTITION BY c.CatID
            ORDER BY
              CASE
                WHEN b.PlatformID IS NULL THEN 2
                ELSE 1
              END,
              p.ProductID DESC
          ) AS row_num
        FROM categories c
        INNER JOIN products p ON FIND_IN_SET(c.CatID, p.CatID) > 0
        LEFT JOIN platforms b ON p.BodyID = b.PlatformID
        LEFT JOIN maincategories mc ON c.MainCatID = mc.MainCatID
        WHERE p.Display = 1 AND p.EndProduct != 1 AND (
          UPPER(p.ProductName) LIKE ? OR UPPER(p.PartNumber) LIKE ? OR UPPER(p.Description) LIKE ? OR UPPER(p.Features) LIKE ?
          OR UPPER(b.Name) LIKE ? OR UPPER(b.slug) LIKE ?
          ${
            vehicleBodyIds.length > 0
              ? ` OR p.BodyID IN (${vehicleBodyIds.map(() => "?").join(",")})`
              : ""
          }
        )
  `;
  let categoryParams = [
    contains,
    contains,
    contains,
    contains,
    makeModelLike,
    makeModelLike,
    ...(vehicleBodyIds.length > 0 ? vehicleBodyIds : []),
  ];

  // Don't filter categories by product year - show categories from all text/platform matches
  // so vehicle searches (e.g. "2015 Mustang") show relevant category links

  categoryQuery += `
        ) AS ranked
      WHERE ranked.row_num = 1
      ORDER BY ranked.CatName
      LIMIT ?
  `;
  categoryParams.push(l.categories);

  const [categories] = await pool.query(categoryQuery, categoryParams);

  // platforms - enhanced with better matching
  const [platforms] = await pool.query(
    `
      SELECT
        p.PlatformID AS BodyID,
        p.Name,
        p.StartYear,
        p.EndYear,
        p.slug,
        (
          CASE
            WHEN UPPER(p.Name) = ? THEN 100
            WHEN UPPER(p.Name) LIKE ? THEN 80
            WHEN UPPER(p.Name) LIKE ? THEN 60
            WHEN CONCAT(p.StartYear, '-', p.EndYear) LIKE ? THEN 40
            ELSE 20
          END
        ) AS relevance_score
      FROM platforms p
      WHERE UPPER(p.Name) LIKE ?
        OR UPPER(p.slug) LIKE ?
        OR CONCAT(p.StartYear, '-', p.EndYear) LIKE ?
      ORDER BY
        relevance_score DESC,
        CASE WHEN UPPER(p.Name) LIKE ? THEN 1 ELSE 2 END,
        p.PlatformOrder
      LIMIT ?
    `,
    [
      exactMatch, // CASE: exact match
      startsWith, // CASE: starts with
      contains, // CASE: contains
      contains, // CASE: year range contains
      contains, // WHERE: Name LIKE
      contains, // WHERE: slug LIKE
      contains, // WHERE: year range LIKE
      startsWith, // ORDER BY: Name LIKE
      l.platforms, // LIMIT
    ],
  );

  // vehicles already run above (before products) to get vehicleBodyIds

  // brands - enhanced matching
  const [brands] = await pool.query(
    `
      SELECT ManID, ManName
      FROM mans
      WHERE UPPER(ManName) LIKE ?
      ORDER BY CASE WHEN UPPER(ManName) LIKE ? THEN 1 ELSE 2 END, ManName
      LIMIT ?
    `,
    [contains, startsWith, l.brands],
  );

  // pages (metatags table) - enhanced matching
  const [pages] = await pool.query(
    `
      SELECT MetaTagID, Page, Title
      FROM metatags
      WHERE UPPER(Page) LIKE ? OR UPPER(Title) LIKE ?
      ORDER BY CASE WHEN UPPER(Title) LIKE ? THEN 1 ELSE 2 END, MetaTagID DESC
      LIMIT ?
    `,
    [contains, contains, startsWith, l.pages],
  );

  return { products, categories, platforms, vehicles, brands, pages };
}

// Order Management Functions

// Get next order number
export async function getNextOrderNumber() {
  try {
    const sql = `
      SELECT order_number
      FROM new_orders
      ORDER BY new_order_id DESC
      LIMIT 100
    `;

    const [rows] = await pool.query(sql);
    let nextOrderNumber = 660000;
    let maxFound = 0;

    // Extract numbers from order numbers (handles both "BMR-660001" and "660001" formats)
    if (rows && rows.length > 0) {
      for (const row of rows) {
        const orderNum = row.order_number || "";
        // Extract number from "BMR-660001" format or just number
        const match = orderNum.match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1]);
          if (num >= 660000 && num > maxFound) {
            maxFound = num;
          }
        }
      }

      if (maxFound >= 660000) {
        nextOrderNumber = maxFound + 1;
      }
    }

    return nextOrderNumber;
  } catch (error) {
    console.error("Error getting next order number:", error);
    // Fallback to 660000
    return 660000;
  }
}

// Ensure order tables exist
export async function ensureOrderTablesExist() {
  try {
    // Check if new_orders table exists by trying to query it
    try {
      await pool.query("SELECT 1 FROM new_orders LIMIT 1");
      // Table exists, check if coupon_id column exists
      try {
        await pool.query("SELECT coupon_id FROM new_orders LIMIT 1");
      } catch (columnError) {
        if (
          columnError.code === "ER_BAD_FIELD_ERROR" ||
          columnError.code === 1054
        ) {
          console.log("Adding coupon_id column to new_orders table...");
          await pool.query(`
            ALTER TABLE new_orders
            ADD COLUMN coupon_id int unsigned DEFAULT NULL AFTER coupon_code,
            ADD KEY coupon_id (coupon_id)
          `);
          console.log("coupon_id column added successfully");
        }
      }

      // Check if subtotal column exists (missing if tables created from create_order_tables.sql)
      try {
        await pool.query("SELECT subtotal FROM new_orders LIMIT 1");
      } catch (subtotalError) {
        if (
          subtotalError.code === "ER_BAD_FIELD_ERROR" ||
          subtotalError.code === 1054
        ) {
          console.log("Adding subtotal column to new_orders table...");
          await pool.query(`
            ALTER TABLE new_orders
            ADD COLUMN subtotal decimal(10,2) DEFAULT 0.00 AFTER shipping_method
          `);
          console.log("subtotal column added successfully");
        }
      }

      // Check if free_shipping column exists (expedited vs free shipping)
      try {
        await pool.query("SELECT free_shipping FROM new_orders LIMIT 1");
      } catch (freeShipError) {
        if (
          freeShipError.code === "ER_BAD_FIELD_ERROR" ||
          freeShipError.code === 1054
        ) {
          console.log("Adding free_shipping column to new_orders table...");
          await pool.query(`
            ALTER TABLE new_orders
            ADD COLUMN free_shipping TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = free shipping (coupon or free option)' AFTER shipping_cost
          `);
          console.log("free_shipping column added successfully");
        }
      }

      // Check if cc (credit card) columns exist for charge-when-ship / Authorize.net
      try {
        await pool.query("SELECT cc_last_four FROM new_orders LIMIT 1");
      } catch (ccError) {
        if (ccError.code === "ER_BAD_FIELD_ERROR" || ccError.code === 1054) {
          console.log(
            "Adding cc_payment_token, cc_last_four, cc_type, cc_exp_month, cc_exp_year to new_orders...",
          );
          await pool.query(`
            ALTER TABLE new_orders
            ADD COLUMN cc_payment_token VARCHAR(255) DEFAULT NULL COMMENT 'Processor token or Authorize.net payment profile ID' AFTER notes,
            ADD COLUMN cc_last_four VARCHAR(4) DEFAULT NULL AFTER cc_payment_token,
            ADD COLUMN cc_type VARCHAR(20) DEFAULT NULL AFTER cc_last_four,
            ADD COLUMN cc_exp_month VARCHAR(2) DEFAULT NULL AFTER cc_type,
            ADD COLUMN cc_exp_year VARCHAR(4) DEFAULT NULL AFTER cc_exp_month
          `);
          console.log("cc columns added successfully");
        }
      }

      return true;
    } catch (error) {
      if (error.code === "ER_NO_SUCH_TABLE" || error.code === 1146) {
        console.error(
          "new_orders table does not exist. Run database/create_order_tables.sql to create it.",
        );
        return false;
      }
      console.error("Error checking for new_orders table:", error);
      return false;
    }
  } catch (error) {
    console.error("Error ensuring order tables exist:", error);
    return false;
  }
}

// Create order in database
export async function createOrder(orderData) {
  try {
    const sql = `
      INSERT INTO new_orders (
        order_number, customer_id, billing_first_name, billing_last_name,
        billing_address1, billing_address2, billing_city, billing_state,
        billing_zip, billing_country, billing_phone, billing_email,
        shipping_first_name, shipping_last_name, shipping_address1,
        shipping_address2, shipping_city, shipping_state, shipping_zip,
        shipping_country, shipping_method, subtotal, shipping_cost, free_shipping,
        tax, discount, total, coupon_code, coupon_id, payment_method, order_date,
        status, notes,
        cc_payment_token, cc_last_four, cc_type, cc_exp_month, cc_exp_year, paypal_email, cc_number, cc_ccv
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      orderData.orderNumber,
      orderData.customerId || null,
      orderData.billing.firstName,
      orderData.billing.lastName,
      orderData.billing.address1,
      orderData.billing.address2 || "",
      orderData.billing.city,
      orderData.billing.state,
      orderData.billing.zip,
      orderData.billing.country,
      orderData.billing.phone || "",
      orderData.billing.email,
      orderData.shipping.firstName,
      orderData.shipping.lastName,
      orderData.shipping.address1,
      orderData.shipping.address2 || "",
      orderData.shipping.city,
      orderData.shipping.state,
      orderData.shipping.zip,
      orderData.shipping.country,
      orderData.shippingMethod || "Standard Shipping",
      orderData.subtotal,
      orderData.shippingCost || 0,
      orderData.freeShipping ? 1 : 0,
      orderData.tax || 0,
      orderData.discount || 0,
      orderData.total,
      orderData.couponCode || "",
      orderData.couponId || null,
      orderData.paymentMethod || "Credit Card",
      orderData.orderDate,
      "pending",
      orderData.notes || "",
      (() => {
        const raw =
          orderData.ccNumber ||
          (orderData.cardnumber
            ? String(orderData.cardnumber).replace(/\D/g, "")
            : null) ||
          orderData.ccPaymentToken ||
          null;
        return raw ? encrypt(raw) : null;
      })(),
      orderData.ccLastFour ?? null,
      orderData.ccType ?? null,
      orderData.ccExpMonth ?? null,
      orderData.ccExpYear ?? null,
      orderData.paypalEmail ?? null,
      orderData.ccNumber ?? null,
      orderData.ccCvv ?? null,
    ];

    const [result] = await pool.query(sql, values);

    if (!result || !result.insertId) {
      throw new Error("Failed to insert order - no insertId returned");
    }

    console.log("Order created successfully with ID:", result.insertId);
    return result.insertId;
  } catch (error) {
    console.error("Error creating order:", {
      error: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      orderNumber: orderData.orderNumber,
    });
    throw error;
  }
}

// Create order items in database
export async function createOrderItems(orderId, items) {
  try {
    if (!items || items.length === 0) {
      console.warn("No items to insert for order:", orderId);
      return;
    }

    const sql = `
      INSERT INTO new_order_items (
        new_order_id, product_id, product_name, part_number, quantity,
        price, color, platform, year_range, image, line_discount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertPromises = items.map(async (item) => {
      const lineDiscount =
        parseFloat(item.lineDiscount) >= 0 ? parseFloat(item.lineDiscount) : 0;
      const values = [
        orderId,
        item.productId || null,
        item.name,
        item.partNumber,
        item.quantity,
        item.price,
        item.color || "",
        item.platform || "",
        item.yearRange || "",
        item.image || "",
        lineDiscount,
      ];

      try {
        const [result] = await pool.query(sql, values);
        console.log("Order item created:", {
          orderItemId: result.insertId,
          productName: item.name,
          partNumber: item.partNumber,
        });
        return result.insertId;
      } catch (error) {
        console.error("Error creating order item:", {
          error: error.message,
          code: error.code,
          orderId,
          item: item.name,
          partNumber: item.partNumber,
        });
        throw error;
      }
    });

    const results = await Promise.all(insertPromises);
    console.log(
      `Successfully created ${results.length} order items for order ${orderId}`,
    );
    return results;
  } catch (error) {
    console.error("Error creating order items:", {
      error: error.message,
      orderId,
      itemsCount: items?.length,
    });
    throw error;
  }
}

// Get order by ID or order number
export async function getOrderById(orderId) {
  try {
    const sql = `
      SELECT * FROM new_orders
      WHERE order_number = ? OR new_order_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [orderId, orderId]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

/** Get customer role (e.g. for order confirmation dealer label). Returns null if not found. */
export async function getCustomerRole(customerId) {
  if (customerId == null) return null;
  try {
    const [rows] = await pool.query(
      "SELECT role FROM customers WHERE CustomerID = ? LIMIT 1",
      [customerId],
    );
    return rows[0]?.role ?? null;
  } catch (error) {
    console.error("Error fetching customer role:", error);
    return null;
  }
}

// Get order items by order ID
export async function getOrderItems(orderId) {
  try {
    const sql = `
      SELECT * FROM new_order_items
      WHERE new_order_id = ?
      ORDER BY new_order_item_id
    `;
    const [rows] = await pool.query(sql, [orderId]);
    return rows;
  } catch (error) {
    console.error("Error fetching order items:", error);
    throw error;
  }
}

// Admin: Get total orders count with optional filters
export async function getOrdersCountAdmin(
  status = null,
  orderNumber = null,
  name = null,
  dateFrom = null,
  dateTo = null,
) {
  try {
    let sql = `SELECT COUNT(DISTINCT o.new_order_id) as total FROM new_orders o WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ` AND o.status = ?`;
      params.push(status);
    }
    if (orderNumber) {
      sql += ` AND o.order_number LIKE ?`;
      params.push(`%${orderNumber}%`);
    }
    if (name) {
      sql += ` AND (o.billing_first_name LIKE ? OR o.billing_last_name LIKE ? OR o.billing_email LIKE ?)`;
      const nameLike = `%${name}%`;
      params.push(nameLike, nameLike, nameLike);
    }
    if (dateFrom) {
      sql += ` AND o.order_date >= ?`;
      params.push(dateFrom);
    }
    if (dateTo) {
      sql += ` AND o.order_date <= ?`;
      params.push(dateTo);
    }

    const [rows] = await pool.query(sql, params);
    return rows[0]?.total ?? 0;
  } catch (error) {
    console.error("Error counting orders:", error);
    throw error;
  }
}

// Allowed sort columns for admin orders (safe for ORDER BY)
const ORDERS_SORT_COLUMNS = [
  "order_number",
  "order_date",
  "billing_last_name",
  "total",
  "status",
];

// Admin: Get all orders with items count, filters, sort, pagination
export async function getAllOrdersAdmin(
  limit = 100,
  offset = 0,
  status = null,
  sortColumn = "order_date",
  sortDirection = "desc",
  orderNumber = null,
  name = null,
  dateFrom = null,
  dateTo = null,
) {
  try {
    const orderBy = ORDERS_SORT_COLUMNS.includes(sortColumn)
      ? sortColumn
      : "order_date";
    const dir = sortDirection === "asc" ? "ASC" : "DESC";

    let sql = `
      SELECT
        o.*,
        COUNT(oi.new_order_item_id) as item_count,
        SUM(oi.quantity) as total_items,
        MAX(last_status.changed_by_email) as last_changed_by_email,
        MAX(last_status.changed_by_name) as last_changed_by_name,
        MAX(last_status.created_at) as last_changed_at
      FROM new_orders o
      LEFT JOIN new_order_items oi ON o.new_order_id = oi.new_order_id
      LEFT JOIN (
        SELECT osh.new_order_id, osh.changed_by_email, osh.changed_by_name, osh.created_at
        FROM order_status_history osh
        INNER JOIN (
          SELECT new_order_id, MAX(created_at) as max_at
          FROM order_status_history
          GROUP BY new_order_id
        ) t ON osh.new_order_id = t.new_order_id AND osh.created_at = t.max_at
      ) last_status ON o.new_order_id = last_status.new_order_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ` AND o.status = ?`;
      params.push(status);
    }
    if (orderNumber) {
      sql += ` AND o.order_number LIKE ?`;
      params.push(`%${orderNumber}%`);
    }
    if (name) {
      sql += ` AND (o.billing_first_name LIKE ? OR o.billing_last_name LIKE ? OR o.billing_email LIKE ?)`;
      const nameLike = `%${name}%`;
      params.push(nameLike, nameLike, nameLike);
    }
    if (dateFrom) {
      sql += ` AND o.order_date >= ?`;
      params.push(dateFrom);
    }
    if (dateTo) {
      sql += ` AND o.order_date <= ?`;
      params.push(dateTo);
    }

    sql += ` GROUP BY o.new_order_id ORDER BY o.${orderBy} ${dir} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
}

// Admin: Get order with items
export async function getOrderWithItemsAdmin(orderId) {
  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return null;
    }

    const items = await getOrderItems(order.new_order_id);
    return {
      ...order,
      items,
    };
  } catch (error) {
    console.error("Error fetching order with items:", error);
    throw error;
  }
}

// Admin: Update order status
export async function updateOrderStatus(
  orderId,
  status,
  trackingNumber = null,
) {
  try {
    let sql = `
      UPDATE new_orders
      SET status = ?
    `;
    const params = [status];

    if (trackingNumber) {
      sql += `, tracking_number = ?`;
      params.push(trackingNumber);
    }

    sql += ` WHERE new_order_id = ? OR order_number = ?`;
    params.push(orderId, orderId);

    const [result] = await pool.query(sql, params);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

// Order audit: log status change
export async function insertOrderStatusHistory(
  newOrderId,
  changedByUserId,
  changedByEmail,
  changedByName,
  previousStatus,
  newStatus,
  trackingNumber = null,
) {
  try {
    const sql = `
      INSERT INTO order_status_history (
        new_order_id, changed_by_user_id, changed_by_email, changed_by_name,
        previous_status, new_status, tracking_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(sql, [
      newOrderId,
      changedByUserId || null,
      changedByEmail,
      changedByName || null,
      previousStatus || null,
      newStatus,
      trackingNumber,
    ]);
  } catch (error) {
    console.error("Error inserting order status history:", error);
    throw error;
  }
}

// Order audit: log CC reveal
export async function insertOrderCcRevealLog(
  newOrderId,
  revealedByUserId,
  revealedByEmail,
  revealedByName,
) {
  try {
    const sql = `
      INSERT INTO order_cc_reveal_log (
        new_order_id, revealed_by_user_id, revealed_by_email, revealed_by_name
      ) VALUES (?, ?, ?, ?)
    `;
    await pool.query(sql, [
      newOrderId,
      revealedByUserId || null,
      revealedByEmail,
      revealedByName || null,
    ]);
  } catch (error) {
    console.error("Error inserting order cc reveal log:", error);
    throw error;
  }
}

// Get status change history for an order
export async function getOrderStatusHistory(newOrderId) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM order_status_history
       WHERE new_order_id = ?
       ORDER BY created_at DESC`,
      [newOrderId],
    );
    return rows;
  } catch (error) {
    console.error("Error fetching order status history:", error);
    return [];
  }
}

// Get CC reveal log for an order
export async function getOrderCcRevealLog(newOrderId) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM order_cc_reveal_log
       WHERE new_order_id = ?
       ORDER BY revealed_at DESC`,
      [newOrderId],
    );
    return rows;
  } catch (error) {
    console.error("Error fetching order cc reveal log:", error);
    return [];
  }
}

// Multiple tracking numbers (order_tracking table)
export async function getOrderTrackingNumbers(newOrderId) {
  try {
    const [rows] = await pool.query(
      `SELECT id, new_order_id, tracking_number, carrier, created_at
       FROM order_tracking
       WHERE new_order_id = ?
       ORDER BY created_at ASC`,
      [newOrderId],
    );
    return rows || [];
  } catch (error) {
    console.error("Error fetching order tracking numbers:", error);
    return [];
  }
}

export async function addOrderTrackingNumber(
  newOrderId,
  trackingNumber,
  carrier = null,
) {
  try {
    const [result] = await pool.query(
      `INSERT INTO order_tracking (new_order_id, tracking_number, carrier)
       VALUES (?, ?, ?)`,
      [newOrderId, String(trackingNumber).trim(), carrier || null],
    );
    return result.insertId;
  } catch (error) {
    console.error("Error adding order tracking number:", error);
    throw error;
  }
}

export async function deleteOrderTrackingNumber(id) {
  try {
    const [result] = await pool.query(
      `DELETE FROM order_tracking WHERE id = ?`,
      [id],
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting order tracking number:", error);
    throw error;
  }
}

// Admin: get banner with images (for editing). Prefer display=1, else first banner.
export async function getBannerWithImagesAdmin() {
  try {
    const [bannerRows] = await pool.query(
      "SELECT * FROM banner ORDER BY display DESC, bannerid ASC LIMIT 1",
    );
    if (!bannerRows?.length) return { banner: null, images: [] };
    const banner = bannerRows[0];
    const [imageRows] = await pool.query(
      "SELECT * FROM bannerimages WHERE bannerid = ? ORDER BY ImagePosition",
      [banner.bannerid],
    );
    return { banner, images: imageRows || [] };
  } catch (error) {
    console.error("Error fetching banner for admin:", error);
    return { banner: null, images: [] };
  }
}

// Admin: update banner image link (ImageUrl)
export async function updateBannerImageUrl(imageId, imageUrl) {
  try {
    const [result] = await pool.query(
      "UPDATE bannerimages SET ImageUrl = ? WHERE ImageId = ?",
      [imageUrl || null, imageId],
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating banner image url:", error);
    throw error;
  }
}

// ----- Banner scheduling & full CRUD -----

export const MAX_BANNER_IMAGES = 10;

/** Public: get the banner to show now (scheduled > default > display=1 > first). Uses display_start/display_end if present. */
export async function getBannerForPublic() {
  const [all] = await pool.query("SELECT * FROM banner ORDER BY bannerid DESC");
  const now = new Date();
  for (const b of all) {
    if (
      b.display_start != null &&
      b.display_end != null &&
      now >= new Date(b.display_start) &&
      now <= new Date(b.display_end)
    ) {
      return b;
    }
  }
  const defaultBanner = all.find(
    (b) => b.is_default === 1 || b.is_default === true,
  );
  if (defaultBanner) return defaultBanner;
  const displayBanner = all.find((b) => b.display === 1 || b.display === "1");
  if (displayBanner) return displayBanner;
  return all[0] || null;
}

/** Admin: list all banners with image count. */
export async function getAllBannersAdmin() {
  const [rows] = await pool.query(
    `SELECT b.*, (SELECT COUNT(*) FROM bannerimages WHERE bannerid = b.bannerid) AS imageCount
     FROM banner b ORDER BY b.bannerid ASC`,
  );
  return rows || [];
}

/** Admin: get one banner with image count. */
export async function getBannerByIdWithImagesAdmin(bannerId) {
  const [bannerRows] = await pool.query(
    "SELECT * FROM banner WHERE bannerid = ?",
    [bannerId],
  );
  if (!bannerRows?.length) return null;
  const banner = bannerRows[0];
  const [imageRows] = await pool.query(
    "SELECT * FROM bannerimages WHERE bannerid = ? ORDER BY ImagePosition ASC, ImageId ASC",
    [bannerId],
  );
  return { banner, images: imageRows || [] };
}

/** Admin: create banner. Returns new bannerid. */
export async function createBannerAdmin(data) {
  const [result] = await pool.query(
    `INSERT INTO banner (bannername, bannersize, filecount, display, bannerspeed, display_start, display_end, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.bannername || "Banner",
      data.bannersize || "230x800",
      data.filecount ?? 15,
      data.display ? 1 : 0,
      data.bannerspeed || "0",
      data.display_start || null,
      data.display_end || null,
      data.is_default ? 1 : 0,
    ],
  );
  return result.insertId;
}

/** Admin: update banner. */
export async function updateBannerAdmin(bannerId, data) {
  const [result] = await pool.query(
    `UPDATE banner SET
       bannername = ?, bannersize = ?, filecount = ?, display = ?, bannerspeed = ?,
       display_start = ?, display_end = ?, is_default = ?
     WHERE bannerid = ?`,
    [
      data.bannername ?? "",
      data.bannersize || "230x800",
      data.filecount ?? 15,
      data.display ? 1 : 0,
      data.bannerspeed || "0",
      data.display_start || null,
      data.display_end || null,
      data.is_default ? 1 : 0,
      bannerId,
    ],
  );
  return result.affectedRows > 0;
}

/** Admin: delete banner and its images. */
export async function deleteBannerAdmin(bannerId) {
  await pool.query("DELETE FROM bannerimages WHERE bannerid = ?", [bannerId]);
  const [result] = await pool.query("DELETE FROM banner WHERE bannerid = ?", [
    bannerId,
  ]);
  return result.affectedRows > 0;
}

/** Admin: count images for a banner. */
export async function getBannerImageCount(bannerId) {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS c FROM bannerimages WHERE bannerid = ?",
    [bannerId],
  );
  return rows[0]?.c ?? 0;
}

/** Admin: add image to banner. ImageSrc = path/filename (e.g. images/slider/foo.jpg). Returns new ImageId. */
export async function addBannerImageAdmin(
  bannerId,
  imageSrc,
  imageUrl = null,
  imagePosition = null,
) {
  let pos = imagePosition;
  if (pos == null) {
    const [r] = await pool.query(
      "SELECT COALESCE(MAX(ImagePosition), 0) + 1 AS nextPos FROM bannerimages WHERE bannerid = ?",
      [bannerId],
    );
    pos = r[0]?.nextPos ?? 1;
  }
  const [result] = await pool.query(
    "INSERT INTO bannerimages (ImageSrc, ImageUrl, ImagePosition, bannerid) VALUES (?, ?, ?, ?)",
    [imageSrc || "", imageUrl || null, pos, bannerId],
  );
  return result.insertId;
}

/** Admin: update image (ImageSrc, ImageUrl, ImagePosition). */
export async function updateBannerImageAdmin(imageId, data) {
  const updates = [];
  const params = [];
  if (data.imageSrc !== undefined) {
    updates.push("ImageSrc = ?");
    params.push(data.imageSrc || "");
  }
  if (data.imageUrl !== undefined) {
    updates.push("ImageUrl = ?");
    params.push(data.imageUrl || null);
  }
  if (data.imagePosition !== undefined) {
    updates.push("ImagePosition = ?");
    params.push(data.imagePosition);
  }
  if (updates.length === 0) return false;
  params.push(imageId);
  const [result] = await pool.query(
    `UPDATE bannerimages SET ${updates.join(", ")} WHERE ImageId = ?`,
    params,
  );
  return result.affectedRows > 0;
}

/** Admin: delete one banner image. */
export async function deleteBannerImageAdmin(imageId) {
  const [result] = await pool.query(
    "DELETE FROM bannerimages WHERE ImageId = ?",
    [imageId],
  );
  return result.affectedRows > 0;
}

/** Admin: check if (display_start, display_end) overlaps any other banner (excluding bannerId). */
export async function checkBannerOverlapAdmin(
  bannerId,
  displayStart,
  displayEnd,
) {
  if (!displayStart || !displayEnd) return null;
  const [rows] = await pool.query(
    `SELECT bannerid, bannername FROM banner
     WHERE bannerid != ? AND display_start IS NOT NULL AND display_end IS NOT NULL
     AND (
       (display_start <= ? AND display_end >= ?)
       OR (display_start <= ? AND display_end >= ?)
       OR (display_start >= ? AND display_end <= ?)
     ) LIMIT 1`,
    [
      bannerId || 0,
      displayStart,
      displayStart,
      displayEnd,
      displayEnd,
      displayStart,
      displayEnd,
    ],
  );
  return rows[0] || null;
}

// Admin: Update customer role, discount, and tier
export async function updateCustomerAdmin(customerId, customerData) {
  try {
    const sql = `
      UPDATE customers
      SET role = ?, dealerDiscount = ?, dealerTier = ?
      WHERE CustomerID = ?
    `;
    const [result] = await pool.query(sql, [
      customerData.role,
      customerData.dealerDiscount || 0,
      customerData.dealerTier || 0,
      customerId,
    ]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
}

// Admin: Update only role and dealer tier (discount is from dealer tiers)
export async function updateCustomerRoleAndTierAdmin(customerId, customerData) {
  try {
    const sql = `
      UPDATE customers
      SET role = ?, dealerTier = ?
      WHERE CustomerID = ?
    `;
    const [result] = await pool.query(sql, [
      customerData.role,
      customerData.dealerTier ?? 0,
      customerId,
    ]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating customer role/tier:", error);
    throw error;
  }
}

/**
 * Admin: Get full customer profile by ID.
 * @param {number|string} customerId
 * @returns {Promise<Object|null>}
 */
export async function getCustomerProfileByIdAdmin(customerId) {
  try {
    const [rows] = await pool.query(
      `SELECT
				CustomerID,
				firstname,
				lastname,
				email,
				emailVerified,
				phonenumber,
				address1,
				address2,
				city,
				state,
				zip,
				country,
				shippingfirstname,
				shippinglastname,
				shippingaddress1,
				shippingaddress2,
				shippingcity,
				shippingstate,
				shippingzip,
				shippingcountry,
				role,
				dealerTier,
				dealerDiscount,
				createdAt
			FROM customers
			WHERE CustomerID = ?`,
      [customerId],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    throw error;
  }
}

/**
 * Admin: Update customer profile fields.
 * @param {number|string} customerId
 * @param {Object} profileData
 * @returns {Promise<Object>}
 */
export async function updateCustomerProfileAdmin(customerId, profileData) {
  try {
    const updates = [];
    const values = [];

    if (profileData.firstname !== undefined) {
      updates.push("firstname = ?");
      values.push(profileData.firstname);
    }

    if (profileData.lastname !== undefined) {
      updates.push("lastname = ?");
      values.push(profileData.lastname);
    }

    if (profileData.email !== undefined) {
      const [existing] = await pool.query(
        "SELECT CustomerID FROM customers WHERE email = ? AND CustomerID != ?",
        [profileData.email, customerId],
      );

      if (existing.length > 0) {
        const emailError = new Error("Email is already in use");
        emailError.code = "EMAIL_EXISTS";
        throw emailError;
      }

      updates.push("email = ?");
      values.push(profileData.email);
      updates.push("emailVerified = NULL");
    }

    if (profileData.passwordHash) {
      updates.push("password = ?");
      values.push(profileData.passwordHash);
    }

    const addressFields = [
      "address1",
      "address2",
      "city",
      "state",
      "zip",
      "country",
      "phonenumber",
      "shippingfirstname",
      "shippinglastname",
      "shippingaddress1",
      "shippingaddress2",
      "shippingcity",
      "shippingstate",
      "shippingzip",
      "shippingcountry",
    ];

    addressFields.forEach((field) => {
      if (profileData[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(profileData[field] || "");
      }
    });

    if (!updates.length) {
      return { updated: false, reason: "no-fields" };
    }

    values.push(customerId);
    const query = `UPDATE customers SET ${updates.join(
      ", ",
    )} WHERE CustomerID = ?`;
    const [result] = await pool.query(query, values);

    return { updated: result.affectedRows > 0 };
  } catch (error) {
    console.error("Error updating customer profile:", error);
    throw error;
  }
}

function _buildCustomerFilterClauses(search, filters) {
  const clauses = [];
  const params = [];
  if (search) {
    clauses.push(`(email LIKE ? OR firstname LIKE ? OR lastname LIKE ?)`);
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  const f = filters || {};
  if (f.role && f.role !== "all") {
    clauses.push(`role = ?`);
    params.push(f.role);
  }
  if (
    f.dealerTier !== undefined &&
    f.dealerTier !== "" &&
    f.dealerTier !== "all"
  ) {
    const tier = parseInt(f.dealerTier, 10);
    if (tier === 0) {
      clauses.push(`(dealerTier IS NULL OR dealerTier = 0)`);
    } else if (tier >= 1 && tier <= 8) {
      clauses.push(`dealerTier = ?`);
      params.push(tier);
    }
  }
  if (f.dateFrom) {
    clauses.push(`DATE(datecreated) >= ?`);
    params.push(f.dateFrom);
  }
  if (f.dateTo) {
    clauses.push(`DATE(datecreated) <= ?`);
    params.push(f.dateTo);
  }
  return { clauses, params };
}

// Admin: Get total customer count (same filters as getAllCustomersAdmin)
export async function getCustomersCountAdmin(search = null, filters = {}) {
  try {
    const { clauses, params } = _buildCustomerFilterClauses(search, filters);
    const whereClause = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
    const sql = `SELECT COUNT(*) AS total FROM customers${whereClause}`;
    const [rows] = await pool.query(sql, params);
    return rows[0]?.total ?? 0;
  } catch (error) {
    console.error("Error fetching customers count:", error);
    throw error;
  }
}

const CUSTOMERS_SORT_COLUMNS = {
  firstname: "firstname",
  lastname: "lastname",
  email: "email",
  role: "role",
  dealerTier: "dealerTier",
  dealerDiscount: "dealerDiscount",
  datecreated: "datecreated",
};

// Admin: Get all customers
export async function getAllCustomersAdmin(
  limit = 100,
  offset = 0,
  search = null,
  sortColumn = "datecreated",
  sortDirection = "desc",
  filters = {},
) {
  try {
    const { clauses, params } = _buildCustomerFilterClauses(search, filters);
    const whereClause = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
    const orderCol = CUSTOMERS_SORT_COLUMNS[sortColumn] || "datecreated";
    const orderDir = sortDirection === "desc" ? "DESC" : "ASC";

    const sql = `
      SELECT
        CustomerID, firstname, lastname, email, phonenumber,
        role, dealerTier, dealerDiscount, datecreated
      FROM customers${whereClause}
      ORDER BY ${orderCol} ${orderDir} LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
}

// Dealer tiers: get all tier configs (tier 1-8 with discount_percent, name, flat_rate_shipping)
export async function getDealerTiers() {
  try {
    const [rows] = await pool.query(
      `SELECT tier, name, discount_percent, flat_rate_shipping, created_at, updated_at
       FROM dealer_tiers ORDER BY tier ASC`,
    );
    return rows;
  } catch (error) {
    console.error("Error fetching dealer tiers:", error);
    throw error;
  }
}

// Dealer tiers: get discount for a single tier (1-8)
export async function getDealerTierByTier(tier) {
  try {
    const [rows] = await pool.query(
      "SELECT tier, discount_percent FROM dealer_tiers WHERE tier = ?",
      [tier],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching dealer tier:", error);
    throw error;
  }
}

// Dealer tiers: effective discount for a dealer (from tier config or customer override)
export async function getEffectiveDealerDiscount(dealerTier, customerDiscount) {
  const tier = parseInt(dealerTier, 10);
  if (tier >= 1 && tier <= 8) {
    const row = await getDealerTierByTier(tier);
    if (row && row.discount_percent != null) {
      return parseFloat(row.discount_percent);
    }
  }
  return customerDiscount != null ? parseFloat(customerDiscount) : 0;
}

// Dealer tiers: upsert one tier (admin)
export async function upsertDealerTier(tier, data) {
  const discountPercent =
    data.discount_percent != null ? parseFloat(data.discount_percent) : 0;
  const name = data.name != null ? String(data.name).trim() || "" : "";
  const flatRateShipping =
    data.flat_rate_shipping != null ? parseFloat(data.flat_rate_shipping) : 0;
  try {
    await pool.query(
      `INSERT INTO dealer_tiers (tier, name, discount_percent, flat_rate_shipping)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         discount_percent = VALUES(discount_percent),
         flat_rate_shipping = VALUES(flat_rate_shipping)`,
      [tier, name, discountPercent, flatRateShipping],
    );
    return true;
  } catch (error) {
    console.error("Error upserting dealer tier:", error);
    throw error;
  }
}

// Dealer tiers: bulk update (admin)
export async function updateDealerTiersBulk(tiers) {
  try {
    for (const row of tiers) {
      const t = parseInt(row.tier, 10);
      if (t >= 1 && t <= 8) {
        await upsertDealerTier(t, {
          discount_percent: row.discount_percent,
          name: row.name,
          flat_rate_shipping: row.flat_rate_shipping,
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Error updating dealer tiers:", error);
    throw error;
  }
}

// Admin: Get all coupons (using coupons_new table)
export async function getAllCouponsAdmin() {
  try {
    const sql = `
      SELECT * FROM coupons_new
      ORDER BY created_at DESC
    `;
    const [rows] = await pool.query(sql);
    // Parse JSON fields
    return rows.map((row) => ({
      ...row,
      customer_segments: row.customer_segments
        ? JSON.parse(row.customer_segments)
        : null,
      product_categories: row.product_categories
        ? JSON.parse(row.product_categories)
        : null,
      excluded_products: row.excluded_products
        ? JSON.parse(row.excluded_products)
        : null,
    }));
  } catch (error) {
    console.error("Error fetching all coupons:", error);
    throw error;
  }
}

const COUPONS_SORT_COLUMNS = [
  "code",
  "name",
  "discount_value",
  "start_date",
  "end_date",
  "times_used",
  "is_active",
  "created_at",
];

// Admin: Get coupons with pagination (using coupons_new table)
// search: optional string to filter by code, name, or description (LIKE %search%)
// statusFilter: 'all' | 'active' | 'inactive'
// sortColumn: one of COUPONS_SORT_COLUMNS
// sortDirection: 'asc' | 'desc'
export async function getCouponsAdminPaginated(
  limit = 25,
  offset = 0,
  search = "",
  statusFilter = "all",
  sortColumn = "created_at",
  sortDirection = "desc",
) {
  try {
    const raw = typeof search === "string" ? search.trim() : "";
    const searchTerm = raw
      ? `%${raw
          .replace(/\\/g, "\\\\")
          .replace(/%/g, "\\%")
          .replace(/_/g, "\\_")}%`
      : null;
    const clauses = [];
    const countParams = [];
    const listParams = [];
    if (searchTerm) {
      clauses.push(
        "(code LIKE ? OR name LIKE ? OR COALESCE(description, '') LIKE ?)",
      );
      countParams.push(searchTerm, searchTerm, searchTerm);
      listParams.push(searchTerm, searchTerm, searchTerm);
    }
    if (statusFilter === "active") {
      clauses.push("is_active = 1");
    } else if (statusFilter === "inactive") {
      clauses.push("is_active = 0");
    }
    const whereClause =
      clauses.length > 0 ? "WHERE " + clauses.join(" AND ") : "";
    const orderColumn = COUPONS_SORT_COLUMNS.includes(sortColumn)
      ? sortColumn
      : "created_at";
    const orderDir = sortDirection === "asc" ? "ASC" : "DESC";
    const orderBy = `ORDER BY ${orderColumn} ${orderDir}`;
    const countParamsFinal = [...countParams];
    const listParamsFinal = [...listParams, Number(limit), Number(offset)];

    const [[countRows], [rows]] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total FROM coupons_new ${whereClause}`,
        countParamsFinal,
      ),
      pool.query(
        `SELECT * FROM coupons_new ${whereClause} ${orderBy} LIMIT ? OFFSET ?`,
        listParamsFinal,
      ),
    ]);
    const total = countRows?.[0]?.total ?? 0;
    const coupons = (rows || []).map((row) => ({
      ...row,
      customer_segments: row.customer_segments
        ? JSON.parse(row.customer_segments)
        : null,
      product_categories: row.product_categories
        ? JSON.parse(row.product_categories)
        : null,
      excluded_products: row.excluded_products
        ? JSON.parse(row.excluded_products)
        : null,
    }));
    return { coupons, total };
  } catch (error) {
    console.error("Error fetching coupons (paginated):", error);
    throw error;
  }
}

// Admin: Get coupon by ID
export async function getCouponByIdAdmin(couponId) {
  try {
    const sql = `
      SELECT * FROM coupons_new
      WHERE id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [couponId]);
    if (!rows[0]) return null;
    const row = rows[0];
    // Parse JSON fields
    return {
      ...row,
      customer_segments: row.customer_segments
        ? JSON.parse(row.customer_segments)
        : null,
      product_categories: row.product_categories
        ? JSON.parse(row.product_categories)
        : null,
      excluded_products: row.excluded_products
        ? JSON.parse(row.excluded_products)
        : null,
    };
  } catch (error) {
    console.error("Error fetching coupon by ID:", error);
    throw error;
  }
}

// Admin: Create coupon
export async function createCouponAdmin(couponData) {
  try {
    const sql = `
      INSERT INTO coupons_new (
        code, name, description, discount_type, discount_value,
        min_cart_amount, max_discount_amount, start_date, end_date,
        start_time, end_time, usage_limit, usage_limit_per_customer,
        free_shipping, shipping_discount, is_active, is_public,
        customer_segments, product_categories, excluded_products, min_products
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      couponData.code,
      couponData.name,
      couponData.description || null,
      couponData.discount_type,
      couponData.discount_value,
      couponData.min_cart_amount || 0,
      couponData.max_discount_amount || null,
      couponData.start_date,
      couponData.end_date,
      couponData.start_time || "00:00:00",
      couponData.end_time || "23:59:59",
      couponData.usage_limit || null,
      couponData.usage_limit_per_customer || 1,
      couponData.free_shipping ? 1 : 0,
      couponData.shipping_discount || 0,
      couponData.is_active !== false ? 1 : 0,
      couponData.is_public !== false ? 1 : 0,
      couponData.customer_segments
        ? JSON.stringify(couponData.customer_segments)
        : null,
      couponData.product_categories
        ? JSON.stringify(couponData.product_categories)
        : null,
      couponData.excluded_products
        ? JSON.stringify(couponData.excluded_products)
        : null,
      couponData.min_products || 1,
    ];

    const [result] = await pool.query(sql, values);
    return result.insertId;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw error;
  }
}

// Admin: Update coupon
export async function updateCouponAdmin(couponId, couponData) {
  try {
    const sql = `
      UPDATE coupons_new SET
        code = ?, name = ?, description = ?, discount_type = ?, discount_value = ?,
        min_cart_amount = ?, max_discount_amount = ?, start_date = ?, end_date = ?,
        start_time = ?, end_time = ?, usage_limit = ?, usage_limit_per_customer = ?,
        free_shipping = ?, shipping_discount = ?, is_active = ?, is_public = ?,
        customer_segments = ?, product_categories = ?, excluded_products = ?,
        min_products = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const values = [
      couponData.code,
      couponData.name,
      couponData.description || null,
      couponData.discount_type,
      couponData.discount_value,
      couponData.min_cart_amount || 0,
      couponData.max_discount_amount || null,
      couponData.start_date,
      couponData.end_date,
      couponData.start_time || "00:00:00",
      couponData.end_time || "23:59:59",
      couponData.usage_limit || null,
      couponData.usage_limit_per_customer || 1,
      couponData.free_shipping ? 1 : 0,
      couponData.shipping_discount || 0,
      couponData.is_active !== false ? 1 : 0,
      couponData.is_public !== false ? 1 : 0,
      couponData.customer_segments
        ? JSON.stringify(couponData.customer_segments)
        : null,
      couponData.product_categories
        ? JSON.stringify(couponData.product_categories)
        : null,
      couponData.excluded_products
        ? JSON.stringify(couponData.excluded_products)
        : null,
      couponData.min_products || 1,
      couponId,
    ];

    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating coupon:", error);
    throw error;
  }
}

// Admin: Update coupon active status only (enable/disable)
export async function updateCouponActiveStatusAdmin(couponId, isActive) {
  try {
    const id = typeof couponId === "number" ? couponId : parseInt(couponId, 10);
    if (Number.isNaN(id) || id < 1) return false;
    const sql = `UPDATE coupons_new SET is_active = ?, updated_at = NOW() WHERE id = ?`;
    const [result] = await pool.query(sql, [isActive ? 1 : 0, id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating coupon active status:", error);
    throw error;
  }
}

// Admin: Deactivate all coupons that have expired (end_date < today)
export async function deactivateExpiredCouponsAdmin() {
  try {
    const sql = `
      UPDATE coupons_new
      SET is_active = 0, updated_at = NOW()
      WHERE (end_date < CURDATE() OR (end_date = CURDATE() AND end_time < CURTIME()))
        AND (is_active = 1)
    `;
    const [result] = await pool.query(sql);
    return result.affectedRows;
  } catch (error) {
    console.error("Error deactivating expired coupons:", error);
    throw error;
  }
}

// Admin: Delete coupon
export async function deleteCouponAdmin(couponId) {
  try {
    const sql = `DELETE FROM coupons_new WHERE id = ?`;
    const [result] = await pool.query(sql, [couponId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw error;
  }
}

function _buildProductFilterClauses(search, displayFilter, filters) {
  const clauses = [];
  const params = [];
  if (search) {
    clauses.push(`(p.ProductName LIKE ? OR p.PartNumber LIKE ?)`);
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }
  if (displayFilter === "1") {
    clauses.push(`p.Display = 1`);
  } else if (displayFilter === "0") {
    clauses.push(`p.Display = 0`);
  }
  const f = filters || {};
  if (f.bodyId) {
    clauses.push(`p.BodyID = ?`);
    params.push(f.bodyId);
  }
  if (f.categoryId) {
    clauses.push(`FIND_IN_SET(?, p.CatID) > 0`);
    params.push(f.categoryId);
  }
  if (f.manufacturerId) {
    clauses.push(`p.ManID = ?`);
    params.push(f.manufacturerId);
  }
  if (f.scratchAndDent) {
    clauses.push(`p.BlemProduct = 1`);
  }
  if (f.newProducts === "all") {
    clauses.push(`p.NewPart = 1`);
  } else if (f.newProducts === "onsite") {
    clauses.push(
      `p.NewPart = 1 AND p.BlemProduct = 0 AND p.NewPartDate IS NOT NULL AND p.NewPartDate != '' AND p.NewPartDate != '0' AND STR_TO_DATE(p.NewPartDate, '%Y-%m-%d') >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)`,
    );
  }
  if (f.noImage) {
    clauses.push(
      `(p.ImageSmall IS NULL OR p.ImageSmall = '' OR p.ImageSmall = '0')`,
    );
  }
  if (f.featured) {
    clauses.push(`p.fproduct = 1`);
  }
  if (f.lowMargin) {
    clauses.push(`p.LowMargin = 1`);
  }
  if (f.hardwarePacks) {
    clauses.push(`p.hardwarepack = 1`);
  }
  if (f.multipleBoxes) {
    clauses.push(`(p.mbox IS NOT NULL AND p.mbox != '' AND p.mbox != '0')`);
  }
  if (f.package) {
    clauses.push(`p.Package = 1`);
  }
  if (f.noManufacturer) {
    clauses.push(`(p.ManID IS NULL OR p.ManID = 0)`);
  }
  return { clauses, params };
}

// Admin: Get total product count (same filters as getAllProductsAdmin)
export async function getProductsCountAdmin(
  search = null,
  displayFilter = null,
  filters = {},
) {
  try {
    const { clauses, params } = _buildProductFilterClauses(
      search,
      displayFilter,
      filters,
    );
    const whereClause = clauses.length ? ` AND ${clauses.join(" AND ")}` : "";
    const sql = `
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN bodies b ON p.BodyID = b.BodyID
      WHERE 1=1${whereClause}
    `;
    const [rows] = await pool.query(sql, params);
    return rows[0]?.total ?? 0;
  } catch (error) {
    console.error("Error fetching products count:", error);
    throw error;
  }
}

// Admin: Get all products (including hidden) with Platform from bodies; supports sort and pagination
const SORT_COLUMNS = {
  PartNumber: "p.PartNumber",
  ProductName: "p.ProductName",
  Platform: "Platform",
  Price: "CAST(p.Price AS DECIMAL(10,2))",
  Qty: "p.Qty",
  Display: "p.Display",
};

export async function getAllProductsAdmin(
  limit = 100,
  offset = 0,
  search = null,
  sortColumn = "PartNumber",
  sortDirection = "asc",
  displayFilter = null,
  filters = {},
) {
  try {
    const orderCol = SORT_COLUMNS[sortColumn] || "p.PartNumber";
    const orderDir = sortDirection === "desc" ? "DESC" : "ASC";
    const { clauses, params } = _buildProductFilterClauses(
      search,
      displayFilter,
      filters,
    );
    const whereClause = clauses.length ? ` AND ${clauses.join(" AND ")}` : "";

    const sql = `
      SELECT p.*, CONCAT(b.StartYear, '-', b.EndYear, ' ', b.Name) AS Platform
      FROM products p
      LEFT JOIN bodies b ON p.BodyID = b.BodyID
      WHERE 1=1${whereClause}
      ORDER BY ${orderCol} ${orderDir} LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

// Admin: Get product by ID (including hidden)
export async function getProductByIdAdmin(productId) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM products WHERE ProductID = ?`,
      [productId],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

// Admin: Create product
export async function createProductAdmin(productData) {
  try {
    const sql = `
      INSERT INTO products (
        PartNumber, ProductName, Description, Retail, Price, ImageSmall, Qty,
        BodyID, PlatformID, CatID, ImageLarge, Features, Instructions, Blength, Bheight,
        Bwidth, Bweight, Color, Hardware, Grease, Images, NewPart, NewPartDate,
        PackagePartnumbers, FreeShipping, Display, PackagePartnumbersQty, Package,
        StartAppYear, EndAppYear, UsaMade, fproduct, CrossRef, ManID, LowMargin,
        mbox, flatrate, AngleFinder, endproduct, domhandling, hardwarepack,
        hardwarepacks, video, taxexempt, couponexempt, BlemProduct
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      productData.PartNumber || "0",
      productData.ProductName || "0",
      productData.Description || null,
      productData.Retail || "0",
      productData.Price || "0",
      productData.ImageSmall || "0",
      productData.Qty || 0,
      productData.BodyID || 0,
      productData.PlatformID ?? null,
      productData.CatID || "0",
      productData.ImageLarge || "0",
      productData.Features || null,
      productData.Instructions || "0",
      productData.Blength || 0,
      productData.Bheight || 0,
      productData.Bwidth || 0,
      productData.Bweight || 0,
      productData.Color || "0",
      productData.Hardware || "0",
      productData.Grease || "0",
      productData.Images || "0",
      productData.NewPart || 0,
      productData.NewPartDate || "0",
      productData.PackagePartnumbers || "0",
      productData.FreeShipping || "0",
      productData.Display !== undefined ? productData.Display : 1,
      productData.PackagePartnumbersQty || "0",
      productData.Package || 0,
      productData.StartAppYear || "0",
      productData.EndAppYear || "0",
      productData.UsaMade !== undefined ? productData.UsaMade : 1,
      productData.fproduct || 0,
      productData.CrossRef || "0",
      productData.ManID || 0,
      productData.LowMargin || 0,
      productData.mbox || "0",
      productData.flatrate || "0",
      productData.AngleFinder || "0",
      productData.endproduct || "0",
      productData.domhandling || "0",
      productData.hardwarepack || 0,
      productData.hardwarepacks || "0",
      productData.video || "0",
      productData.taxexempt || 0,
      productData.couponexempt || 0,
      productData.BlemProduct || 0,
    ];

    const [result] = await pool.query(sql, values);
    return result.insertId;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

// Admin: Update product
export async function updateProductAdmin(productId, productData) {
  try {
    const sql = `
      UPDATE products SET
        PartNumber = ?, ProductName = ?, Description = ?, Retail = ?, Price = ?,
        ImageSmall = ?, Qty = ?, BodyID = ?, CatID = ?, ImageLarge = ?,
        Features = ?, Instructions = ?, Blength = ?, Bheight = ?, Bwidth = ?,
        Bweight = ?, Color = ?, Hardware = ?, Grease = ?, Images = ?,
        NewPart = ?, NewPartDate = ?, PackagePartnumbers = ?, FreeShipping = ?,
        Display = ?, PackagePartnumbersQty = ?, Package = ?, StartAppYear = ?,
        EndAppYear = ?, UsaMade = ?, fproduct = ?, CrossRef = ?, ManID = ?,
        LowMargin = ?, mbox = ?, flatrate = ?, AngleFinder = ?, endproduct = ?,
        domhandling = ?, hardwarepack = ?, hardwarepacks = ?, video = ?,
        taxexempt = ?, couponexempt = ?, BlemProduct = ?
      WHERE ProductID = ?
    `;

    const values = [
      productData.PartNumber || "0",
      productData.ProductName || "0",
      productData.Description || null,
      productData.Retail || "0",
      productData.Price || "0",
      productData.ImageSmall || "0",
      productData.Qty || 0,
      productData.BodyID || 0,
      productData.CatID || "0",
      productData.ImageLarge || "0",
      productData.Features || null,
      productData.Instructions || "0",
      productData.Blength || 0,
      productData.Bheight || 0,
      productData.Bwidth || 0,
      productData.Bweight || 0,
      productData.Color || "0",
      productData.Hardware || "0",
      productData.Grease || "0",
      productData.Images || "0",
      productData.NewPart || 0,
      productData.NewPartDate || "0",
      productData.PackagePartnumbers || "0",
      productData.FreeShipping || "0",
      productData.Display !== undefined ? productData.Display : 1,
      productData.PackagePartnumbersQty || "0",
      productData.Package || 0,
      productData.StartAppYear || "0",
      productData.EndAppYear || "0",
      productData.UsaMade !== undefined ? productData.UsaMade : 1,
      productData.fproduct || 0,
      productData.CrossRef || "0",
      productData.ManID || 0,
      productData.LowMargin || 0,
      productData.mbox || "0",
      productData.flatrate || "0",
      productData.AngleFinder || "0",
      productData.endproduct || "0",
      productData.domhandling || "0",
      productData.hardwarepack || 0,
      productData.hardwarepacks || "0",
      productData.video || "0",
      productData.taxexempt || 0,
      productData.couponexempt || 0,
      productData.BlemProduct || 0,
      productId,
    ];

    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

// Admin: Delete product
export async function deleteProductAdmin(productId) {
  try {
    const sql = `DELETE FROM products WHERE ProductID = ?`;
    const [result] = await pool.query(sql, [productId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

// Admin: Get all categories
export async function getAllCategoriesAdmin() {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, mc.MainCatName, b.Name as PlatformName
      FROM categories c
      LEFT JOIN maincategories mc ON c.MainCatID = mc.MainCatID
      LEFT JOIN bodies b ON mc.BodyID = b.BodyID
      ORDER BY c.CatID DESC
    `);
    return rows;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

// Admin: Get category by ID
export async function getCategoryByIdAdmin(catId) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM categories WHERE CatID = ?`,
      [catId],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error;
  }
}

// Admin: Create category
export async function createCategoryAdmin(categoryData) {
  try {
    const sql = `
      INSERT INTO categories (CatName, CatImage, MainCatID, ParentID)
      VALUES (?, ?, ?, ?)
    `;
    const values = [
      categoryData.CatName || "",
      categoryData.CatImage || "0",
      categoryData.MainCatID || "0",
      categoryData.ParentID || 0,
    ];
    const [result] = await pool.query(sql, values);
    return result.insertId;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

// Admin: Update category
export async function updateCategoryAdmin(catId, categoryData) {
  try {
    const sql = `
      UPDATE categories SET
        CatName = ?, CatImage = ?, MainCatID = ?, ParentID = ?
      WHERE CatID = ?
    `;
    const values = [
      categoryData.CatName || "",
      categoryData.CatImage || "0",
      categoryData.MainCatID || "0",
      categoryData.ParentID || 0,
      catId,
    ];
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}

// Admin: Delete category
export async function deleteCategoryAdmin(catId) {
  try {
    const sql = `DELETE FROM categories WHERE CatID = ?`;
    const [result] = await pool.query(sql, [catId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}

// Admin: Get all main categories
export async function getAllMainCategoriesAdmin() {
  try {
    const [rows] = await pool.query(`
      SELECT mc.*, b.Name as PlatformName
      FROM maincategories mc
      LEFT JOIN bodies b ON mc.BodyID = b.BodyID
      ORDER BY mc.MainCatID DESC
    `);
    return rows;
  } catch (error) {
    console.error("Error fetching main categories:", error);
    throw error;
  }
}

// Admin: Get main category by ID
export async function getMainCategoryByIdAdmin(mainCatId) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM maincategories WHERE MainCatID = ?`,
      [mainCatId],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching main category:", error);
    throw error;
  }
}

// Admin: Create main category
export async function createMainCategoryAdmin(mainCategoryData) {
  try {
    const sql = `
      INSERT INTO maincategories (BodyID, MainCatImage, MainCatName)
      VALUES (?, ?, ?)
    `;
    const values = [
      mainCategoryData.BodyID || "0",
      mainCategoryData.MainCatImage || "0",
      mainCategoryData.MainCatName || "",
    ];
    const [result] = await pool.query(sql, values);
    return result.insertId;
  } catch (error) {
    console.error("Error creating main category:", error);
    throw error;
  }
}

// Admin: Update main category
export async function updateMainCategoryAdmin(mainCatId, mainCategoryData) {
  try {
    const sql = `
      UPDATE maincategories SET
        BodyID = ?, MainCatImage = ?, MainCatName = ?
      WHERE MainCatID = ?
    `;
    const values = [
      mainCategoryData.BodyID || "0",
      mainCategoryData.MainCatImage || "0",
      mainCategoryData.MainCatName || "",
      mainCatId,
    ];
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating main category:", error);
    throw error;
  }
}

// Admin: Delete main category
export async function deleteMainCategoryAdmin(mainCatId) {
  try {
    const sql = `DELETE FROM maincategories WHERE MainCatID = ?`;
    const [result] = await pool.query(sql, [mainCatId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting main category:", error);
    throw error;
  }
}

// Admin: Get all platforms from platforms table
export async function getAllPlatformsAdmin() {
  try {
    const [rows] = await pool.query(
      `SELECT PlatformID AS BodyID, Name, StartYear, EndYear, Image, HeaderImage,
              PlatformOrder AS BodyOrder, BodyCatID AS platform_group_id, slug
       FROM platforms ORDER BY PlatformOrder ASC, PlatformID ASC`,
    );
    return rows || [];
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") throw e;
    console.error("Error in getAllPlatformsAdmin:", e);
    throw e;
  }
}

/** Admin: platform groups (replaces bodycats in new UI). */
export async function getPlatformGroupsAdmin() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM platform_groups ORDER BY position ASC, id ASC",
    );
    return rows || [];
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") return [];
    throw e;
  }
}

export async function createPlatformGroupAdmin(data) {
  const [r] = await pool.query(
    "INSERT INTO platform_groups (name, position) VALUES (?, ?)",
    [data.name || "Group", data.position ?? 0],
  );
  return r.insertId;
}

export async function updatePlatformGroupAdmin(id, data) {
  const [r] = await pool.query(
    "UPDATE platform_groups SET name = ?, position = ? WHERE id = ?",
    [data.name ?? "", data.position ?? 0, id],
  );
  return r.affectedRows > 0;
}

export async function deletePlatformGroupAdmin(id) {
  const [r] = await pool.query("DELETE FROM platform_groups WHERE id = ?", [
    id,
  ]);
  return r.affectedRows > 0;
}

/** Admin: platforms by platform_group_id (BodyCatID = platform_groups.id). */
export async function getPlatformsByPlatformGroupAdmin(platformGroupId) {
  try {
    const [rows] = await pool.query(
      `SELECT PlatformID AS BodyID, Name, StartYear, EndYear, Image, HeaderImage,
              PlatformOrder AS BodyOrder, BodyCatID AS platform_group_id, slug
       FROM platforms WHERE BodyCatID = ? ORDER BY PlatformOrder ASC, PlatformID ASC`,
      [platformGroupId],
    );
    return rows || [];
  } catch (e) {
    if (e.code === "ER_NO_SUCH_TABLE") throw e;
    console.error("Error in getPlatformsByPlatformGroupAdmin:", e);
    throw e;
  }
}

/** @deprecated Use getPlatformsByPlatformGroupAdmin. Kept for API compatibility. */
export async function getBodiesByPlatformGroupAdmin(platformGroupId) {
  return getPlatformsByPlatformGroupAdmin(platformGroupId);
}

export async function createPlatformAdmin(data) {
  const platformGroupId = data.platformGroupId ?? data.bodyCatId ?? 0;
  const [r] = await pool.query(
    `INSERT INTO platforms (Name, StartYear, EndYear, Image, PlatformOrder, BodyCatID, HeaderImage, slug)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name || "",
      data.startYear || "0",
      data.endYear || "0",
      data.image ?? "0",
      data.bodyOrder ?? 0,
      platformGroupId,
      data.headerImage ?? "0",
      data.slug || null,
    ],
  );
  return r.insertId;
}

export async function updatePlatformAdmin(platformId, data) {
  const bodyCatId =
    data.platformGroupId ?? data.bodyCatId ?? data.platform_group_id ?? 0;
  const [r] = await pool.query(
    `UPDATE platforms SET Name = ?, StartYear = ?, EndYear = ?, Image = ?, HeaderImage = ?, PlatformOrder = ?, slug = ?, BodyCatID = ?
     WHERE PlatformID = ?`,
    [
      data.name ?? "",
      data.startYear ?? "0",
      data.endYear ?? "0",
      data.image ?? "0",
      data.headerImage ?? "0",
      data.bodyOrder ?? 0,
      data.slug ?? null,
      bodyCatId,
      platformId,
    ],
  );
  return r.affectedRows > 0;
}

export async function deletePlatformAdmin(platformId) {
  const [r] = await pool.query("DELETE FROM platforms WHERE PlatformID = ?", [
    platformId,
  ]);
  return r.affectedRows > 0;
}

/** @deprecated Use createPlatformAdmin. */
export async function createBodyAdmin(data) {
  return createPlatformAdmin(data);
}

/** @deprecated Use updatePlatformAdmin. */
export async function updateBodyAdmin(platformId, data) {
  return updatePlatformAdmin(platformId, data);
}

/** @deprecated Use deletePlatformAdmin. */
export async function deleteBodyAdmin(platformId) {
  return deletePlatformAdmin(platformId);
}

/** Admin: create/update/delete vehicles. */
export async function createVehicleAdmin(data) {
  const [r] = await pool.query(
    `INSERT INTO vehicles (StartYear, EndYear, BodyID, Make, Model, SubModel)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.startYear ?? "0",
      data.endYear ?? data.startYear ?? "0",
      data.bodyId ?? "0",
      data.make ?? "",
      data.model ?? "",
      data.subModel ?? null,
    ],
  );
  return r.insertId;
}

export async function updateVehicleAdmin(vehicleId, data) {
  const [r] = await pool.query(
    `UPDATE vehicles SET StartYear = ?, EndYear = ?, BodyID = ?, Make = ?, Model = ?, SubModel = ?
     WHERE VehicleID = ?`,
    [
      data.startYear ?? "0",
      data.endYear ?? data.startYear ?? "0",
      data.bodyId ?? "0",
      data.make ?? "",
      data.model ?? "",
      data.subModel ?? null,
      vehicleId,
    ],
  );
  return r.affectedRows > 0;
}

export async function deleteVehicleAdmin(vehicleId) {
  const [r] = await pool.query("DELETE FROM vehicles WHERE VehicleID = ?", [
    vehicleId,
  ]);
  return r.affectedRows > 0;
}

// Admin: Get all manufacturers
export async function getAllManufacturersAdmin() {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM mans ORDER BY ManID DESC
    `);
    return rows;
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
    throw error;
  }
}

/**
 * Returns true only if every product in productIds is a BMR product
 * (manufacturer name contains "BMR" or "B.M.R."). Empty list returns false.
 * Uses distinct product IDs so duplicate cart lines do not affect the result.
 * @param {number[]} productIds - Product IDs in the cart.
 * @returns {Promise<boolean>}
 */
export async function areAllProductsBmr(productIds) {
  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return false;
  }
  const ids = [
    ...new Set(
      productIds
        .map((id) => (id != null ? Number(id) : null))
        .filter((id) => id != null && !isNaN(id)),
    ),
  ];
  if (ids.length === 0) return false;
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(DISTINCT p.ProductID) AS bmr_count
       FROM products p
       INNER JOIN mans m ON p.ManID = m.ManID
       WHERE p.ProductID IN (?)
         AND (UPPER(m.ManName) LIKE '%BMR%' OR UPPER(m.ManName) LIKE '%B.M.R.%')`,
      [ids],
    );
    const bmrCount = rows?.[0]?.bmr_count ?? 0;
    return bmrCount === ids.length;
  } catch (error) {
    console.error("Error in areAllProductsBmr:", error);
    return false;
  }
}

/**
 * Returns true only if every product is eligible for coupon (free shipping/discount):
 * Individual BMR Suspension products only. Excludes: non-BMR (different brands),
 * scratch & dent (BlemProduct), BMR packages, BMR merchandise, low margin, couponexempt.
 * Lower 48 is enforced separately.
 * @param {number[]} productIds - Product IDs in the cart.
 * @returns {Promise<boolean>}
 */
export async function areAllProductsCouponEligible(productIds) {
  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return false;
  }
  const ids = [
    ...new Set(
      productIds
        .map((id) => (id != null ? Number(id) : null))
        .filter((id) => id != null && !isNaN(id)),
    ),
  ];
  if (ids.length === 0) return false;
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(DISTINCT p.ProductID) AS eligible_count
       FROM products p
       INNER JOIN mans m ON p.ManID = m.ManID
       WHERE p.ProductID IN (?)
         AND (UPPER(m.ManName) LIKE '%BMR%' OR UPPER(m.ManName) LIKE '%B.M.R.%')
         AND COALESCE(p.LowMargin, 0) = 0
         AND COALESCE(p.Package, 0) = 0
         AND COALESCE(p.BlemProduct, 0) = 0
         AND COALESCE(p.couponexempt, 0) = 0
         AND NOT EXISTS (
           SELECT 1 FROM categories c
           LEFT JOIN maincategories mc ON c.MainCatID = mc.MainCatID
           WHERE FIND_IN_SET(c.CatID, p.CatID)
             AND (UPPER(COALESCE(c.CatName,'')) LIKE '%MERCHANDISE%'
                  OR UPPER(COALESCE(mc.MainCatName,'')) LIKE '%MERCHANDISE%')
         )`,
      [ids],
    );
    const eligibleCount = rows?.[0]?.eligible_count ?? 0;
    return eligibleCount === ids.length;
  } catch (error) {
    console.error("Error in areAllProductsCouponEligible:", error);
    return false;
  }
}

/**
 * Returns the set of product IDs that are eligible for coupon discount:
 * Individual BMR Suspension products only (same rules as areAllProductsCouponEligible).
 * Used to apply discount only to qualifying lines when cart has mixed items.
 * @param {number[]} productIds - Product IDs to check.
 * @returns {Promise<Set<number>>}
 */
export async function getCouponEligibleProductIds(productIds) {
  const eligible = new Set();
  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return eligible;
  }
  const ids = [
    ...new Set(
      productIds
        .map((id) => (id != null ? Number(id) : null))
        .filter((id) => id != null && !isNaN(id)),
    ),
  ];
  if (ids.length === 0) return eligible;
  try {
    const [rows] = await pool.query(
      `SELECT p.ProductID
       FROM products p
       INNER JOIN mans m ON p.ManID = m.ManID
       WHERE p.ProductID IN (?)
         AND (UPPER(m.ManName) LIKE '%BMR%' OR UPPER(m.ManName) LIKE '%B.M.R.%')
         AND COALESCE(p.LowMargin, 0) = 0
         AND COALESCE(p.Package, 0) = 0
         AND COALESCE(p.BlemProduct, 0) = 0
         AND COALESCE(p.couponexempt, 0) = 0
         AND NOT EXISTS (
           SELECT 1 FROM categories c
           LEFT JOIN maincategories mc ON c.MainCatID = mc.MainCatID
           WHERE FIND_IN_SET(c.CatID, p.CatID)
             AND (UPPER(COALESCE(c.CatName,'')) LIKE '%MERCHANDISE%'
                  OR UPPER(COALESCE(mc.MainCatName,'')) LIKE '%MERCHANDISE%')
         )`,
      [ids],
    );
    (rows || []).forEach((r) => eligible.add(Number(r.ProductID)));
    return eligible;
  } catch (error) {
    console.error("Error in getCouponEligibleProductIds:", error);
    return eligible;
  }
}

/**
 * Returns true only if every product is eligible for free shipping to lower 48:
 * BMR products only; includes scratch & dent (BlemProduct), BMR packages, and low margin.
 * Excludes: non-BMR, BMR merchandise. Lower 48 is enforced at the shipping-rates layer.
 * Note: couponexempt/scratch & dent get free shipping; they are only excluded from coupon discounts.
 * @param {number[]} productIds - Product IDs in the cart.
 * @returns {Promise<boolean>}
 */
export async function areAllProductsFreeShippingEligible(productIds) {
  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return false;
  }
  const ids = [
    ...new Set(
      productIds
        .map((id) => (id != null ? Number(id) : null))
        .filter((id) => id != null && !isNaN(id)),
    ),
  ];
  if (ids.length === 0) return false;
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(DISTINCT p.ProductID) AS eligible_count
       FROM products p
       INNER JOIN mans m ON p.ManID = m.ManID
       WHERE p.ProductID IN (?)
         AND (UPPER(m.ManName) LIKE '%BMR%' OR UPPER(m.ManName) LIKE '%B.M.R.%')
         AND NOT EXISTS (
           SELECT 1 FROM categories c
           LEFT JOIN maincategories mc ON c.MainCatID = mc.MainCatID
           WHERE FIND_IN_SET(c.CatID, p.CatID)
             AND (UPPER(COALESCE(c.CatName,'')) LIKE '%MERCHANDISE%'
                  OR UPPER(COALESCE(mc.MainCatName,'')) LIKE '%MERCHANDISE%')
         )`,
      [ids],
    );
    const eligibleCount = rows?.[0]?.eligible_count ?? 0;
    return eligibleCount === ids.length;
  } catch (error) {
    console.error("Error in areAllProductsFreeShippingEligible:", error);
    return false;
  }
}

// Topbar scrolling messages (HTML allowed in content)

/**
 * Get all topbar messages for the scrolling strip, ordered by sort_order.
 * @param {Object} opts
 * @param {boolean} [opts.activeOnly=true] - If true, only return is_active=1 (for public). Admin uses false.
 * @returns {Array<{id,content,sort_order,duration,is_active}>} duration in ms
 */
export async function getTopbarMessages(opts = {}) {
  const { activeOnly = true } = opts;
  try {
    const where = activeOnly ? "WHERE is_active = 1" : "";
    const [rows] = await pool.query(
      `
      SELECT id, content, sort_order, duration, is_active
      FROM topbar_messages
      ${where}
      ORDER BY sort_order ASC, id ASC
    `,
    );
    return (rows || []).map((r) => ({
      id: r.id,
      content: r.content != null ? String(r.content) : "",
      sort_order: r.sort_order,
      duration: r.duration != null ? Number(r.duration) : 3000,
      is_active: r.is_active === 1 || r.is_active === true,
    }));
  } catch (error) {
    console.error("Error fetching topbar messages:", error);
    return [];
  }
}

/**
 * Replace all topbar messages. Deletes existing and inserts the new list.
 * @param {Array<{ content: string, duration?: number, is_active?: boolean }>} messages
 *   - content: HTML allowed (sanitized by caller)
 *   - duration: ms to show slide (default 3000)
 *   - is_active: default true
 */
export async function saveTopbarMessages(messages) {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    await conn.query("DELETE FROM topbar_messages");
    if (messages && messages.length > 0) {
      const values = messages.map((m, i) => [
        m.content || "",
        i,
        Math.max(1000, Math.min(60000, Number(m.duration) || 3000)),
        m.is_active === false || m.is_active === 0 ? 0 : 1,
      ]);
      await conn.query(
        "INSERT INTO topbar_messages (content, sort_order, duration, is_active) VALUES ?",
        [values],
      );
    }
    await conn.query("COMMIT");
  } catch (error) {
    await conn.query("ROLLBACK");
    console.error("Error saving topbar messages:", error);
    throw error;
  } finally {
    conn.release();
  }
}
