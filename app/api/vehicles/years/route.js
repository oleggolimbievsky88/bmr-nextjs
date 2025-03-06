import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const years = await prisma.vehicles.findMany({
      select: {
        StartYear: true,
      },
      distinct: ['StartYear'],
      orderBy: {
        StartYear: 'desc',
      },
    });

    return NextResponse.json(years.map(year => year.StartYear));
  } catch (error) {
    console.error('Error fetching years:', error);
    return NextResponse.json({ error: 'Failed to fetch years' }, { status: 500 });
  }
} 