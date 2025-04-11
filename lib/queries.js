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

    // Create the menu data structure
    const menuData = {
      fordLinks: fordBodies.map((body) => ({
        heading: `${body.StartYear} - ${body.EndYear} ${body.Name}`,
        slug:
          body.slug ||
          `${body.Name.toLowerCase().replace(/\s+/g, "-")}-${body.StartYear}-${
            body.EndYear
          }`,
        bodyId: body.BodyID,
        links: [], // Links will be populated by the frontend as needed
      })),

      gmLateModelLinks: gmLateBodies.map((body) => ({
        heading: `${body.StartYear} - ${body.EndYear} ${body.Name}`,
        slug:
          body.slug ||
          `${body.Name.toLowerCase().replace(/\s+/g, "-")}-${body.StartYear}-${
            body.EndYear
          }`,
        bodyId: body.BodyID,
        links: [],
      })),

      gmMidMuscleLinks: gmMidMuscle.map((body) => ({
        heading: `${body.StartYear} - ${body.EndYear} ${body.Name}`,
        slug:
          body.slug ||
          `${body.Name.toLowerCase().replace(/\s+/g, "-")}-${body.StartYear}-${
            body.EndYear
          }`,
        bodyId: body.BodyID,
        links: [],
      })),

      gmClassicMuscleLinks: gmClassicMuscle.map((body) => ({
        heading: `${body.StartYear} - ${body.EndYear} ${body.Name}`,
        slug:
          body.slug ||
          `${body.Name.toLowerCase().replace(/\s+/g, "-")}-${body.StartYear}-${
            body.EndYear
          }`,
        bodyId: body.BodyID,
        links: [],
      })),

      moparLinks: moparBodies.map((body) => ({
        heading: `${body.StartYear} - ${body.EndYear} ${body.Name}`,
        slug:
          body.slug ||
          `${body.Name.toLowerCase().replace(/\s+/g, "-")}-${body.StartYear}-${
            body.EndYear
          }`,
        bodyId: body.BodyID,
        links: [],
      })),
    };

    // For demonstration, simulate some links for each vehicle/body
    const categories = [
      "Suspension",
      "Chassis",
      "Bushing Kits",
      "Safety Equipment",
    ];

    // Add sample links to each body
    Object.keys(menuData).forEach((key) => {
      menuData[key].forEach((item) => {
        // Add simulated links for testing until we have the real links
        item.links = categories.flatMap((cat) => [
          {
            text: `${cat} Overview`,
            href: `/products/${item.slug}/${cat
              .toLowerCase()
              .replace(/\s+/g, "-")}`,
          },
          {
            text: `${cat} Kits`,
            href: `/products/${item.slug}/${cat
              .toLowerCase()
              .replace(/\s+/g, "-")}/kits`,
          },
        ]);
      });
    });

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
      SELECT BodyID, Name, StartYear, EndYear, Image, HeaderImage, BodyCatID
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
      SELECT MainCatID, MainCatName, MainCatImage
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
          SELECT c.CatID, c.CatName, c.MainCatID, COUNT(p.ProductID) as productCount
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
            },
            subCategories: formattedSubCategories,
          });
        }
      }
    } else {
      // If no main categories, try to get general categories for this body
      const generalCategoriesQuery = `
        SELECT c.CatID, c.CatName, COUNT(p.ProductID) as productCount
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
  mainCategory = null
) {
  // First get the BodyID from the platform slug
  const platformQuery = `
    SELECT BodyID, Name, StartYear, EndYear, HeaderImage, Image
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
    query += ` AND m.MainCatName = ?`;
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
  const [rows] = await pool.query(
    'SELECT * FROM categories WHERE MainCatID = ? AND ParentID = "0" ORDER BY CatName',
    [mainCatId]
  );
  return rows;
}

