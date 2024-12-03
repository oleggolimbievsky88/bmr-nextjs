// /app/api/categories/[platformName]/[categorySlug]/route.js
import { NextResponse } from 'next/server';
import { fetchPlatformByName, getCategoriesByPlatformAndSlug } from '@/lib/queries';

export async function GET(req, { params }) {
  const { platformName, categorySlug } = params;

  try {
    // Define the start and end years (could be dynamic or use the current year as fallback)
    const currentYear = new Date().getFullYear();
    const startYear = currentYear;
    const endYear = currentYear;

    // Fetch the platform with name and specified year constraints
    const platform = await fetchPlatformByName(platformName, startYear, endYear);
    const platformId = platform.BodyID; // `BodyID` from `bodies` table

    // Fetch categories by platform ID and optional category slug
    const categories = await getCategoriesByPlatformAndSlug(platformId, categorySlug);

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
