// lib/queries.js

import pool from "./db"; // Import MySQL connection pool
import Link from "next/link";
import mysql from "mysql2/promise";
import { encrypt } from "./ccEncryption";
import { isLower48UsState } from "./shipping";

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
             p.Grease, p.AngleFinder, p.Hardware,
             m.ManName
      FROM products p
      LEFT JOIN mans m ON p.ManID = m.ManID
    `;
    const params = [];
    const where = ["p.Display = '1'", "(p.endproduct IS NULL OR p.endproduct != '1')"];

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
    [customerId, (subject || "").trim().slice(0, 255), (suggestion || "").trim()],
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

/** Get PO with line items. */
export async function getDealerPOWithItems(poId, customerId = null) {
  const po = await getDealerPOById(poId, customerId);
  if (!po) return null;
  const [items] = await pool.query(
    `SELECT id, po_id, product_id, part_number, product_name, quantity,
            color_id, color_name, unit_price, created_at,
            grease_id, grease_name, anglefinder_id, anglefinder_name, hardware_id, hardware_name
     FROM dealer_po_items WHERE po_id = ? ORDER BY id ASC`,
    [poId],
  );
  return { ...po, items: items || [] };
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
  } = data;
  const [result] = await pool.query(
    `INSERT INTO dealer_po_items
     (po_id, product_id, part_number, product_name, quantity, color_id, color_name, unit_price,
      grease_id, grease_name, anglefinder_id, anglefinder_name, hardware_id, hardware_name)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    ],
  );
  return result.insertId;
}

/** Update item quantity. */
export async function updateDealerPOItemQty(itemId, quantity) {
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  await pool.query(
    `UPDATE dealer_po_items SET quantity = ? WHERE id = ?`,
    [qty, itemId],
  );
}

