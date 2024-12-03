// import { getMainCategories } from '@/lib/queries'; // Import your query function

// export default async function GET(req, res) {
//   try {
//     const categories = await getMainCategories(); // Call the query function
//     res.status(200).json(categories); // Return the categories as JSON
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     res.status(500).json({ message: 'Failed to load categories.' });
//   }
// }

import { getPlatformsWithCategories } from '@/lib/queries';

// Helper function to clean platform data
const cleanPlatforms = (platforms) => {
  return platforms
    .filter((platform) => {
      // Exclude "Other" and other invalid platforms
      const isValidPlatform =
        platform.PlatformName !== "OTHER" &&
        platform.PlatformName !== "Miscellaneous Parts" &&
        platform.PlatformName !== "Gift Certificates" &&
        platform.PlatformName !== "0" &&
        platform.StartYear &&
        platform.EndYear;
      
      if (!isValidPlatform) {
        console.warn("Invalid platform data:", platform);
      }
      
      return isValidPlatform;
    })
    .map((platform) => ({
      ...platform,
      yearRange: `${platform.StartYear}-${platform.EndYear}`,
      href: `/platform/${platform.PlatformName.toLowerCase().replace(/ /g, "-")}`,
    }));
};

// Main API handler
export async function GET(req, res) {
  try {
    const rawPlatforms = await getPlatformsWithCategories();

    // Clean up the data
    const validPlatforms = cleanPlatforms(rawPlatforms);

    // Build the menu tree
    const menuTree = buildMenuTree(validPlatforms);

    res.status(200).json(menuTree);
  } catch (error) {
    console.error("Failed to fetch menu data:", error);
    res.status(500).json({ error: "Failed to fetch menu data" });
  }
}

// export async function GET(request, { params }) {
//   const { platformName } = params;

//   try {
//     const platform = await fetchPlatformByName(platformName, '2005', '2014'); // Example range
//     const mainCategories = await getMainCategoriesByPlatformId(platform.BodyID);

//     return NextResponse.json(mainCategories);
//   } catch (error) {
//     console.error('Error fetching main categories:', error.message);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
//  import { getMainCategoriesByPlatformId } from '@/lib/queries';


