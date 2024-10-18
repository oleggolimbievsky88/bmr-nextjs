// app/api/products/[id]/route.js

import { NextResponse } from 'next/server';
import { getProductById } from '@/lib/queries'; // Import the query function

export async function GET(request, { params }) {
  try {
    const product = await getProductById(params.id); // Fetch product by ID
    return NextResponse.json(product);
  } catch (error) {
    console.error(`Failed to fetch product with id ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  }
}
