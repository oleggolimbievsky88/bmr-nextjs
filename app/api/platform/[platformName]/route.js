// app/api/platform/[platformName]/route.js
import { getCategoriesByPlatform } from '@/lib/queries';  // Update with your DB module

export async function GET(req, { params }) {
  const { platformName } = params;

  // Debugging the platform name
  console.log(`Received platform name: ${platformName}`);

  // Extract startYear, endYear, and platform name (e.g., 2002-2009-trailblazer)
  const regex = /^(\d{4})-(\d{4})-(.*)$/;
  const matches = platformName.match(regex);

  console.log(`Matches: ${matches}`);

  if (!matches) {
    console.log(`Invalid platform format: ${platformName}`);
    return new Response(
      JSON.stringify({ error: 'Invalid platform format. Expected format: "startYear-endYear-platform".' }),
      { status: 400 }
    );
  }

  const [_, startYear, endYear, name] = matches;

  // Log extracted values
  console.log(`Extracted startYear: ${startYear}, endYear: ${endYear}, name: ${name}`);

  try {
    // Fetch categories based on platform name and year range
    const categories = await getCategoriesByPlatform(name, startYear, endYear);
    return new Response(JSON.stringify(categories), { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

