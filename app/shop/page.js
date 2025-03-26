import ShopSidebarleft from "@/components/shop/ShopSidebarleft";
import { mcp_MySQL_MCP_query } from "@/lib/db";

export const metadata = {
  title: "Shop - Your Store Name",
  description: "Browse our collection of high-quality products",
};

async function getData() {
  try {
    // Get all products with their relationships
    const productsQuery = `
      SELECT p.*, m.ManName as BrandName, b.Name as PlatformName
      FROM products p
      LEFT JOIN mans m ON p.ManID = m.ManID
      LEFT JOIN bodies b ON p.BodyID = b.BodyID
      WHERE p.Display = ?
      ORDER BY p.ProductID DESC
    `;

    // Get all categories with their main categories
    const categoriesQuery = `
      SELECT c.*, mc.MainCatName
      FROM categories c
      LEFT JOIN maincategories mc ON c.MainCatID = mc.MainCatID
      ORDER BY c.CatName
    `;

    // Get all brands
    const brandsQuery = `SELECT * FROM mans ORDER BY ManName`;

    // Get all platforms
    const platformsQuery = `SELECT * FROM bodies ORDER BY Name`;

    // Fetch all required data in parallel
    const [products, categories, brands, platforms] = await Promise.all([
      mcp_MySQL_MCP_query(productsQuery, [1]), // 1 for Display = true
      mcp_MySQL_MCP_query(categoriesQuery),
      mcp_MySQL_MCP_query(brandsQuery),
      mcp_MySQL_MCP_query(platformsQuery),
    ]);

    return {
      products: products || [],
      categories: categories || [],
      brands: brands || [],
      platforms: platforms || [],
    };
  } catch (error) {
    console.error("Error fetching shop data:", error);
    return {
      products: [],
      categories: [],
      brands: [],
      platforms: [],
    };
  }
}

export default async function ShopPage() {
  const data = await getData();

  return (
    <ShopSidebarleft
      initialProducts={data.products}
      categories={data.categories}
      brands={data.brands}
      platforms={data.platforms}
    />
  );
}
