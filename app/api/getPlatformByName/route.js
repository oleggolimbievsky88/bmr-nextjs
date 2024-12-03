// /app/api/getPlatformByName/route.js
import { NextResponse } from 'next/server';
import { fetchPlatformByName } from '@/lib/queries';
import { validatePlatformParams } from '@/utils/validators';

export async function GET(request) {
  try {
    // Extract query parameters from the URL
    const searchParams = new URL(request.url).searchParams;
    const name = searchParams.get('name');
    const startYear = searchParams.get('startYear');
    const endYear = searchParams.get('endYear');

    // Validate parameters
    if (!validatePlatformParams(name, startYear, endYear)) {
      return NextResponse.json(
        { error: 'Invalid name, startYear, or endYear parameters' },
        { status: 400 }
      );
    }

    // Fetch platform using the query
    const platform = await fetchPlatformByName(name, parseInt(startYear), parseInt(endYear));

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform not found' },
        { status: 404 }
      );
    }

    // Return the platform data as JSON
    return NextResponse.json(platform, { status: 200 });
  } catch (error) {
    console.error('Error fetching platform:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
