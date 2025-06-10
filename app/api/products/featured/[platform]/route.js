import { NextResponse } from 'next/server';
import { getFeaturedProductsByPlatform } from '@/lib/queries';

export async function GET(request, { params }) {
  try {
    const { platform } = params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 8;

    const products = await getFeaturedProductsByPlatform(platform, limit);
    return NextResponse.json(products);
    
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: error.message === 'Platform not found' ? 404 : 500 }
    );
  }
}