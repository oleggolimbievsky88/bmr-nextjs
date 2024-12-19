// lib/queries.js

import pool from "./db"; // Import MySQL connection pool

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

// Get main categories
export async function getMainCategories(mainCatId) {
  const [rows] = await pool.query(
    "SELECT * FROM maincategories WHERE MainCatID = ?",
    [mainCatId]
  );
  return rows;
}

// Get categories by catId
export async function getCategoriesByCatId(catId) {
  const [rows] = await pool.query(
    `SELECT CatID, MainCatID, CatName, CatImage 
     FROM categories 
     WHERE CatID = ? 
     ORDER BY CatName`,
    [catId]
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

          return {
            heading: `${body.StartYear} - ${body.EndYear} ${body.Name}`,
            links: mainCategories.map((cat) => ({
              href: `/platform/${body.Name.toLowerCase().replace(
                /\s+/g,
                "-"
              )}/${cat.MainCatName.toLowerCase().replace(/\s+/g, "-")}`,
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
    }

    return menuStructure;
  } catch (error) {
    console.error("Error fetching menu structure:", error);
    // Return a default structure if there's an error
    return {
      fordLinks: [],
      moparLinks: [],
      gmLateModelLinks: [],
      gmMidMuscleLinks: [],
      gmClassicMuscleLinks: [],
    };
  }
}
