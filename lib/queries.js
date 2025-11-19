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
    WHERE p.Display = 1 AND p.EndProduct = 0 AND p.NewPartDate != "0" AND (p.NewPart = 0 OR p.BlemProduct = ?) AND p.BlemProduct = ?
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
    ({ platformName, startYear, endYear, ...category }) => category
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
    "SELECT CatID, CatName, CatImage FROM categories WHERE MainCatID = ?",
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
    [productId]
  );

  if (rows.length === 0) {
    throw new Error("Product not found");
  }

  const product = rows[0];

  // Helper function to parse the Images field and create small/large image pairs
  const parseImages = (imagesString) => {
    if (!imagesString || imagesString === "0" || imagesString.trim() === "") {
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
            "_small.$1"
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

  // We're using local platform header images, so no need to construct external URLs
  const platform = rows[0];

  console.log("✅ Query Result:", platform); // Debugging log
  return platform;
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
    [platformId, mainCatId]
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
    `SELECT c.*,
     COUNT(DISTINCT CASE WHEN FIND_IN_SET(c.CatID, p.CatID) AND p.Display = 1 AND p.EndProduct != 1 THEN p.ProductID END) as productCount
     FROM categories c
     LEFT JOIN products p ON FIND_IN_SET(c.CatID, p.CatID)
     WHERE c.MainCatID = ?
     GROUP BY c.CatID, c.CatName, c.CatSlug, c.CatImage, c.MainCatID
     ORDER BY c.CatName`,
    [mainCatId]
  );
  return rows;
}

export async function getMainCategoryIdBySlugAndPlatform(
  platformSlug,
  mainCategorySlug
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
  console.log("Colors query:", query);
  const [rows] = await pool.query(query);
  console.log("Colors query result:", rows);
  return rows;
}

