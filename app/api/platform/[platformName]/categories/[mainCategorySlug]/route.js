// /app/api/platform/[platformName]/categories/[mainCategorySlug]/route.js
import { NextResponse } from 'next/server';
import { fetchPlatformByName, getCategoriesByPlatformId, getProductsByCategoryAndPlatform } from '@/lib/queries';

export async function GET(request, { params }) {
  const { platformName, mainCategorySlug } = params;

  try {
    // Fetch platform to get BodyID
    const platform = await fetchPlatformByName(platformName);
    const platformId = platform.BodyID;

    // Fetch all categories for the platform
    const categories = await getCategoriesByPlatformId(platformId);

    // Find the category matching the slug
    const category = categories.find(
      (cat) => cat.CatName.toLowerCase() === mainCategorySlug.toLowerCase()
    );

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Fetch products for the category
    const products = await getProductsByCategoryAndPlatform(category.CatID, platformId);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
