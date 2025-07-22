// lib/queries.js

import pool from "./db"; // Import MySQL connection pool
import Link from "next/link";
import mysql from "mysql2/promise";

// Get all products
export async function getAllProducts() {
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE Display = "1" AND EndProduct != 1'
  );
  return rows;
}

// Get menu data with all bodies grouped by category
export async function getMenuData() {
  try {
    // Get all bodies grouped by body category
    const query = `
			SELECT b.BodyID, b.Name, b.StartYear, b.EndYear, b.BodyOrder, b.slug,
			       bc.BodyCatID, bc.BodyCatName, bc.Position
			FROM bodies b
			JOIN bodycats bc ON b.BodyCatID = bc.BodyCatID
			ORDER BY bc.Position, b.BodyOrder
		`;

    const [bodies] = await pool.query(query);

    // Group by categories
    const fordBodies = bodies.filter((body) =>
      body.BodyCatName.includes("Ford")
    );
    const gmLateBodies = bodies.filter((body) =>
      body.BodyCatName.includes("GM Late Model")
    );
    const gmMidMuscle = bodies.filter((body) =>
      body.BodyCatName.includes("GM Mid Muscle")
    );
    const gmClassicMuscle = bodies.filter((body) =>
      body.BodyCatName.includes("GM Classic Muscle")
    );
    const moparBodies = bodies.filter((body) =>
      body.BodyCatName.includes("Mopar")
    );

    // Helper to build platform slug
    function getPlatformSlug(body) {
      return (
        body.slug ||
        `${body.Name.toLowerCase().replace(/\s+/g, "-")}-${body.StartYear}-${
          body.EndYear
        }`
      );
    }

    // Helper to fetch main categories and their categories for a body
    async function getMainCatsWithCategories(bodyId, platformSlug) {
      const mainCategoriesQuery = `
				SELECT MainCatID, MainCatName, MainCatSlug, MainCatImage
				FROM maincategories
				WHERE BodyID = ?
				ORDER BY MainCatName
			`;
      const [mainCategories] = await pool.query(mainCategoriesQuery, [bodyId]);

      const result = [];
      for (const mainCat of mainCategories) {
        const categoriesQuery = `
					SELECT c.CatID, c.CatName, c.CatNameSlug, COUNT(p.ProductID) as productCount
					FROM categories c
					LEFT JOIN products p ON FIND_IN_SET(c.CatID, p.CatID) AND p.BodyID = ? AND p.Display = 1
					WHERE c.MainCatID = ?
					GROUP BY c.CatID, c.CatName, c.CatNameSlug
					HAVING COUNT(p.ProductID) > 0
					ORDER BY c.CatName
				`;
        const [categories] = await pool.query(categoriesQuery, [
          bodyId,
          mainCat.MainCatID,
        ]);
        const cats = categories.map((cat) => ({
          id: cat.CatID,
          name: cat.CatName,
          slug: cat.CatNameSlug,
          link: `/products/${platformSlug}/${mainCat.MainCatSlug}/${cat.CatNameSlug}`,
          productCount: cat.productCount || 0,
        }));
        if (cats.length > 0) {
          result.push({
            id: mainCat.MainCatID,
            name: mainCat.MainCatName,
            slug: mainCat.MainCatSlug,
            image: mainCat.MainCatImage,
            categories: cats,
          });
        }
      }
      return result;
    }

    async function buildMenuLinks(bodies) {
      return await Promise.all(
        bodies.map(async (body) => {
          const platformSlug = getPlatformSlug(body);
          const mainCategories = await getMainCatsWithCategories(
            body.BodyID,
            platformSlug
          );
          return {
            heading: `${body.StartYear} - ${body.EndYear} ${body.Name}`,
            slug: platformSlug,
            bodyId: body.BodyID,
            mainCategories, // [{name, slug, categories: [{name, slug, link}]}]
          };
        })
      );
    }

    const menuData = {
      fordLinks: await buildMenuLinks(fordBodies),
      gmLateModelLinks: await buildMenuLinks(gmLateBodies),
      gmMidMuscleLinks: await buildMenuLinks(gmMidMuscle),
      gmClassicMuscleLinks: await buildMenuLinks(gmClassicMuscle),
      moparLinks: await buildMenuLinks(moparBodies),
    };

    return menuData;
  } catch (error) {
    console.error("Failed to fetch menu data:", error);
    throw error;
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
                0
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

// Get new products
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
    FROM bmrsuspension.products p
    JOIN bmrsuspension.bodies b ON p.BodyID = b.BodyID
    LEFT JOIN bmrsuspension.categories c ON p.CatID = c.CatID
    WHERE p.Display = 1 AND NewPartDate != "0" AND (NewPart = 0 OR p.BlemProduct = ?) AND p.BlemProduct = ?
    ORDER BY NewPartDate desc
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
  mainCategory = null
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
      CONCAT('https://bmrsuspension.com/siteart/header/', ?) as headerImage,
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
    platforms[0].HeaderImage,
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
    headerImage: `https://bmrsuspension.com/siteart/header/${platforms[0].HeaderImage}`,
    name: platforms[0].Name,
    startYear: platforms[0].StartYear,
    endYear: platforms[0].EndYear,
    image: platforms[0].Image,
    slug: platforms[0].slug,
  };

  console.log("Platform Info:", platformInfo); // Debug log

  // Remove platform info from individual category rows
  const categories = rows.map(
    ({ headerImage, platformName, startYear, endYear, ...category }) => category
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
    [catId]
  );
  return rows;
}

