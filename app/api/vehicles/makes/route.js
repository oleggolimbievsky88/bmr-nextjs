import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');

    if (!year) {
      return NextResponse.json({ error: 'Year is required' }, { status: 400 });
    }

    const makes = await prisma.vehicles.findMany({
      where: {
        StartYear: year,
      },
      select: {
        Make: true,
      },
      distinct: ['Make'],
      orderBy: {
        Make: 'asc',
      },
    });

    return NextResponse.json(makes.map(make => make.Make));
  } catch (error) {
    console.error('Error fetching makes:', error);
    return NextResponse.json({ error: 'Failed to fetch makes' }, { status: 500 });
  }
} 