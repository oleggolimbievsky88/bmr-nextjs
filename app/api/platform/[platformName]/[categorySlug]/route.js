// import { NextResponse } from 'next/server';
// import { fetchPlatformByYearAndName, getMainCategoriesByPlatformId } from '@/lib/queries';

// export async function GET(request, { params }) {
//   const { platformName } = params;

//   // Extract the year from the query string
//   const { searchParams } = new URL(request.url);
//   const year = searchParams.get('year'); // Example: /api/platform/Mustang/maincategories?year=2023

//   if (!year) {
//     return NextResponse.json(
//       { error: 'Year is required to fetch main categories' },
//       { status: 400 }
//     );
//   }

//   try {
//     // Fetch platform details by name and year
//     const platform = await fetchPlatformByYearAndName(platformName, year);
//     if (!platform) {
//       return NextResponse.json(
//         { error: `Platform "${platformName}" for year "${year}" not found` },
//         { status: 404 }
//       );
//     }

//     const platformId = platform.BodyID;

//     // Fetch main categories for the platform
//     const mainCategories = await getMainCategoriesByPlatformId(platformId);

//     if (!mainCategories || mainCategories.length === 0) {
//       return NextResponse.json(
//         { error: 'No categories found for this platform and year' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(mainCategories);
//   } catch (error) {
//     console.error('Error fetching main categories:', error.message);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import { fetchPlatformByYearAndName, getMainCategoriesByPlatformId } from '@/lib/queries';

export async function GET(request, { params }) {
  const { platformName } = params;

  // Extract the year from the query string
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');

  console.log('Fetching main categories for platform:', platformName, year);

  if (!year) {
    return NextResponse.json(
      { error: 'Year is required to fetch main categories' },
      { status: 400 }
    );
  }

  try {
    console.log('Fetching platform by name and year:', platformName, year);

    // Fetch platform details by name and year
    const platform = await fetchPlatformByYearAndName(platformName, year);
    console.log('Platform found:', platform);

    if (!platform) {
      return NextResponse.json(
        { error: `Platform "${platformName}" for year "${year}" not found` },
        { status: 404 }
      );
    }

    const platformId = platform.BodyID;

    console.log('Fetching main categories for platform:', platformId);

    // Fetch main categories for the platform
    const mainCategories = await getMainCategoriesByPlatformId(platformId);
    console.log('Main categories:', mainCategories);

    if (!mainCategories || mainCategories.length === 0) {
      return NextResponse.json(
        { error: 'No categories found for this platform and year' },
        { status: 404 }
      );
    }

    return NextResponse.json(mainCategories);
  } catch (error) {
    console.error('Error in API route:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