// Get categories by main category ID
export async function getCategoriesByMainCat(mainCatId) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  const [rows] = await connection.execute(
    "SELECT CatID, CatName, CatImage FROM categories WHERE MainCatID = ?",
    [mainCatId]
  );
  await connection.end();
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
export async function getProductById(productId) {
  const [rows] = await pool.query(
    `SELECT
      p.*,
      CONCAT(b.StartYear, '-', b.EndYear) AS YearRange,
      b.Name AS PlatformName
    FROM products p
    JOIN bodies b ON p.BodyID = b.BodyID
    WHERE p.ProductID = ?
    AND p.Display = '1'
    AND p.EndProduct != '1'`,
    [productId]
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
              href: `/products/${platformSlug}/${cat.MainCatName.toLowerCase().replace(
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
      Image as platformImage,
      HeaderImage as headerImage,
      slug
    FROM bodies
    WHERE slug = ?
  `;

  const [rows] = await pool.query(query, [slug]);

  if (rows.length === 0) {
    console.error("❌ No platform found for slug:", slug);
    return null;
  }

  // Add the base URL to the header image
  const platform = rows[0];
  if (platform.headerImage) {
    platform.headerImage = `https://bmrsuspension.com/siteart/header/${platform.headerImage}`;
  }

  console.log("✅ Query Result:", platform); // Debugging log
  return platform;
}

/**
 * Fetch a platform (body) by its ID.
 * @param {number|string} id - The platform's BodyID.
 * @returns {Promise<Object|null>} The platform object or null if not found.
 */
export async function getPlatformById(id) {
  const [rows] = await pool.query("SELECT * FROM bodies WHERE BodyID = ?", [
    id,
  ]);
  return rows.length > 0 ? rows[0] : null;
}

// Get main category by ID
export async function getMainCategoryById(mainCategoryId) {
  const [rows] = await pool.query(
    "SELECT * FROM maincategories WHERE MainCatID = ?",
    [mainCategoryId]
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
    [mainCategoryId]
  );
  return rows;
}

// Get products by main category and platform
export async function getProductsByMainCategory(
  platformSlug,
  mainCategory,
  limit = null
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

export async function getProductsByPlatformAndMainCat(platformId, mainCatId) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  const [rows] = await connection.execute(
    "SELECT * FROM products WHERE BodyID = ? AND MainCatID = ?",
    [platformId, mainCatId]
  );
  await connection.end();
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
  mainCategory
) {
  // You may need to join products and categories tables
  // Example SQL (adjust as needed for your schema):
  // SELECT * FROM products WHERE Display=1 AND MainCatID=? AND BodyID=?
  const products = await pool.query(
    "SELECT * FROM products WHERE Display=1 AND EndProduct=0 AND MainCatID=? AND BodyID=? ORDER BY NewPartDate DESC LIMIT 8",
    [mainCategory, platform]
  );
  return products;
}

export async function getCategoriesByMainCatId(mainCatId) {
  const [rows] = await pool.query(
    "SELECT * FROM categories WHERE MainCatID = ?",
    [mainCatId]
  );
  return rows;
}

export async function getMainCategoryIdBySlugAndPlatform(
  platformSlug,
  mainCategorySlug
) {
  const query = `
		SELECT mc.MainCatID
		FROM maincategories mc
		JOIN bodies b ON mc.BodyID = b.BodyID
		WHERE b.slug = ?
		AND LOWER(REPLACE(mc.MainCatSlug, ' ', '-')) = ?
		LIMIT 1
	`;
  const [rows] = await pool.query(query, [
    platformSlug,
    mainCategorySlug.toLowerCase(),
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
  mainCatId
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

  if (platformId) {
    where.push("p.BodyID = ?");
    params.push(platformId);
  }
  if (mainCategoryId) {
    where.push("c.MainCatID = ?");
    params.push(mainCategoryId);
  }
  if (categoryId) {
    where.push("c.CatID = ?");
    params.push(categoryId);
  }
  if (colors.length) {
    where.push(
      "(" + colors.map(() => "FIND_IN_SET(?, p.Color)").join(" OR ") + ")"
    );
    params.push(...colors);
  }
  if (brands.length) {
    where.push("(" + brands.map(() => "p.Brand = ?").join(" OR ") + ")");
    params.push(...brands);
  }

  const whereClause = where.length ? "WHERE " + where.join(" AND ") : "";
  const sql = `
    SELECT p.*
    FROM products p
    JOIN categories c ON FIND_IN_SET(c.CatID, p.CatID)
    ${whereClause}
    GROUP BY p.ProductID
    ORDER BY p.ProductID DESC
    LIMIT ? OFFSET ?
  `;
  params.push(Number(limit), Number(offset));

  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function getCategoryIdBySlugAndMainCat(
  mainCategoryId,
  categorySlug
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
  const [rows] = await pool.query(query);
  console.log("Fetched colors:", rows);
  return rows;
}
