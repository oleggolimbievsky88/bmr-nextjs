import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const make = searchParams.get('make');

    if (!year || !make) {
      return NextResponse.json({ error: 'Year and make are required' }, { status: 400 });
    }

    const models = await prisma.vehicles.findMany({
      where: {
        StartYear: year,
        Make: make,
      },
      select: {
        Model: true,
      },
      distinct: ['Model'],
      orderBy: {
        Model: 'asc',
      },
    });

    return NextResponse.json(models.map(model => model.Model));
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
} 