// Get category by slug within platform/mainCategory context
export async function getCategoryBySlugAndPlatform(
  platformId,
  mainCategoryId,
  categorySlug
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
  mainCategoryId = null
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
export async function validateCouponForCart(
  couponCode,
  cartItems,
  customerId = null
) {
  try {
    const coupon = await getCouponByCode(couponCode);

    if (!coupon) {
      return {
        valid: false,
        message: "Invalid or expired coupon code",
      };
    }

    // Calculate cart total
    const cartTotal = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.Price || 0) * (item.quantity || 1),
      0
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

    if (discountValue > 0) {
      if (discountType === "percentage") {
        discountAmount = (cartTotal * discountValue) / 100;

        // Apply maximum discount limit if set
        if (
          coupon.max_discount_amount &&
          discountAmount > parseFloat(coupon.max_discount_amount)
        ) {
          discountAmount = parseFloat(coupon.max_discount_amount);
        }
      } else if (discountType === "fixed_amount") {
        discountAmount = discountValue;

        // Don't allow discount to exceed cart total
        if (discountAmount > cartTotal) {
          discountAmount = cartTotal;
        }
      }
    }

    // Handle free shipping discount type
    if (discountType === "free_shipping") {
      freeShipping = true;
    }

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
  cartTotal = 0
) {
  try {
    // Update coupon usage count in coupons_new
    await pool.query(
      "UPDATE coupons_new SET times_used = times_used + 1 WHERE id = ?",
      [couponId]
    );

    // Record in coupon_usage table
    await pool.query(
      `
      INSERT INTO coupon_usage
      (coupon_id, customer_id, order_id, discount_amount, cart_total)
      VALUES (?, ?, ?, ?, ?)
    `,
      [couponId, customerId, invoiceId, discountAmount, cartTotal]
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
export async function searchAllQuick(searchQuery, limits = {}) {
  const q = (searchQuery || "").trim();
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
    products: Number(limits.products || 6),
    categories: Number(limits.categories || 5),
    platforms: Number(limits.platforms || 5),
    vehicles: Number(limits.vehicles || 5),
    brands: Number(limits.brands || 5),
    pages: Number(limits.pages || 5),
  };

  const like = `%${q}%`;
  const starts = `${q}%`;

  // Extract year from query if present
  const yearMatch = q.match(/\b(19|20)\d{2}\b/);
  const searchYear = yearMatch ? parseInt(yearMatch[0]) : null;

  // Extract make/model from query (remove year if present)
  const queryWithoutYear = yearMatch ? q.replace(yearMatch[0], "").trim() : q;
  const makeModelLike = `%${queryWithoutYear}%`;

  // products - filter by year range if year is in query
  let productQuery = `
      SELECT p.ProductID, p.ProductName, p.PartNumber, p.Price, p.ImageSmall,
             p.BodyID, b.Name AS PlatformName, b.StartYear AS PlatformStartYear, b.EndYear AS PlatformEndYear
      FROM products p
      LEFT JOIN bodies b ON p.BodyID = b.BodyID
      WHERE p.Display = 1 AND p.EndProduct != 1 AND (
        p.ProductName LIKE ? OR p.PartNumber LIKE ? OR p.Description LIKE ? OR p.Features LIKE ?
      )
  `;
  let productParams = [like, like, like, like];

  // If year is found, filter products where year falls within StartAppYear and EndAppYear
  if (searchYear) {
    productQuery += ` AND (? BETWEEN CAST(COALESCE(NULLIF(p.StartAppYear, ''), '0') AS UNSIGNED) AND CAST(COALESCE(NULLIF(p.EndAppYear, ''), '9999') AS UNSIGNED))`;
    productParams.push(searchYear);
  }

  productQuery += `
      ORDER BY
        CASE WHEN p.ProductName LIKE ? THEN 1 WHEN p.PartNumber LIKE ? THEN 2 ELSE 3 END,
        p.ProductID DESC
      LIMIT ?
  `;
  productParams.push(starts, starts, l.products);

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
          p.ProductName LIKE ? OR p.PartNumber LIKE ? OR p.Description LIKE ? OR p.Features LIKE ?
        )
  `;
  let categoryParams = [like, like, like, like];

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

  // platforms (bodies)
  const [platforms] = await pool.query(
    `
      SELECT b.BodyID, b.Name, b.StartYear, b.EndYear, b.slug
      FROM bodies b
      WHERE b.Name LIKE ? OR CONCAT(b.StartYear, '-', b.EndYear) LIKE ?
      ORDER BY CASE WHEN b.Name LIKE ? THEN 1 ELSE 2 END, b.BodyOrder
      LIMIT ?
    `,
    [like, like, starts, l.platforms]
  );

  // vehicles - filter more strictly when year is specified
  let vehicleQuery = `
      SELECT VehicleID, Make, Model, StartYear, EndYear, BodyID
      FROM vehicles
      WHERE (Make LIKE ? OR Model LIKE ? OR CONCAT(Make, ' ', Model) LIKE ?)
  `;
  let vehicleParams = [makeModelLike, makeModelLike, makeModelLike];

  // If year is found, require exact match for that year range
  if (searchYear) {
    vehicleQuery += ` AND (? BETWEEN CAST(StartYear AS UNSIGNED) AND CAST(EndYear AS UNSIGNED))`;
    vehicleParams.push(searchYear);
  } else {
    // If no year, also match by year range string
    vehicleQuery += ` OR CONCAT(StartYear, '-', EndYear) LIKE ?`;
    vehicleParams.push(like);
  }

  // Build ORDER BY clause
  const makeModelStarts = searchYear ? `${queryWithoutYear}%` : starts;
  let orderByClause = `
      ORDER BY
        CASE
          WHEN Make LIKE ? THEN 1
          WHEN Model LIKE ? THEN 2
          WHEN CONCAT(Make, ' ', Model) LIKE ? THEN 3
  `;
  vehicleParams.push(makeModelStarts, makeModelStarts, makeModelStarts);

  if (searchYear) {
    orderByClause += `          WHEN ? BETWEEN CAST(StartYear AS UNSIGNED) AND CAST(EndYear AS UNSIGNED) THEN 4`;
    vehicleParams.push(searchYear);
    orderByClause += `          ELSE 5`;
  } else {
    orderByClause += `          ELSE 4`;
  }

  orderByClause += `
        END,
        StartYear DESC
      LIMIT ?
  `;
  vehicleParams.push(l.vehicles);

  vehicleQuery += orderByClause;

  const [vehicles] = await pool.query(vehicleQuery, vehicleParams);

  // brands
  const [brands] = await pool.query(
    `
      SELECT ManID, ManName
      FROM mans
      WHERE ManName LIKE ?
      ORDER BY CASE WHEN ManName LIKE ? THEN 1 ELSE 2 END, ManName
      LIMIT ?
    `,
    [like, starts, l.brands]
  );

  // pages (metatags table)
  const [pages] = await pool.query(
    `
      SELECT MetaTagID, Page, Title
      FROM metatags
      WHERE Page LIKE ? OR Title LIKE ?
      ORDER BY CASE WHEN Title LIKE ? THEN 1 ELSE 2 END, MetaTagID DESC
      LIMIT ?
    `,
    [like, like, starts, l.pages]
  );

  return { products, categories, platforms, vehicles, brands, pages };
}
