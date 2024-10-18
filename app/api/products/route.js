// app/api/products/route.js

import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/queries';

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
