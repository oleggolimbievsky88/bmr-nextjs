import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { platformName } = params;

  try {
    const query = `
      SELECT * FROM platforms
      WHERE name = ?
    `;
    const [rows] = await pool.query(query, [platformName]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Failed to fetch platform:', error);
    return NextResponse.json({ error: 'Failed to fetch platform' }, { status: 500 });
  }
} 