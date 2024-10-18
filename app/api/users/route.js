// app/api/users/route.ts

import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Import the MySQL connection pool

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT PartNumber FROM products LIMIT 10'); // Example query
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
