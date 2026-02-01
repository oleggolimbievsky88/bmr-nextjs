// lib/queries.js

import pool from "./db"; // Import MySQL connection pool
import Link from "next/link";

// Get all products
export async function getAllProducts() {
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE Display = "1" AND EndProduct != 1'
  );
  return rows;
}

// Get new products
export async function getNewProducts() {
  const [rows] = await pool.query(`
    SELECT * FROM bmrsuspension.products
    WHERE NewPartDate != "0" and NewPart = "1"
    ORDER BY NewPartDate desc
    LIMIT 8
  `);
  return rows;
}

//  Get products by platform ID
export async function getProductsByPlatformId(platformId) {
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE BodyID = ? AND Display = "1"',
    [platformId]
  );
  return rows;
}

// Get main categories (Suspension, Chassis, etc.)
export async function getMainCategories(platformSlug) {
  const query = `
    SELECT DISTINCT 
      m.MainCatID as id, 
      m.MainCatName as name,
      m.MainCatImage as image
    FROM maincategories m
    JOIN categories c ON c.MainCatID = m.MainCatID
    JOIN products p ON p.CatID = c.CatID
    JOIN bodies b ON p.BodyID = b.BodyID
    WHERE b.slug = ?
    AND p.Display = "1"
    ORDER BY m.MainCatName
  `;

  console.log("Main Categories Query:", query, [platformSlug]);
  const [rows] = await pool.query(query, [platformSlug]);
  console.log("Main Categories Result:", rows);
  return rows;
}

// Get categories by platform
export async function getCategoriesByPlatform(
  platformSlug,
  mainCategoryId = null
) {
  let query = `
    SELECT DISTINCT 
      c.CatID as id, 
      c.CatName as name, 
      c.CatImage as image,
      c.MainCatID as mainCategoryId
    FROM categories c
    JOIN products p ON p.CatID = c.CatID
    JOIN bodies b ON p.BodyID = b.BodyID
    WHERE b.slug = ?
    AND p.Display = "1"
    ORDER BY c.CatName
  `;

  const params = [platformSlug];

  if (mainCategoryId) {
    query += ` AND c.MainCatID = ?`;
    params.push(mainCategoryId);
  }

  console.log("Categories Query:", query, params);
  const [rows] = await pool.query(query, params);
  return rows;
}

// Get category by ID
export async function getCategoryById(catId) {
  const [rows] = await pool.query(
    `SELECT CatID, MainCatID, CatName, CatImage 
     FROM categories 
     WHERE CatID = ? 
     ORDER BY CatName`,
    [catId]
  );
  return rows;
}

// Get categories by main category ID
export async function getCategoriesByMainCat(mainCatId) {
  const [rows] = await pool.query(
    'SELECT * FROM categories WHERE MainCatID = ? AND ParentID = "0" ORDER BY CatName',
    [mainCatId]
  );
  return rows;
}

//Get categories by platform ID
export async function getCategories(platformId) {
  const [rows] = await pool.query(
    'SELECT * FROM categories WHERE MainCatID = #getmaincats.maincatid# AND ParentID = "0" ORDER BY CatName',
    [platformId]
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
    [platformId]
  );
  return rows;
}

// Get product by ID
export async function getProductById(id) {
  const [rows] = await pool.query(
    "SELECT * FROM products WHERE ProductID = ?",
    [id]
  );

  if (rows.length === 0) {
    throw new Error("Product not found");
  }

  return rows[0]; // Return the first product found
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
    [bodyCatId]
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
    [bodyId]
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
    [bodyId]
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
            [body.BodyID]
          );

          // Determine the year part of the slug
          const yearPart =
            body.StartYear === body.EndYear
              ? body.StartYear
              : `${body.StartYear}-${body.EndYear}`;

          // Create URL-friendly versions of the names
          const platformSlug = `${yearPart}-${body.Name.toLowerCase().replace(
            /\s+/g,
            "-"
          )}`;

          return {
            heading: `${body.StartYear} - ${body.EndYear} ${body.Name}`,
            slug: platformSlug,
            links: mainCategories.map((cat) => ({
              href: `/platform/${platformSlug}/${cat.MainCatName.toLowerCase().replace(
                /\s+/g,
                "-"
              )}`,
              text: cat.MainCatName,
            })),
          };
        })
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