/** Update item quantity and/or color. */
export async function updateDealerPOItem(itemId, { quantity, colorId, colorName }) {
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

/** Send dealer PO (status -> sent, set sent_at). */
export async function sendDealerPO(poId, customerId) {
  const [result] = await pool.query(
    `UPDATE dealer_purchase_orders
     SET status = 'sent', sent_at = NOW()
     WHERE id = ? AND customer_id = ? AND status = 'draft'`,
    [poId, customerId],
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
              shipping_cost, payment_method, payment_status
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

// Get menu data - simple list of platforms with thumbnails, ordered newest to oldest
export async function getMenuData() {
  try {
    // Get all bodies grouped by body category
    const query = `
      SELECT b.BodyID, b.Name, b.StartYear, b.EndYear, b.BodyOrder, b.slug, b.Image,
             bc.BodyCatID, bc.BodyCatName, bc.Position
      FROM bodies b
      JOIN bodycats bc ON b.BodyCatID = bc.BodyCatID
      ORDER BY b.StartYear DESC, b.EndYear DESC, b.Name ASC
    `;

    const [bodies] = await pool.query(query);

    // Group by categories
    const fordBodies = bodies.filter((body) =>
      body.BodyCatName.includes("Ford"),
    );
    const gmLateBodies = bodies.filter((body) =>
      body.BodyCatName.includes("GM Late Model"),
    );
    const gmMidMuscle = bodies.filter((body) =>
      body.BodyCatName.includes("GM Mid Muscle"),
    );
    const gmClassicMuscle = bodies.filter((body) =>
      body.BodyCatName.includes("GM Classic Muscle"),
    );
    const moparBodies = bodies.filter((body) =>
      body.BodyCatName.includes("Mopar"),
    );

    // Helper to build platform slug: year-year-name (e.g. 2001-2004-corvette-z06)
    function getPlatformSlug(body) {
      const nameSlug = (body.Name || "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      return (
        body.slug ||
        `${body.StartYear}-${body.EndYear}-${nameSlug}`.replace(/-+/g, "-")
      );
    }

    // Helper to convert bodies to simple platform list
    function buildPlatformList(bodies) {
      return bodies.map((body) => {
        const platformSlug = getPlatformSlug(body);
        const imageUrl =
          body.Image && body.Image !== "0"
            ? `/images/cars/${body.Image}`
            : null;

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

// Get all Ford platforms (bodies) with related vehicle info
export async function getFordPlatformsWithVehicles() {
  try {
    const query = `
      SELECT
        b.BodyID            AS id,
        b.Name              AS name,
        b.StartYear         AS startYear,
        b.EndYear           AS endYear,
        b.Image             AS image,
        b.HeaderImage       AS headerImage,
        b.slug              AS slug,
        GROUP_CONCAT(DISTINCT v.Make  ORDER BY v.Make  SEPARATOR ', ') AS makes,
        GROUP_CONCAT(DISTINCT v.Model ORDER BY v.Model SEPARATOR ', ') AS models
      FROM bodies b
      JOIN bodycats bc ON b.BodyCatID = bc.BodyCatID
      LEFT JOIN vehicles v ON v.BodyID = b.BodyID
      WHERE bc.BodyCatName LIKE '%Ford%'
      GROUP BY b.BodyID, b.Name, b.StartYear, b.EndYear, b.Image, b.HeaderImage, b.slug
      ORDER BY b.BodyOrder
    `;

    const [rows] = await pool.query(query);

    // Normalize results and build image/slug fallbacks
    const platforms = rows.map((row) => {
      const slugFromName = `${row.startYear}-${row.endYear}-${row.name}`
        .toLowerCase()
        .replace(/\s+/g, "-");

      const slug = row.slug || slugFromName;

      // Prefer explicit body image in local cars folder; fall back to a safe default
      const imageUrl =
        row.image && row.image !== "0"
          ? `/images/cars/${row.image}`
          : `/images/cars/2024-2024 Mustang.png`;

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

// Get all GM platforms across Late/Mid/Classic muscle categories
export async function getGMPlatformsWithVehicles() {
  try {
    const query = `
      SELECT
        b.BodyID  AS id,
        b.Name    AS name,
        b.StartYear AS startYear,
        b.EndYear   AS endYear,
        b.Image   AS image,
        b.HeaderImage AS headerImage,
        b.slug    AS slug,
        bc.BodyCatName AS bodyCatName,
        GROUP_CONCAT(DISTINCT v.Make  ORDER BY v.Make  SEPARATOR ', ') AS makes,
        GROUP_CONCAT(DISTINCT v.Model ORDER BY v.Model SEPARATOR ', ') AS models
      FROM bodies b
      JOIN bodycats bc ON b.BodyCatID = bc.BodyCatID
      LEFT JOIN vehicles v ON v.BodyID = b.BodyID
      WHERE bc.BodyCatName LIKE '%GM Late Model%'
         OR bc.BodyCatName LIKE '%GM Mid Muscle%'
         OR bc.BodyCatName LIKE '%GM Classic Muscle%'
      GROUP BY b.BodyID, b.Name, b.StartYear, b.EndYear, b.Image, b.HeaderImage, b.slug
      ORDER BY b.BodyOrder
    `;
    const [rows] = await pool.query(query);
    return rows.map((row) => {
      const slug =
        row.slug ||
        `${row.startYear}-${row.endYear}-${row.name}`
          .toLowerCase()
          .replace(/\s+/g, "-");
      const imageUrl =
        row.image && row.image !== "0"
          ? `/images/cars/${row.image}`
          : `/images/cars/2024-2024 Mustang.png`;
      return { ...row, slug, image: imageUrl };
    });
  } catch (error) {
    console.error("Error fetching GM platforms:", error);
    return [];
  }
}

// Get Mopar platforms
export async function getMoparPlatformsWithVehicles() {
  try {
    const query = `
      SELECT
        b.BodyID  AS id,
        b.Name    AS name,
        b.StartYear AS startYear,
        b.EndYear   AS endYear,
        b.Image   AS image,
        b.HeaderImage AS headerImage,
        b.slug    AS slug,
        GROUP_CONCAT(DISTINCT v.Make  ORDER BY v.Make  SEPARATOR ', ') AS makes,
        GROUP_CONCAT(DISTINCT v.Model ORDER BY v.Model SEPARATOR ', ') AS models
      FROM bodies b
      JOIN bodycats bc ON b.BodyCatID = bc.BodyCatID
      LEFT JOIN vehicles v ON v.BodyID = b.BodyID
      WHERE bc.BodyCatName LIKE '%Mopar%'
      GROUP BY b.BodyID, b.Name, b.StartYear, b.EndYear, b.Image, b.HeaderImage, b.slug
      ORDER BY b.BodyOrder
    `;
    const [rows] = await pool.query(query);
    return rows.map((row) => {
      const slug =
        row.slug ||
        `${row.startYear}-${row.endYear}-${row.name}`
          .toLowerCase()
          .replace(/\s+/g, "-");
      const imageUrl =
        row.image && row.image !== "0"
          ? `/images/cars/${row.image}`
          : `/images/cars/2024-2024 Mustang.png`;
      return { ...row, slug, image: imageUrl };
    });
  } catch (error) {
    console.error("Error fetching Mopar platforms:", error);
    return [];
  }
}

// Get body details by ID
export async function getBodyDetailsById(bodyId) {
  try {
    if (!bodyId) {
      throw new Error("Missing bodyId parameter");
    }

    // Get the body details
    const bodyQuery = `
      SELECT BodyID, Name, StartYear, EndYear, Image, HeaderImage, BodyCatID, slug
      FROM bodies
      WHERE BodyID = ?
    `;

    const [bodyDetails] = await pool.query(bodyQuery, [bodyId]);

    if (!bodyDetails || bodyDetails.length === 0) {
      throw new Error("Body not found");
    }

    return bodyDetails[0];
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

    // Get vehicles for this body
    const vehiclesQuery = `
      SELECT VehicleID, StartYear, EndYear, Make, Model, BodyID
      FROM vehicles
      WHERE BodyID = ?
      ORDER BY StartYear DESC, Make, Model
    `;

    const [vehicles] = await pool.query(vehiclesQuery, [bodyId]);

    return vehicles;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
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

// Get main categories (Suspension, Chassis, etc.)
export async function getMainCategories(platformSlug) {
  const query = `
    SELECT DISTINCT
      m.MainCatID as id,
      m.MainCatName as name,
      m.MainCatImage as image,
      m.MainCatSlug as slug
    FROM maincategories m
    JOIN categories c ON c.MainCatID = m.MainCatID
    JOIN products p ON p.CatID = c.CatID
    JOIN bodies b ON p.BodyID = b.BodyID
    WHERE b.slug = ?
    AND p.Display = "1"
    ORDER BY m.MainCatName
  `;

  const [rows] = await pool.query(query, [platformSlug]);
  return rows;
}

// Get categories by platform
export async function getCategoriesByPlatform(
  platformSlug,
  mainCategory = null,
) {
  // First get the BodyID from the platform slug
  const platformQuery = `
    SELECT BodyID, Name, StartYear, EndYear, HeaderImage, Image, slug
    FROM bodies
    WHERE slug = ?
  `;

  console.log("Platform Query:", platformQuery, [platformSlug]); // Debug log
  const [platforms] = await pool.query(platformQuery, [platformSlug]);

  if (!platforms || platforms.length === 0) {
    throw new Error("Platform not found");
  }

  const bodyId = platforms[0].BodyID;

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
    platforms[0].Name,
    platforms[0].StartYear,
    platforms[0].EndYear,
    bodyId,
  ];

  if (mainCategory) {
    query += ` AND m.MainCatSlug = ?`;
    params.push(mainCategory);
  }

  query += ` ORDER BY c.CatName`;

  console.log("Categories Query:", query, params); // Debug log
  const [rows] = await pool.query(query, params);

  // Extract platform info from the first row
  const platformInfo = {
    name: platforms[0].Name,
    startYear: platforms[0].StartYear,
    endYear: platforms[0].EndYear,
    image: platforms[0].Image,
    slug: platforms[0].slug,
  };

  console.log("Platform Info:", platformInfo); // Debug log

  // Remove platform info from individual category rows
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
      mc.MainCatName AS MainCategoryName
    FROM products p
    JOIN bodies b ON p.BodyID = b.BodyID
    LEFT JOIN categories c ON p.CatID = c.CatID
    LEFT JOIN maincategories mc ON c.MainCatID = mc.MainCatID
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
              imgSrc: `https://bmrsuspension.com/siteart/products/${largeImg}`,
              smallImgSrc: `https://bmrsuspension.com/siteart/products/${smallImg}`,
              alt: `Image ${acc.length + 1} for ${product?.ProductName}`,
              width: 770,
              height: 1075,
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
          imgSrc: `https://bmrsuspension.com/siteart/products/${product.ImageLarge.trim()}`,
          smallImgSrc: `https://bmrsuspension.com/siteart/products/${product.ImageLarge.trim().replace(
            /\.(jpg|jpeg|png|gif|webp)$/i,
            "_small.$1",
          )}`,
          alt: `Main image for ${product?.ProductName}`,
          width: 770,
          height: 1075,
        }
      : null;

  // Parse other images from the Images field
  const otherImages = parseImages(product?.Images);

  // Combine the main image with other images (if mainImage exists)
  const images = mainImage ? [mainImage, ...otherImages] : otherImages;

  // Add the images array to the product object
  product.images = images;

  return product;
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

// Get bodies by category ID
export async function getBodiesByCategory(bodyCatId) {
  const [rows] = await pool.query(
    `
    SELECT BodyID, Name, StartYear, EndYear, handle, BodyOrder
    FROM bodies
    WHERE BodyCatID = ?
    ORDER BY BodyOrder
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

// Get body by body ID
export async function getBodyByBodyId(bodyId) {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM bodies
    WHERE BodyID = ?
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

// Build platform slug in canonical form: year-year-name (e.g. 2001-2004-corvette-z06)
function buildPlatformSlugFromBody(row) {
  const nameSlug = (row.Name ?? row.name ?? "")
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const start = (row.StartYear ?? row.startYear ?? "").toString().trim();
  const end = (row.EndYear ?? row.endYear ?? "").toString().trim();
  return `${start}-${end}-${nameSlug}`.replace(/-+/g, "-");
}

// Get platform by slug
export async function getPlatformBySlug(slug) {
  const query = `
    SELECT
      BodyID as id,
      Name as name,
      StartYear as startYear,
      EndYear as endYear,
      Image as platformImage,
      HeaderImage as headerImage,
      slug
    FROM bodies
    WHERE slug = ?
  `;

  const [rows] = await pool.query(query, [slug]);

  if (rows.length > 0) {
    return rows[0];
  }

  // Fallback: resolve by computed slug (year-year-name) when DB slug is null
  const [allRows] = await pool.query(
    `SELECT BodyID as id, Name as name, StartYear as startYear,
      EndYear as endYear, Image as platformImage, HeaderImage as headerImage, slug
     FROM bodies`,
  );
  const normalizedSlug = (slug || "").toLowerCase().trim();
  for (const row of allRows) {
    if (buildPlatformSlugFromBody(row) === normalizedSlug) {
      return row;
    }
  }

  console.error("❌ No platform found for slug:", slug);
  return null;
}

/**
 * Fetch a platform (body) by its ID.
 * @param {number|string} id - The platform's BodyID.
 * @returns {Promise<Object|null>} The platform object or null if not found.
 */
export async function getPlatformById(id) {
  const query = `
    SELECT
      BodyID as id,
      Name as name,
      StartYear as startYear,
      EndYear as endYear,
      Image as platformImage,
      HeaderImage as headerImage,
      slug
    FROM bodies
    WHERE BodyID = ?
  `;

  const [rows] = await pool.query(query, [id]);

  if (rows.length === 0) {
    console.error("❌ No platform found for BodyID:", id);
    return null;
  }

  // We're using local platform header images, so no need to construct external URLs
  const platform = rows[0];

  console.log("✅ Query Result:", platform); // Debugging log
  return platform;
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
           b.Name as PlatformName
    FROM maincategories mc
    LEFT JOIN bodies b ON b.BodyID = mc.BodyID
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

// Get featured products by platform slug
export async function getFeaturedProductsByPlatform(platformSlug, limit = 8) {
  // Get the BodyID from the platform slug first
  const platformQuery = `
    SELECT BodyID
    FROM bodies
    WHERE slug = ?
  `;
  const [platforms] = await pool.query(platformQuery, [platformSlug]);

  if (!platforms || platforms.length === 0) {
    throw new Error("Platform not found");
  }

  const bodyId = platforms[0].BodyID;

  // Get featured products for this platform
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

  const query = `
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
  const [rows] = await pool.query(query, [
    platformSlug,
    mainCategorySlug.toLowerCase(),
    searchName.toLowerCase(),
    `%${searchName}%`,
  ]);
  return rows[0]?.MainCatID || null;
}

// Get all main categories with product count
export async function getMainCategoriesWithProductCount(platformSlug) {
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
		LEFT JOIN bodies b ON p.BodyID = b.BodyID
		WHERE m.BodyID = (SELECT BodyID FROM bodies WHERE slug = ? LIMIT 1)
		GROUP BY m.MainCatID, m.MainCatName, m.MainCatImage, m.MainCatSlug
		ORDER BY m.MainCatName
	`;
  const [rows] = await pool.query(query, [platformSlug]);
  return rows; // [{ id, name, image, slug, productCount }, ...]
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
			AND p.BodyID = (SELECT BodyID FROM bodies WHERE slug = ? LIMIT 1)
		WHERE c.MainCatID = ?
		GROUP BY c.CatID, c.CatName, c.CatImage
		ORDER BY c.CatName
	`;
  const [rows] = await pool.query(query, [platformSlug, mainCatId]);
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

  if (categoryId) {
    where.push("p.CatID = ?");
    params.push(categoryId);
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
  console.log("categorySlug", categorySlug);
  console.log("mainCategoryId", mainCategoryId);
  const query = `
		SELECT CatID
		FROM categories
		WHERE MainCatID = ?
			AND LOWER(CatNameSlug) = ?
		LIMIT 1
	`;
  const [rows] = await pool.query(query, [mainCategoryId, categorySlug]);
  return rows[0]?.CatID || null;
}

//get all colors
export async function getAllColors() {
  const query = `SELECT * FROM colors`;
  console.log("Colors query:", query);
  const [rows] = await pool.query(query);
  console.log("Colors query result:", rows);
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

// Get all hardware options
export async function getAllHardwareOptions() {
  const query = `SELECT * FROM hardware ORDER BY HardwareID`;
  const [rows] = await pool.query(query);
  return rows;
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

// Validate coupon for cart (using coupons_new table)
// Coupons apply only to BMR products that are NOT Low Margin or Package, lower 48 US.
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

    // Extract product IDs from cart (ProductID or productId)
    const productIds = (cartItems || [])
      .map((item) => item?.ProductID ?? item?.productId)
      .filter((id) => id != null && !isNaN(Number(id)));

    // Coupons apply only to BMR products that are NOT Low Margin or Package
    const couponEligible = await areAllProductsCouponEligible(productIds);
    if (!couponEligible) {
      return {
        valid: false,
        message:
          "This coupon only applies to BMR products that are not low margin or package items.",
      };
    }

    // Coupons require shipping to lower 48 US states
    if (shippingAddress) {
      const country =
        shippingAddress.country ||
        shippingAddress.Country ||
        "";
      const state =
        shippingAddress.state ||
        shippingAddress.State ||
        shippingAddress.stateProvince ||
        "";
      const isUS =
        country === "US" ||
        country === "United States" ||
        country === "USA";
      if (!isUS || !isLower48UsState(state)) {
        return {
          valid: false,
          message:
            "This coupon only applies to orders shipping to the lower 48 US states.",
        };
      }
    }

    // Calculate cart total
    const cartTotal = cartItems.reduce(
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

    // Calculate discount based on coupon type
    let discountAmount = 0;
    let freeShipping =
      coupon.free_shipping === 1 || coupon.free_shipping === true;

    const discountType = coupon.discount_type || "";
    const discountValue = parseFloat(coupon.discount_value || 0);

    console.log("Coupon discount calculation:", {
      code: coupon.code,
      discountType,
      discountValue,
      cartTotal,
      discount_value_from_db: coupon.discount_value,
      couponData: coupon,
    });

    if (discountValue > 0) {
      if (discountType === "percentage") {
        discountAmount = (cartTotal * discountValue) / 100;
        console.log(
          `Calculated ${discountValue}% discount: $${discountAmount} from cart total $${cartTotal}`,
        );

        // Apply maximum discount limit if set
        if (
          coupon.max_discount_amount &&
          discountAmount > parseFloat(coupon.max_discount_amount)
        ) {
          console.log(
            `Applying max discount limit: $${coupon.max_discount_amount}`,
          );
          discountAmount = parseFloat(coupon.max_discount_amount);
        }
      } else if (discountType === "fixed_amount") {
        discountAmount = discountValue;
        console.log(`Fixed amount discount: $${discountAmount}`);

        // Don't allow discount to exceed cart total
        if (discountAmount > cartTotal) {
          discountAmount = cartTotal;
        }
      }
    } else {
      console.error(
        `⚠️ Coupon ${coupon.code} has discount_value of 0.00. The discount will not be applied.`,
      );
      console.error(
        `Please run the fix script: scripts/fix-coupon-discount-values.sql`,
      );
      console.error(`Current coupon data:`, {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        name: coupon.name,
      });
    }

    // Handle free shipping discount type
    if (discountType === "free_shipping") {
      freeShipping = true;
    }

    console.log("Final discount amount being returned:", discountAmount);

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountAmount: discountAmount,
        freeShipping: freeShipping,
        discountValue: discountValue,
        discountType: discountType,
        shippingDiscount: parseFloat(coupon.shipping_discount || 0),
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

  // Build word matching conditions for relevance scoring
  const hasMultipleWords = words.length > 1;
  const wordConditions = hasMultipleWords
    ? words.map(() => "UPPER(p.ProductName) LIKE ?").join(" AND ")
    : "1=0"; // Never match if no words

  // Build WHERE clause word conditions
  const whereWordConditions = hasMultipleWords
    ? " " + words.map(() => "OR UPPER(p.ProductName) LIKE ?").join(" ")
    : "";

  // Build CASE statement for relevance scoring - use string concatenation to avoid template literal issues
  let relevanceCase = `
            -- Exact part number match (highest priority)
            WHEN UPPER(p.PartNumber) = ? THEN 1000
            -- Part number starts with query
            WHEN UPPER(p.PartNumber) LIKE ? THEN 800
            -- Part number contains query
            WHEN UPPER(p.PartNumber) LIKE ? THEN 600
            -- Exact product name match
            WHEN UPPER(p.ProductName) = ? THEN 500
            -- Product name starts with query
            WHEN UPPER(p.ProductName) LIKE ? THEN 400
            -- Product name contains query
            WHEN UPPER(p.ProductName) LIKE ? THEN 300`;

  if (hasMultipleWords) {
    relevanceCase +=
      `
            -- All words in product name
            WHEN ` +
      wordConditions +
      ` THEN 250`;
  }

  relevanceCase += `
            -- Description/Features contains query
            WHEN UPPER(p.Description) LIKE ? OR UPPER(p.Features) LIKE ? THEN 100
            ELSE 50`;

  // Enhanced products query with sophisticated relevance scoring
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
          -- Relevance scoring: higher score = better match
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
    `
      )
  `;

  // Build parameters array - only include word patterns if we have multiple words
  let productParams = [
    exactMatch, // for exact part number
    startsWith, // for part number starts with
    contains, // for part number contains
    exactMatch, // for exact product name
    startsWith, // for product name starts with
    contains, // for product name contains
    ...(hasMultipleWords ? wordPatterns : []), // for all words in product name (relevance) - only if multiple words
    contains, // for description
    contains, // for features
    // WHERE clause parameters
    contains, // PartNumber LIKE
    contains, // ProductName LIKE
    contains, // Description LIKE
    contains, // Features LIKE
    ...(hasMultipleWords ? wordPatterns : []), // Additional word patterns for WHERE - only if multiple words
  ];

  // If year is found, filter products where year falls within StartAppYear and EndAppYear
  if (searchYear) {
    productQuery += ` AND (? BETWEEN CAST(COALESCE(NULLIF(p.StartAppYear, ''), '0') AS UNSIGNED) AND CAST(COALESCE(NULLIF(p.EndAppYear, ''), '9999') AS UNSIGNED))`;
    productParams.push(searchYear);
  }

  // Enhanced ordering: prioritize part numbers if query looks like one, then by relevance
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
          b.BodyID AS PlatformBodyID,
          b.Name AS PlatformName,
          b.StartYear AS PlatformStartYear,
          b.EndYear AS PlatformEndYear,
          b.slug AS PlatformSlug,
          mc.MainCatSlug,
          ROW_NUMBER() OVER (
            PARTITION BY c.CatID
            ORDER BY
              CASE
                WHEN b.BodyID IS NULL THEN 2
                ELSE 1
              END,
              p.ProductID DESC
          ) AS row_num
        FROM categories c
        INNER JOIN products p ON FIND_IN_SET(c.CatID, p.CatID) > 0
        LEFT JOIN bodies b ON p.BodyID = b.BodyID
        LEFT JOIN maincategories mc ON c.MainCatID = mc.MainCatID
        WHERE p.Display = 1 AND p.EndProduct != 1 AND (
          UPPER(p.ProductName) LIKE ? OR UPPER(p.PartNumber) LIKE ? OR UPPER(p.Description) LIKE ? OR UPPER(p.Features) LIKE ?
        )
  `;
  let categoryParams = [contains, contains, contains, contains];

  // If year is found, also filter by year range
  if (searchYear) {
    categoryQuery += ` AND (? BETWEEN CAST(COALESCE(NULLIF(p.StartAppYear, ''), '0') AS UNSIGNED) AND CAST(COALESCE(NULLIF(p.EndAppYear, ''), '9999') AS UNSIGNED))`;
    categoryParams.push(searchYear);
  }

  categoryQuery += `
        ) AS ranked
      WHERE ranked.row_num = 1
      ORDER BY ranked.CatName
      LIMIT ?
  `;
  categoryParams.push(l.categories);

  const [categories] = await pool.query(categoryQuery, categoryParams);

  // platforms (bodies) - enhanced with better matching
  const [platforms] = await pool.query(
    `
      SELECT
        b.BodyID,
        b.Name,
        b.StartYear,
        b.EndYear,
        b.slug,
        (
          CASE
            WHEN UPPER(b.Name) = ? THEN 100
            WHEN UPPER(b.Name) LIKE ? THEN 80
            WHEN UPPER(b.Name) LIKE ? THEN 60
            WHEN CONCAT(b.StartYear, '-', b.EndYear) LIKE ? THEN 40
            ELSE 20
          END
        ) AS relevance_score
      FROM bodies b
      WHERE UPPER(b.Name) LIKE ?
        OR UPPER(b.slug) LIKE ?
        OR CONCAT(b.StartYear, '-', b.EndYear) LIKE ?
      ORDER BY
        relevance_score DESC,
        CASE WHEN UPPER(b.Name) LIKE ? THEN 1 ELSE 2 END,
        b.BodyOrder
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

  // vehicles - filter more strictly when year is specified
  // Include platform slug for linking to platform pages
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

  // If year is found, require exact match for that year range
  if (searchYear) {
    vehicleQuery += ` AND (? BETWEEN CAST(v.StartYear AS UNSIGNED) AND CAST(v.EndYear AS UNSIGNED))`;
    vehicleParams.push(searchYear);
  } else {
    // If no year, also match by year range string
    vehicleQuery += ` OR CONCAT(v.StartYear, '-', v.EndYear) LIKE ?`;
    vehicleParams.push(contains);
  }

  // Build ORDER BY clause
  const makeModelStarts = searchYear ? `${queryWithoutYear}%` : startsWith;
  let orderByClause = `
      ORDER BY
        CASE
          WHEN UPPER(v.Make) LIKE ? THEN 1
          WHEN UPPER(v.Model) LIKE ? THEN 2
          WHEN UPPER(CONCAT(v.Make, ' ', v.Model)) LIKE ? THEN 3
  `;
  vehicleParams.push(makeModelStarts, makeModelStarts, makeModelStarts);

  if (searchYear) {
    orderByClause += `          WHEN ? BETWEEN CAST(v.StartYear AS UNSIGNED) AND CAST(v.EndYear AS UNSIGNED) THEN 4`;
    vehicleParams.push(searchYear);
    orderByClause += `          ELSE 5`;
  } else {
    orderByClause += `          ELSE 4`;
  }

  orderByClause += `
        END,
        v.StartYear DESC
      LIMIT ?
  `;
  vehicleParams.push(l.vehicles);

  vehicleQuery += orderByClause;

  const [vehicles] = await pool.query(vehicleQuery, vehicleParams);

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
        shipping_country, shipping_method, subtotal, shipping_cost,
        tax, discount, total, coupon_code, coupon_id, payment_method, order_date,
        status, notes,
        cc_payment_token, cc_last_four, cc_type, cc_exp_month, cc_exp_year, cc_number, cc_ccv
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
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
        price, color, platform, year_range, image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertPromises = items.map(async (item) => {
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
    const query = `UPDATE customers SET ${updates.join(", ")} WHERE CustomerID = ?`;
    const [result] = await pool.query(query, values);

    return { updated: result.affectedRows > 0 };
  } catch (error) {
    console.error("Error updating customer profile:", error);
    throw error;
  }
}

// Admin: Get total customer count (same filters as getAllCustomersAdmin)
export async function getCustomersCountAdmin(search = null) {
  try {
    let sql = `SELECT COUNT(*) AS total FROM customers`;
    const params = [];

    if (search) {
      sql += ` WHERE email LIKE ? OR firstname LIKE ? OR lastname LIKE ?`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

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
) {
  try {
    let sql = `
      SELECT
        CustomerID, firstname, lastname, email, phonenumber,
        role, dealerTier, dealerDiscount, datecreated
      FROM customers
    `;
    const params = [];

    if (search) {
      sql += ` WHERE email LIKE ? OR firstname LIKE ? OR lastname LIKE ?`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const orderCol = CUSTOMERS_SORT_COLUMNS[sortColumn] || "datecreated";
    const orderDir = sortDirection === "desc" ? "DESC" : "ASC";
    sql += ` ORDER BY ${orderCol} ${orderDir} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
}

// Dealer tiers: get all tier configs (tier 1-8 with discount_percent)
export async function getDealerTiers() {
  try {
    const [rows] = await pool.query(
      "SELECT tier, discount_percent, updated_at FROM dealer_tiers ORDER BY tier ASC",
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

// Dealer tiers: upsert one tier's discount (admin)
export async function upsertDealerTier(tier, discountPercent) {
  try {
    await pool.query(
      `INSERT INTO dealer_tiers (tier, discount_percent)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE discount_percent = VALUES(discount_percent)`,
      [tier, discountPercent],
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
    for (const { tier, discount_percent } of tiers) {
      const t = parseInt(tier, 10);
      if (t >= 1 && t <= 8) {
        await upsertDealerTier(t, parseFloat(discount_percent));
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

// Admin: Get total product count (same filters as getAllProductsAdmin)
export async function getProductsCountAdmin(
  search = null,
  displayFilter = null,
) {
  try {
    let sql = `
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN bodies b ON p.BodyID = b.BodyID
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (p.ProductName LIKE ? OR p.PartNumber LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (displayFilter === "1") {
      sql += ` AND p.Display = 1`;
    } else if (displayFilter === "0") {
      sql += ` AND p.Display = 0`;
    }

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
) {
  try {
    const orderCol = SORT_COLUMNS[sortColumn] || "p.PartNumber";
    const orderDir = sortDirection === "desc" ? "DESC" : "ASC";

    let sql = `
      SELECT p.*, CONCAT(b.StartYear, '-', b.EndYear, ' ', b.Name) AS Platform
      FROM products p
      LEFT JOIN bodies b ON p.BodyID = b.BodyID
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (p.ProductName LIKE ? OR p.PartNumber LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (displayFilter === "1") {
      sql += ` AND p.Display = 1`;
    } else if (displayFilter === "0") {
      sql += ` AND p.Display = 0`;
    }

    sql += ` ORDER BY ${orderCol} ${orderDir} LIMIT ? OFFSET ?`;
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
        BodyID, CatID, ImageLarge, Features, Instructions, Blength, Bheight,
        Bwidth, Bweight, Color, Hardware, Grease, Images, NewPart, NewPartDate,
        PackagePartnumbers, FreeShipping, Display, PackagePartnumbersQty, Package,
        StartAppYear, EndAppYear, UsaMade, fproduct, CrossRef, ManID, LowMargin,
        mbox, flatrate, AngleFinder, endproduct, domhandling, hardwarepack,
        hardwarepacks, video, taxexempt, couponexempt, BlemProduct
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

// Admin: Get all bodies/platforms
export async function getAllBodiesAdmin() {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM bodies ORDER BY BodyID DESC
    `);
    return rows;
  } catch (error) {
    console.error("Error fetching bodies:", error);
    throw error;
  }
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
 * BMR product, NOT Low Margin, and NOT a Package. Lower 48 is enforced separately.
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
         AND COALESCE(p.Package, 0) = 0`,
      [ids],
    );
    const eligibleCount = rows?.[0]?.eligible_count ?? 0;
    return eligibleCount === ids.length;
  } catch (error) {
    console.error("Error in areAllProductsCouponEligible:", error);
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
