import { getNewProducts } from '@/lib/queries';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const scrachDent = searchParams.get('scrachDent') || '0';

  try {
    const newProducts = await getNewProducts(scrachDent);
    return NextResponse.json(newProducts);
  } catch (error) {
    console.error('Failed to fetch new products:', error);
    return NextResponse.json({ error: 'Failed to fetch new products' }, { status: 500 });
  }
} 