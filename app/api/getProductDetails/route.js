import { NextResponse } from 'next/server';
import {
  fetchProductByIdOrPartNumber,
  fetchPlatformForProduct,
  fetchCategoriesForPlatform,
  fetchProductsForPlatformAndCategory,
} from '@/lib/queries';

export async function GET(request) {
  try {
    // Extract query parameters from the URL
    const searchParams = new URL(request.url).searchParams;
    const productId = searchParams.get('productId');
    const partNumber = searchParams.get('partNumber');

    // Validate that either productId or partNumber is provided
    if (!productId && !partNumber) {
      return NextResponse.json(
        { error: 'Missing productId or partNumber parameter' },
        { status: 400 }
      );
    }

    // Fetch the product by ID or part number
    const product = await fetchProductByIdOrPartNumber(productId, partNumber);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch platform associated with the product
    const platform = await fetchPlatformForProduct(product.platformId);
    if (!platform) {
      return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
    }

    // Fetch main categories for the platform
    const categories = await fetchCategoriesForPlatform(platform.id);

    // Fetch products for the given platform and each category
    const productsByCategory = {};
    for (const category of categories) {
      const products = await fetchProductsForPlatformAndCategory(platform.id, category.id);
      productsByCategory[category.name] = products;
    }

    // Return all the gathered data
    return NextResponse.json({
      product,
      platform,
      categories,
      productsByCategory,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching product details:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
