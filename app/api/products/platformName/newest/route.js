// app/api/products/[platformName]/newest/route.js
import { getNewestProductsByPlatform } from '@/lib/queries';  // Update with your DB module

export async function GET(req, { params }) {
  const { platformName } = params;

  try {
    const products = await getNewestProductsByPlatform(platformName);  // Fetch newest products from your DB
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