// Get categories
export async function getCategories() {
  try {
    const query = `
      SELECT c.*, mc.MainCatName
      FROM categories c
      LEFT JOIN maincategories mc ON c.MainCatID = mc.MainCatID
      WHERE c.ParentID = "0"
      ORDER BY c.CatName
    `;
    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
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
      b.Name as platformName
    FROM products p
    JOIN bodies b ON p.BodyID = b.BodyID
    JOIN categories c ON p.CatID = c.CatID
    JOIN maincategories m ON c.MainCatID = m.MainCatID
    WHERE b.slug = ?
    AND m.MainCatName = ?
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

// Query to filter products based on criteria
export async function getFilteredProducts(filters) {
  const { categoryId, brandId, platformId, minPrice, maxPrice } = filters;

  let query = `
    SELECT p.*, m.ManName as BrandName, b.Name as PlatformName
    FROM products p
    LEFT JOIN mans m ON p.ManID = m.ManID
    LEFT JOIN bodies b ON p.BodyID = b.BodyID
    WHERE p.Display = 1
  `;

  const params = [];

  if (categoryId) {
    query += ` AND FIND_IN_SET(?, p.CatID)`;
    params.push(categoryId);
  }
  if (brandId) {
    query += ` AND p.ManID = ?`;
    params.push(brandId);
  }
  if (platformId) {
    query += ` AND p.BodyID = ?`;
    params.push(platformId);
  }
  if (minPrice) {
    query += ` AND CAST(p.Price AS DECIMAL) >= ?`;
    params.push(minPrice);
  }
  if (maxPrice) {
    query += ` AND CAST(p.Price AS DECIMAL) <= ?`;
    params.push(maxPrice);
  }

  query += ` ORDER BY p.ProductID DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
}

export async function getPlatformById(id) {
  const [platform] = await pool.query("SELECT * FROM bodies WHERE BodyID = ?", [
    id,
  ]);
  return platform[0];
}

export async function getProductTypes() {
  const categories = await pool.query(
    "SELECT * FROM categories ORDER BY CatName ASC"
  );
  return categories[0];
}

export async function getProducts(platform, mainCategory, category = null) {
  // Format the parameters to match database values
  const formattedMainCategory = mainCategory
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  let formattedCategory = null;
  if (category) {
    formattedCategory = category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  let sql = `
    SELECT p.*, m.ManName as brandName, c.CatName as categoryName
    FROM products p
    LEFT JOIN mans m ON p.ManID = m.ManID
    LEFT JOIN categories c ON FIND_IN_SET(c.CatID, p.CatID)
    WHERE p.BodyID = (SELECT BodyID FROM bodies WHERE slug = ?)
    AND p.CatID IN (
      SELECT CatID FROM categories
      WHERE MainCatID = (
        SELECT MainCatID FROM maincategories
        WHERE MainCatName = ? AND BodyID = (SELECT BodyID FROM bodies WHERE slug = ?)
      )
    )
  `;

  const params = [platform, formattedMainCategory, platform];

  if (formattedCategory) {
    sql += ` AND p.CatID IN (SELECT CatID FROM categories WHERE CatName = ?)`;
    params.push(formattedCategory);
  }

  sql += ` AND p.Display = 1 ORDER BY p.ProductName ASC`;

  console.log("Query:", sql);
  console.log("Params:", params);

  const [products] = await pool.query(sql, params);
  return products;
}

// Get all brands (manufacturers)
export async function getBrands() {
  try {
    const query = `
      SELECT ManID as id, ManName as name
      FROM mans
      ORDER BY ManName
    `;

    const [brands] = await pool.query(query);
    return brands;
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

// Get all platforms (bodies)
export async function getPlatforms() {
  try {
    const query = `
      SELECT
        b.BodyID as id,
        b.Name as name,
        b.StartYear as startYear,
        b.EndYear as endYear,
        b.slug,
        bc.BodyCatName as category
      FROM bodies b
      JOIN bodycats bc ON b.BodyCatID = bc.BodyCatID
      ORDER BY bc.Position, b.BodyOrder
    `;

    const [platforms] = await pool.query(query);
    return platforms;
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return [];
  }
}
