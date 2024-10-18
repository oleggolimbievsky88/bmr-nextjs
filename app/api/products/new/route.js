// app/api/products/new/route.js

import { NextResponse } from 'next/server';
import { getNewProducts } from '@/lib/queries';

export async function GET() {
  try {
    const newProducts = await getNewProducts();
    return NextResponse.json(newProducts);
  } catch (error) {
    console.error('Failed to fetch new products:', error);
    return NextResponse.json({ error: 'Failed to fetch new products' }, { status: 500 });
  }
}