export async function getPlatformCategories(platformName) {
  // Split the platformName to get year range and actual name
  const matches = platformName.match(/^(\d{4}-\d{4})-(.+)$/);
  let yearRange, name;

  if (matches) {
    [, yearRange, name] = matches;
  } else {
    name = platformName;
  }

  const [rows] = await pool.query(
    `
    SELECT DISTINCT c.CatID as id, c.CatName as name 
    FROM categories c
    JOIN products p ON c.CatID = p.CatID
    JOIN bodies b ON p.BodyID = b.BodyID
    WHERE b.slug = ?
    ${yearRange ? "AND b.StartYear = ? AND b.EndYear = ?" : ""}
    AND p.Display = "1"
  `,
    yearRange ? [name, ...yearRange.split("-")] : [name]
  );

  return rows;
}

export async function getFilteredProducts(platformName, categoryId = null) {
  // Split the platformName to get year range and actual name
  const matches = platformName.match(/^(\d{4}-\d{4})-(.+)$/);
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
    query += ` AND p.CatID = ?`;
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

// Get platform by slug
export async function getPlatformBySlug(slug) {
  const query = `
    SELECT 
      BodyID as id,
      Name as name,
      StartYear as startYear,
      EndYear as endYear,
      Image as image,
      HeaderImage as headerImage,
      slug
    FROM bodies
    WHERE slug = ?
  `;

  const [rows] = await pool.query(query, [slug]);
  return rows[0];
}

// Dealer tiers: discount percent and flat rate shipping (lower 48)
const DEALER_TIERS_TABLE = 'dealer_tiers';

/**
 * Get all dealer tiers ordered by tier number.
 * Returns [] if table does not exist yet.
 * @returns {Promise<Array<{ id, tier, name, discount_percent, flat_rate_shipping, sort_order }>>}
 */
export async function getDealerTiers() {
  try {
    const [rows] = await pool.query(
      `SELECT id, tier, name, discount_percent, flat_rate_shipping, sort_order
       FROM ${DEALER_TIERS_TABLE}
       ORDER BY tier ASC`
    );
    return rows || [];
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') return [];
    throw err;
  }
}

/**
 * Get one dealer tier by id.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export async function getDealerTierById(id) {
  const [rows] = await pool.query(
    `SELECT id, tier, name, discount_percent, flat_rate_shipping, sort_order
     FROM ${DEALER_TIERS_TABLE}
     WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Update a dealer tier (discount_percent, flat_rate_shipping, name).
 * @param {number} id
 * @param {{ name?: string, discount_percent?: number, flat_rate_shipping?: number }} data
 * @returns {Promise<boolean>}
 */
export async function updateDealerTier(id, data) {
  const updates = [];
  const values = [];
  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.discount_percent !== undefined) {
    updates.push('discount_percent = ?');
    values.push(Number(data.discount_percent));
  }
  if (data.flat_rate_shipping !== undefined) {
    updates.push('flat_rate_shipping = ?');
    values.push(Number(data.flat_rate_shipping));
  }
  if (updates.length === 0) return true;
  values.push(id);
  const [result] = await pool.query(
    `UPDATE ${DEALER_TIERS_TABLE} SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

/**
 * Get flat rate shipping for a given tier (e.g. for checkout).
 * Tier 1 and 2 use flat_rate_shipping from DB; Tier 3+ use 0 (full UPS).
 * @param {number} tier - 1, 2, or 3
 * @returns {Promise<number>}
 */
export async function getDealerFlatRateForTier(tier) {
  const tiers = await getDealerTiers();
  const row = tiers.find((t) => Number(t.tier) === Number(tier));
  return row ? Number(row.flat_rate_shipping) : 0;
}
