// app/api/platform/[id]/vehicles/route.js

import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Assuming a db connection or helper function
import { getVehiclesByPlatformId } from '@/lib/queries';

export async function GET(request, { params }) {
  const platformId = params.id;

  try {
    // Query to get all vehicles for the given platform ID
    const vehicles = await getVehiclesByPlatformId(platformId);
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Failed to fetch vehicles:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}
