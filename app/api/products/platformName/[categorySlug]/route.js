// app/api/products/[platformName]/[categorySlug]/route.js
import { getProductsByCategory } from '@/lib/queries'; 

export async function GET(req, { params }) {
  const { platformName, categorySlug } = params;

  try {
    const products = await getProductsByCategory(platformName, categorySlug);  // Fetch products for this category
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
