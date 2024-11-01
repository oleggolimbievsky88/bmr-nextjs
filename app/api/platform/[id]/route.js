// app/api/products/platform/[id]/route.js

import { NextResponse } from 'next/server';
import { getPlatformById } from '@/lib/queries';

export async function GET(request, { params }) {
  console.log('Route params:', params); // Debugging to check params
  
  const { id } = params; // Get platform ID from the route parameters

  if (!id) {
    console.error('Platform ID is missing in the route parameters');
    return NextResponse.json({ error: 'Platform ID is missing' }, { status: 400 });
  }

  try {
    const products = await getPlatformById(id);
    return NextResponse.json(products);
  } catch (error) {
    console.error(`Failed to fetch products for platform ${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
